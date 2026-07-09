import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SECTION_KEYS, type SubmissionData } from "@/lib/types/submission";
import { verifyOrigin } from "@/lib/csrf";

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

  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: "SUBMITTED",
      rejectionNote: null,
      reviewedById: null,
      reviewedAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "Submission Submitted",
      description: `${session.name} submitted the ${year} annual report for ${submission.gnDivision}`,
      category: "DATA",
      severity: "SUCCESS",
      userId: session.userId,
      userName: session.name,
      metadata: { submissionId: submission.id, year },
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
