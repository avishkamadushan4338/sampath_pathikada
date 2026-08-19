import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SECTION_KEYS, type SubmissionData } from "@/lib/types/submission";
import { parseSectionReviews, deriveSubmissionStatus } from "@/lib/submission-review";
import { verifyOrigin } from "@/lib/csrf";
import { logAudit } from "@/lib/audit-log";

function parseYear(raw: string): number | null {
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  return year;
}

/* ── POST /api/submissions/[year]/submit ── DRAFT/REVISION_NEEDED → SUBMITTED ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ year: string }> }) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "ECONOMIC_DEVELOPMENT_OFFICER") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { year: yearParam } = await params;
  const year = parseYear(yearParam);
  if (year === null) {
    return NextResponse.json({ ok: false, message: "Invalid year." }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { submittedById_year: { submittedById: session.userId, year } },
  });
  if (!submission) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }
  if (submission.submittedById !== session.userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (submission.status !== "DRAFT" && submission.status !== "REVISION_NEEDED") {
    return NextResponse.json(
      { ok: false, message: "This submission has already been submitted." },
      { status: 409 }
    );
  }

  const data = (submission.data ?? {}) as SubmissionData;
  const missing = SECTION_KEYS.filter((key) => data[key] == null);
  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "All sections must be saved at least once before submitting.",
        missingSections: missing,
      },
      { status: 400 }
    );
  }

  // Resubmitting from REVISION_NEEDED clears only the sections that were actually flagged (back
  // to pending, so the same reviewer stage looks at them again) and keeps any sections already
  // approved — a fresh DRAFT submission has no reviews yet, so this is a no-op for the
  // first-time-submit case and `deriveSubmissionStatus` correctly returns "SUBMITTED" either way.
  // reviewedById/At are left as-is (not nulled) since they now track "who last decided on any
  // section", which a resubmit shouldn't erase for the sections that remain approved.
  //
  // `row.reviewStage` is passed straight through unchanged here (never itself set by this
  // route) — it was preserved exactly as AD or DS last left it, which is what makes "resubmit
  // returns to whoever flagged it" work automatically: if AD flagged a section, reviewStage was
  // never advanced past "AD", so this resubmit lands back on SUBMITTED/reviewStage "AD"; if DS
  // flagged a section (only possible once AD had already cleared everything, advancing
  // reviewStage to "DS"), this resubmit lands back on AD_APPROVED/reviewStage "DS" — skipping AD,
  // since AD's earlier full approval isn't re-litigated for sections AD never flagged. A whole-
  // submission Reject (as opposed to a per-section revision flag) is the one case that DOES reset
  // `reviewStage` — back to "AD" — at reject time (see PATCH /api/submissions/[id]), so a REJECTED
  // resubmit always restarts at AD regardless of who rejected it.
  //
  // A reviewer could be deciding a different section at the same moment the officer clicks this
  // button — same `sectionReviews` race as the review routes, same locking-read fix.
  const updated = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM submissions WHERE id = ${submission.id} FOR UPDATE`;
      const row = await tx.submission.findUnique({ where: { id: submission.id } });
      if (!row) return null;

      const nextReviews = { ...parseSectionReviews(row.sectionReviews) };
      for (const key of SECTION_KEYS) {
        if (nextReviews[key]?.status === "REVISION_NEEDED") delete nextReviews[key];
      }

      const nextStatus = deriveSubmissionStatus(nextReviews, row.reviewStage);

      return tx.submission.update({
        where: { id: row.id },
        data: {
          status: nextStatus.status,
          reviewStage: nextStatus.reviewStage,
          sectionReviews: nextReviews as Prisma.InputJsonValue,
          rejectionNote: null,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 }
  );

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }

  logAudit({
    action: "Submission Submitted",
    description: `${session.name} submitted the ${year} annual report for ${submission.gnDivision}`,
    category: "DATA",
    severity: "SUCCESS",
    userId: session.userId,
    userName: session.name,
    metadata: { submissionId: submission.id, year },
  });

  return NextResponse.json({ ok: true, data: updated });
}
