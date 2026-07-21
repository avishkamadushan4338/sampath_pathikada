import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { DIVISIONAL_SECRETARIATS } from "@/lib/registration-data";
import { verifyOrigin } from "@/lib/csrf";
import { CURRENT_YEAR } from "@/lib/constants";
import type { SubmissionData } from "@/lib/types/submission";

/* ── GET /api/users ── list users ─────────────────────────────────────────────
   SUPER_ADMIN sees all users. ADMIN is scoped to their own dsDivision only,
   view access only (see POST/PATCH/DELETE below, which are SUPER_ADMIN-only),
   and never sees other ADMIN accounts — admin-account visibility/management
   is a SUPER_ADMIN-only concern. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const role   = searchParams.get("role")   ?? undefined;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status.toUpperCase();
  if (role   && role   !== "all") where.role   = role.toUpperCase().replace("-", "_");
  if (search) {
    where.OR = [
      { name:  { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (session.role === "ADMIN") {
    where.dsDivision = session.dsDivision;
    where.role = { not: "ADMIN" };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nameSinhala: true, email: true, phone: true,
      role: true, status: true, district: true, dsDivision: true, gnDivision: true,
      localGovt: true, electoral: true, farmers: true, eduZone: true, eduDiv: true, mahaweli: true,
      lastLoginAt: true, createdAt: true,
    },
  });

  // Designation is entered by the officer per reporting cycle (inside their own
  // submission), not stored on the User profile — pull it from this year's
  // submission, if one exists, for each Economic Development Officer returned.
  const edoIds = users.filter((u) => u.role === "ECONOMIC_DEVELOPMENT_OFFICER").map((u) => u.id);
  const designationByUserId = new Map<string, string | null>();
  if (edoIds.length > 0) {
    const submissions = await prisma.submission.findMany({
      where: { submittedById: { in: edoIds }, year: CURRENT_YEAR },
      select: { submittedById: true, data: true },
    });
    for (const s of submissions) {
      const data = s.data as SubmissionData;
      designationByUserId.set(s.submittedById, data.identification?.officerDesignation ?? null);
    }
  }

  const data = users.map((u) => ({
    ...u,
    officerDesignation: designationByUserId.get(u.id) ?? null,
  }));

  return NextResponse.json({ ok: true, data });
}

/* ── POST /api/users ── create an admin account ──────────────────────────────
   SUPER_ADMIN only. ADMIN accounts are view-only for user management — they
   can see who is in their division but cannot create, edit, or remove
   accounts (including other admin accounts). */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone, password, dsDivision } = await req.json() as {
      name: string; email: string; phone?: string; password: string; dsDivision?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, message: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!dsDivision) {
      return NextResponse.json({ ok: false, message: "A division must be assigned to this admin account." }, { status: 400 });
    }

    const division = DIVISIONAL_SECRETARIATS.find((d) => d.id === dsDivision);
    if (!division) {
      return NextResponse.json({ ok: false, message: "Unknown division selected." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ ok: false, message: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name:             name.trim(),
        email:            emailLower,
        phone:            phone?.trim() ?? null,
        passwordHash,
        role:             "ADMIN",
        status:           "ACTIVE",
        district:         division.districtId,
        dsDivision:       division.id,
        mustResetPassword: true,
        emailVerified:    true,
        createdById:      session.userId,
      },
      select: { id: true, name: true, email: true, role: true, status: true, district: true, dsDivision: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        action:      "Admin Created",
        description: `New admin account created for ${name} (${emailLower}), assigned to ${division.en}`,
        category:    "ADMIN",
        severity:    "INFO",
        userId:      session.userId,
        userName:    session.name,
        metadata:    { newAdminId: user.id, dsDivision: division.id, district: division.districtId },
      },
    });

    return NextResponse.json({ ok: true, data: user }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred." }, { status: 500 });
  }
}
