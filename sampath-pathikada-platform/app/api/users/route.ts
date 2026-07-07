import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

/* ── GET /api/users ── list admin accounts ────────────────────────────────── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
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

/* ── POST /api/users ── create an admin account ───────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone, password, districts } = await req.json() as {
      name: string; email: string; phone?: string; password: string; districts?: string[];
    };

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, message: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
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
        district:         districts?.[0] ?? null,
        mustResetPassword: true,
        emailVerified:    true,
        createdById:      session.userId,
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        action:      "Admin Created",
        description: `New admin account created for ${name} (${emailLower})`,
        category:    "ADMIN",
        severity:    "INFO",
        userId:      session.userId,
        userName:    session.name,
        metadata:    { newAdminId: user.id, assignedDistricts: districts ?? [] },
      },
    });

    return NextResponse.json({ ok: true, data: user }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred." }, { status: 500 });
  }
}
