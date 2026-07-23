import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";

const REVIEWER_ROLES = ["DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"];

/** A Divisional Secretariat outside a submission's DS division must see the same
 *  404 as a genuinely-missing submission — a 403 would leak that a submission
 *  exists somewhere outside their authorization boundary. */
function isOutOfScope(session: { role: string; dsDivision: string | null }, submissionDsDivision: string): boolean {
  return session.role === "DIVISIONAL_SECRETARIAT" && submissionDsDivision !== session.dsDivision;
}

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

  if (!submission || isOutOfScope(session, submission.dsDivision)) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: submission });
}

/* ── PATCH /api/submissions/[id] ── approve / reject / request revision ──────── */
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
  const ACTION_TO_STATUS: Record<string, "APPROVED" | "REJECTED" | "REVISION_NEEDED"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    "request-revision": "REVISION_NEEDED",
  };
  const nextStatus = action ? ACTION_TO_STATUS[action] : undefined;
  if (!nextStatus) {
    return NextResponse.json(
      { ok: false, message: "Action must be one of: approve, reject, request-revision." },
      { status: 400 }
    );
  }
  if ((nextStatus === "REJECTED" || nextStatus === "REVISION_NEEDED") && !note?.trim()) {
    return NextResponse.json(
      { ok: false, message: "A note explaining the decision is required for this action." },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission || isOutOfScope(session, submission.dsDivision)) {
    return NextResponse.json({ ok: false, message: "Submission not found." }, { status: 404 });
  }
  if (submission.status !== "SUBMITTED") {
    return NextResponse.json(
      { ok: false, message: "Only submissions with status SUBMITTED can be reviewed." },
      { status: 409 }
    );
  }

  const reviewedAt = new Date();

  const [updated] = await prisma.$transaction([
    prisma.submission.update({
      where: { id },
      data: {
        status: nextStatus,
        rejectionNote: nextStatus === "APPROVED" ? null : (note?.trim() ?? null),
        reviewedById: session.userId,
        reviewedAt,
      },
    }),
    // Approval freezes the submission's data as the division's official record —
    // this is the only place DivisionProfile is written. It is keyed by gnDivision,
    // so approving a later year's submission for the same division overwrites (not
    // duplicates) the previous snapshot: it always reflects the latest approved data.
    ...(nextStatus === "APPROVED"
      ? [
          prisma.divisionProfile.upsert({
            where: { gnDivision: submission.gnDivision },
            create: {
              district: submission.district,
              dsDivision: submission.dsDivision,
              gnDivision: submission.gnDivision,
              data: submission.data as object,
              sourceSubmissionId: submission.id,
              year: submission.year,
              approvedById: session.userId,
              approvedAt: reviewedAt,
            },
            update: {
              district: submission.district,
              dsDivision: submission.dsDivision,
              data: submission.data as object,
              sourceSubmissionId: submission.id,
              year: submission.year,
              approvedById: session.userId,
              approvedAt: reviewedAt,
            },
          }),
        ]
      : []),
  ]);

  await prisma.auditLog.create({
    data: {
      action: `Submission ${nextStatus}`,
      description:
        nextStatus === "APPROVED"
          ? `${session.name} approved submission ${id} (${submission.gnDivision}, ${submission.year}) — saved as the division's official record`
          : `${session.name} set submission ${id} (${submission.gnDivision}, ${submission.year}) to ${nextStatus}`,
      category: "DATA",
      severity: nextStatus === "APPROVED" ? "SUCCESS" : "WARNING",
      userId: session.userId,
      userName: session.name,
      metadata: { submissionId: id, year: submission.year, note: note ?? null },
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
