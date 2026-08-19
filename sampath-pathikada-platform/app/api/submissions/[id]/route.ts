import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";
import { REVIEWER_ROLES, isOutOfScope } from "@/lib/review-scope";
import { SECTION_KEYS } from "@/lib/types/submission";
import { parseSectionReviews, deriveSubmissionStatus, isUnderReview, type SectionReviews } from "@/lib/submission-review";
import { logAudit } from "@/lib/audit-log";

/* ── GET /api/submissions/[id] ── reviewer view of one officer's submission ──── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !REVIEWER_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { submittedBy: { select: { id: true, name: true, email: true, phone: true, nic: true } } },
  });

  if (!submission || isOutOfScope(session, submission)) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }

  // `sectionReviews` only stores each reviewer's user id (`reviewedById`), not their name — resolve
  // the small, bounded set of distinct reviewers on this submission (at most one AD and one DS,
  // per the one-active-reviewer-per-division rule enforced at registration-approval time) to
  // display names, same join philosophy as `submittedBy` above but the JSON column can't express
  // a real Prisma relation, so this needs its own lookup rather than an `include`.
  const reviewedByIds = new Set<string>();
  if (submission.reviewedById) reviewedByIds.add(submission.reviewedById);
  for (const review of Object.values(parseSectionReviews(submission.sectionReviews))) {
    if (review) reviewedByIds.add(review.reviewedById);
  }
  const reviewerNames: Record<string, { name: string; role: string }> = {};
  if (reviewedByIds.size > 0) {
    const reviewers = await prisma.user.findMany({
      where: { id: { in: [...reviewedByIds] } },
      select: { id: true, name: true, role: true },
    });
    for (const r of reviewers) reviewerNames[r.id] = { name: r.name, role: r.role };
  }

  return NextResponse.json({ ok: true, data: { ...submission, reviewerNames } });
}

/* ── PATCH /api/submissions/[id] ── whole-submission Reject, or "Approve All Remaining" ──────────
 * Per-section decisions go through PATCH /api/submissions/[id]/sections/[section] instead — that
 * endpoint superseded this one's old "approve"/"request-revision" single-decision actions. This
 * route now only handles the two actions that are still genuinely whole-submission: Reject (the
 * submission is unusable as a whole) and "approve" as a convenience that approves every section
 * still pending review in one click, without touching sections already decided either way. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || !REVIEWER_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const { action, note } = (body ?? {}) as { action?: string; note?: string };
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ ok: false, message: "Action must be one of: approve, reject." }, { status: 400 });
  }
  if (action === "reject" && !note?.trim()) {
    return NextResponse.json({ ok: false, message: "A note explaining the decision is required for this action." }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission || isOutOfScope(session, submission)) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }
  if (!isUnderReview(submission.status)) {
    return NextResponse.json(
      { ok: false, message: "Only a submission that's under review can be decided." },
      { status: 409 }
    );
  }

  const reviewedAt = new Date();

  // Same locking-read pattern as the per-section route — this can run concurrently with a
  // per-section decision or an officer's resubmit-on-save, both of which also touch
  // `sectionReviews` on this row.
  const updated = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM submissions WHERE id = ${id} FOR UPDATE`;
      const row = await tx.submission.findUnique({ where: { id } });
      if (!row) return null;

      if (action === "reject") {
        // A whole-submission reject is a full restart, not a targeted revision request — whoever
        // rejects it (AD or DS), the resubmitted version must be reviewed by AD again from
        // scratch before DS sees it, same as a brand-new submission. This is deliberately
        // different from a per-section REVISION_NEEDED flag at the DS stage, which intentionally
        // skips back to AD only for the flagged section (see deriveSubmissionStatus).
        return tx.submission.update({
          where: { id },
          data: { status: "REJECTED", reviewStage: "AD", rejectionNote: note!.trim(), sectionReviews: {}, reviewedById: session.userId, reviewedAt },
        });
      }

      // "approve" — fill in every still-pending section as approved; leave sections already
      // decided (approved, or still flagged for revision) exactly as they are.
      const currentReviews = parseSectionReviews(row.sectionReviews);
      const nextReviews: SectionReviews = { ...currentReviews };
      for (const key of SECTION_KEYS) {
        if (!nextReviews[key]) {
          nextReviews[key] = { status: "APPROVED", note: null, reviewedById: session.userId, reviewedAt: reviewedAt.toISOString() };
        }
      }
      const nextStatus = deriveSubmissionStatus(nextReviews, row.reviewStage);

      const result = await tx.submission.update({
        where: { id },
        data: {
          sectionReviews: nextReviews as Prisma.InputJsonValue,
          status: nextStatus.status,
          reviewStage: nextStatus.reviewStage,
          reviewedById: session.userId,
          reviewedAt,
          rejectionNote: null,
        },
      });

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

  logAudit({
    action: action === "reject" ? "Submission REJECTED" : `Submission ${updated.status}`,
    description:
      action === "reject"
        ? `${session.name} rejected submission ${id} (${submission.gnDivision}, ${submission.year})`
        : updated.status === "APPROVED"
          ? `${session.name} approved all remaining sections of submission ${id} (${submission.gnDivision}, ${submission.year}) — saved as the division's official record`
          : updated.status === "AD_APPROVED"
            ? `${session.name} approved all remaining sections of submission ${id} (${submission.gnDivision}, ${submission.year}) — forwarded to Divisional Secretariat for review`
            : `${session.name} approved all remaining sections of submission ${id} (${submission.gnDivision}, ${submission.year})`,
    category: "DATA",
    severity: action === "reject" ? "WARNING" : updated.status === "APPROVED" ? "SUCCESS" : "INFO",
    userId: session.userId,
    userName: session.name,
    metadata: { submissionId: id, year: submission.year, note: note ?? null, reviewStage: updated.reviewStage },
  });

  return NextResponse.json({ ok: true, data: updated });
}
