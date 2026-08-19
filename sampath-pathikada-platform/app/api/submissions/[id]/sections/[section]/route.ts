import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";
import { REVIEWER_ROLES, isOutOfScope } from "@/lib/review-scope";
import { isSectionKey } from "@/lib/types/submission";
import { parseSectionReviews, deriveSubmissionStatus, isUnderReview, type SectionReview } from "@/lib/submission-review";
import { logAudit } from "@/lib/audit-log";

/* ── PATCH /api/submissions/[id]/sections/[section] ── approve / request revision for one section ──
 * Companion to PATCH /api/submissions/[id], which now only handles whole-submission Reject and
 * "Approve All Remaining". This is the per-section decision endpoint. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; section: string }> }) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || !REVIEWER_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id, section } = await params;
  if (!isSectionKey(section)) {
    return NextResponse.json({ ok: false, message: "Unknown section." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const { action, note } = (body ?? {}) as { action?: string; note?: string };
  const ACTION_TO_DECISION: Record<string, "APPROVED" | "REVISION_NEEDED"> = {
    approve: "APPROVED",
    "request-revision": "REVISION_NEEDED",
  };
  const nextDecision = action ? ACTION_TO_DECISION[action] : undefined;
  if (!nextDecision) {
    return NextResponse.json({ ok: false, message: "Action must be one of: approve, request-revision." }, { status: 400 });
  }
  if (nextDecision === "REVISION_NEEDED" && !note?.trim()) {
    return NextResponse.json({ ok: false, message: "A note explaining the requested revision is required." }, { status: 400 });
  }

  const existing = await prisma.submission.findUnique({ where: { id } });
  if (!existing || isOutOfScope(session, existing)) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }
  if (!isUnderReview(existing.status)) {
    return NextResponse.json(
      { ok: false, message: "Only a submission that's under review can have a section decision recorded." },
      { status: 409 }
    );
  }

  const reviewedAt = new Date();

  // Two writers can now touch `sectionReviews` on the same row concurrently — the DS approving a
  // different section, or the officer resubmitting one via PATCH /api/my-submission/[year] — so
  // this needs a locking read, not a plain read-modify-write. Under MySQL's default REPEATABLE
  // READ, a plain `$transaction` wrapping a nonlocking SELECT does NOT prevent a lost update: the
  // later UPDATE blocks until the first commits, then silently overwrites with its own stale
  // snapshot. `SELECT ... FOR UPDATE` first forces both transactions to serialize on this row.
  const updated = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM submissions WHERE id = ${id} FOR UPDATE`;
      const row = await tx.submission.findUnique({ where: { id } });
      if (!row) return null;

      const entry: SectionReview = {
        status: nextDecision,
        note: nextDecision === "REVISION_NEEDED" ? note!.trim() : (note?.trim() || null),
        reviewedById: session.userId,
        reviewedAt: reviewedAt.toISOString(),
      };
      const nextReviews = { ...parseSectionReviews(row.sectionReviews), [section]: entry };
      const nextStatus = deriveSubmissionStatus(nextReviews, row.reviewStage);

      const result = await tx.submission.update({
        where: { id },
        data: {
          sectionReviews: nextReviews as Prisma.InputJsonValue,
          status: nextStatus.status,
          reviewStage: nextStatus.reviewStage,
          reviewedById: session.userId,
          reviewedAt,
        },
      });

      // All 15 sections just became approved at the DS stage — snapshot the submission as the
      // division's official record, same as whole-submission approval always has. Sourced from
      // `row` (read inside this transaction), not the pre-transaction `existing` read above, so a
      // concurrent edit can't slip an unreviewed change into the snapshot. This never fires at AD
      // stage completion (that transitions to AD_APPROVED, not APPROVED) — by construction, only
      // DS-stage completion can reach status "APPROVED".
      if (nextStatus.status === "APPROVED") {
        await tx.divisionProfile.upsert({
          where: { gnDivision: row.gnDivision },
          create: {
            district: row.district,
            dsDivision: row.dsDivision,
            gnDivision: row.gnDivision,
            data: row.data as object,
            sourceSubmissionId: row.id,
            year: row.year,
            approvedById: session.userId,
            approvedAt: reviewedAt,
          },
          update: {
            district: row.district,
            dsDivision: row.dsDivision,
            data: row.data as object,
            sourceSubmissionId: row.id,
            year: row.year,
            approvedById: session.userId,
            approvedAt: reviewedAt,
          },
        });
      }

      return result;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 }
  );

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }

  // Logged at INFO, not WARNING — the DS's own "Data Quality Alerts" dashboard card filters
  // category=DATA && severity IN (WARNING, ERROR) && user.dsDivision = session.dsDivision, so a
  // DS's own per-section WARNING logs would flood their own alerts feed with their own actions.
  logAudit({
    action: `Section ${nextDecision}`,
    description:
      nextDecision === "APPROVED"
        ? `${session.name} approved section "${section}" of submission ${id} (${existing.gnDivision}, ${existing.year})`
        : `${session.name} requested a revision of section "${section}" on submission ${id} (${existing.gnDivision}, ${existing.year})`,
    category: "DATA",
    severity: "INFO",
    userId: session.userId,
    userName: session.name,
    metadata: { submissionId: id, year: existing.year, section, note: note ?? null, overallStatus: updated.status, reviewStage: updated.reviewStage },
  });

  return NextResponse.json({ ok: true, data: updated });
}
