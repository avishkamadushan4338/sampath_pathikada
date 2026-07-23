import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSectionKey } from "@/lib/types/submission";
import { getSectionPartialSchema } from "@/lib/validators/section-registry";
import { verifyOrigin } from "@/lib/csrf";

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
  if (submission.status === "SUBMITTED" || submission.status === "APPROVED") {
    return NextResponse.json(
      { ok: false, message: "This submission has already been submitted and can no longer be edited." },
      { status: 409 }
    );
  }

  const schema = getSectionPartialSchema(section);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Validation failed.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const currentData = (submission.data ?? {}) as Record<string, unknown>;
  const nextData = { ...currentData, [section]: parsed.data };

  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: { data: nextData },
  });

  await prisma.auditLog.create({
    data: {
      action: "Submission Section Saved",
      description: `${session.name} saved section "${section}" of the ${year} submission`,
      category: "DATA",
      severity: "INFO",
      userId: session.userId,
      userName: session.name,
      metadata: { submissionId: submission.id, year, section },
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
