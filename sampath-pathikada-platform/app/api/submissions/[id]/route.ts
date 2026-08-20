import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";
import { REVIEWER_ROLES, isOutOfScope } from "@/lib/review-scope";
import { parseSectionReviews, isUnderReview } from "@/lib/submission-review";
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

/* ── PATCH /api/submissions/[id] ── whole-submission Reject ─────────────────────────────────────
 * Per-section decisions (including approval) go through PATCH /api/submissions/[id]/sections/[section]
 * instead — that's the only way to approve a section, deliberately, so AD/DS must review every
 * section individually rather than bulk-approving everything still pending in one click. This
 * route now only handles Reject, the one action that's still genuinely whole-submission: the
 * submission is unusable as a whole, not a per-section judgment. */
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
  if (action !== "reject") {
    return NextResponse.json({ ok: false, message: "Action must be: reject." }, { status: 400 });
  }
  if (!note?.trim()) {
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

      // A whole-submission reject is a full restart, not a targeted revision request — whoever
      // rejects it (AD or DS), the resubmitted version must be reviewed by AD again from scratch
      // before DS sees it, same as a brand-new submission. This is deliberately different from a
      // per-section REVISION_NEEDED flag at the DS stage, which intentionally skips back to AD
      // only for the flagged section (see deriveSubmissionStatus in lib/submission-review.ts).
      return tx.submission.update({
        where: { id },
        data: { status: "REJECTED", reviewStage: "AD", rejectionNote: note.trim(), sectionReviews: {}, reviewedById: session.userId, reviewedAt },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 }
  );

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }

  logAudit({
    action: "Submission REJECTED",
    description: `${session.name} rejected submission ${id} (${submission.gnDivision}, ${submission.year})`,
    category: "DATA",
    severity: "WARNING",
    userId: session.userId,
    userName: session.name,
    metadata: { submissionId: id, year: submission.year, note: note ?? null, reviewStage: updated.reviewStage },
  });

  return NextResponse.json({ ok: true, data: updated });
}
