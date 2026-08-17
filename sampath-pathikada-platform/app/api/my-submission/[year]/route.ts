import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSectionKey } from "@/lib/types/submission";
import { getSectionPartialSchema } from "@/lib/validators/section-registry";
import { POPULATION_MISMATCH_ERROR_PREFIX } from "@/lib/validators/sections/demographics";
import { parseSectionReviews, deriveSubmissionStatus, getSectionEditability } from "@/lib/submission-review";
import { verifyOrigin } from "@/lib/csrf";
import { logAudit } from "@/lib/audit-log";

function parseYear(raw: string): number | null {
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  return year;
}

/* ── GET /api/submissions/[year] ── get-or-create the officer's own submission ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ year: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ECONOMIC_DEVELOPMENT_OFFICER") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { year: yearParam } = await params;
  const year = parseYear(yearParam);
  if (year === null) {
    return NextResponse.json({ ok: false, message: "Invalid year." }, { status: 400 });
  }

  const existing = await prisma.submission.findUnique({
    where: { submittedById_year: { submittedById: session.userId, year } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, data: existing });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { district: true, dsDivision: true, gnDivision: true },
  });
  if (!user?.district || !user.dsDivision || !user.gnDivision) {
    return NextResponse.json(
      { ok: false, message: "Your account is missing a geographic assignment. Contact an administrator." },
      { status: 400 }
    );
  }

  // Seed a brand-new draft from the division's last approved record, if one exists,
  // so the officer updates the existing official data instead of starting blank.
  const profile = await prisma.divisionProfile.findUnique({
    where: { gnDivision: user.gnDivision },
    select: { data: true },
  });

  const created = await prisma.submission.create({
    data: {
      submittedById: session.userId,
      year,
      district: user.district,
      dsDivision: user.dsDivision,
      gnDivision: user.gnDivision,
      data: profile?.data ?? {},
      status: "DRAFT",
    },
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}

/* ── PATCH /api/submissions/[year] ── replace one section's data ─────────────── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ year: string }> }) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const { section, data } = (body ?? {}) as { section?: string; data?: unknown };
  if (!section || !isSectionKey(section)) {
    return NextResponse.json({ ok: false, message: "Unknown section." }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { submittedById_year: { submittedById: session.userId, year } },
  });
  if (!submission) {
    return NextResponse.json({ ok: false, message: "Submission not found. Load the dashboard first." }, { status: 404 });
  }
  if (submission.submittedById !== session.userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Per-section lock: a section stays editable pre-submission (DRAFT) or after a whole-submission
  // Reject, and becomes editable again specifically once the DS flags *that* section for
  // revision — never merely because some other section is still pending or flagged, and never
  // once a DS has already approved it. See lib/submission-review.ts for the full rule; this is
  // the real security boundary, SectionForm.tsx's client-side lock is UX only.
  const editability = getSectionEditability(submission.status, parseSectionReviews(submission.sectionReviews), section);
  if (editability === "locked-approved" || editability === "locked-submitted") {
    return NextResponse.json(
      {
        ok: false,
        message:
          editability === "locked-approved"
            ? "This section has already been approved and can no longer be edited."
            : "This section has been submitted and is awaiting review.",
        code: editability === "locked-approved" ? "SECTION_LOCKED_APPROVED" : "SECTION_LOCKED_SUBMITTED",
      },
      { status: 409 }
    );
  }
  const isResubmit = editability === "revision-needed";

  const schema = getSectionPartialSchema(section);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    // A routine "still filling this in" required-field error is expected and needs no attention
    // beyond what the officer already sees. A population-total mismatch is different — the
    // numbers the officer entered are internally inconsistent (the same population counted three
    // different ways gives three different answers), which is worth a Divisional
    // Secretariat/Super Admin flag even though (per policy) it still doesn't block the save
    // itself succeeding once corrected — the flag exists precisely because it *can't* fail here.
    const isPopulationMismatch =
      section === "demographics" && parsed.error.issues.some((issue) => issue.message.startsWith(POPULATION_MISMATCH_ERROR_PREFIX));

    if (isPopulationMismatch) {
      logAudit({
        action: "Invalid Demographic Data Attempted",
        description: `${session.name} attempted to save Demographics data for the ${year} submission with population totals that don't match across the Age, Ethnicity, and Religion breakdowns.`,
        category: "DATA",
        severity: "ERROR",
        userId: session.userId,
        userName: session.name,
        metadata: { submissionId: submission.id, year, section, issues: parsed.error.flatten() },
      });
    }

    return NextResponse.json(
      { ok: false, message: "Validation failed.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Locking read first: while this section is under revision, the DS can concurrently decide a
  // different section (or the officer could resubmit twice in quick succession) — both write
  // `sectionReviews` on the same row, and a plain read-modify-write can silently lose one of the
  // two writes. Same pattern as the review routes in app/api/submissions/[id]/**.
  const updated = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM submissions WHERE id = ${submission.id} FOR UPDATE`;
      const row = await tx.submission.findUnique({ where: { id: submission.id } });
      if (!row) return null;

      const currentData = (row.data ?? {}) as Record<string, unknown>;
      const nextData = { ...currentData, [section]: parsed.data };

      // Resubmitting a revision-needed section clears its flag and puts the submission back in
      // the DS's queue for re-review — the officer's only action is the same Save button they
      // already use for everything else.
      let nextReviews = parseSectionReviews(row.sectionReviews);
      let nextStatus = row.status;
      if (isResubmit) {
        nextReviews = { ...nextReviews };
        delete nextReviews[section];
        nextStatus = deriveSubmissionStatus(nextReviews);
      }

      return tx.submission.update({
        where: { id: row.id },
        // Prisma's InputJsonValue requires an index signature, which a plain TS interface
        // (SectionReview) doesn't have — the cast is safe because parseSectionReviews/callers
        // are the only producers of this shape and it's a plain serializable object.
        data: { data: nextData, sectionReviews: nextReviews as Prisma.InputJsonValue, status: nextStatus },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 }
  );

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Submission not found. Load the dashboard first." }, { status: 404 });
  }

  logAudit({
    action: "Submission Section Saved",
    description: `${session.name} saved section "${section}" of the ${year} submission`,
    category: "DATA",
    severity: "INFO",
    userId: session.userId,
    userName: session.name,
    metadata: { submissionId: submission.id, year, section, resubmittedSection: isResubmit },
  });

  return NextResponse.json({ ok: true, data: updated });
}
