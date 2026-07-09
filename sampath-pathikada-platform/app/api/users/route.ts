import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { DIVISIONAL_SECRETARIATS } from "@/lib/registration-data";
import { verifyOrigin } from "@/lib/csrf";

/* ── GET /api/users ── list admin accounts ────────────────────────────────────
   SUPER_ADMIN sees all users. ADMIN is scoped to their own dsDivision only —
   they can only see/manage accounts within the division they were assigned. */
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
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nameSinhala: true, email: true, phone: true,
      role: true, status: true, district: true, dsDivision: true,
      lastLoginAt: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, data: users });
}

/* ── POST /api/users ── create an admin account ──────────────────────────────
   SUPER_ADMIN may assign any division. ADMIN may only create accounts within
   their own dsDivision — the client-supplied dsDivision is ignored for ADMIN
   and forced to session.dsDivision instead. */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "ADMIN" && !session.dsDivision) {
    return NextResponse.json({ ok: false, message: "Your account has no division assigned." }, { status: 403 });
  }

  try {
    const { name, email, phone, password, dsDivision: requestedDsDivision } = await req.json() as {
      name: string; email: string; phone?: string; password: string; dsDivision?: string;
    };

    const dsDivision = session.role === "ADMIN" ? session.dsDivision! : requestedDsDivision;

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
