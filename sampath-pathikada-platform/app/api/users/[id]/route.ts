import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/* ── PATCH /api/users/[id] ── toggle status, update details ──────────────── */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { status?: "ACTIVE" | "INACTIVE"; name?: string; phone?: string };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.name   !== undefined ? { name:   body.name.trim() } : {}),
      ...(body.phone  !== undefined ? { phone:  body.phone.trim() } : {}),
    },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  const actionLabel = body.status === "INACTIVE" ? "User Deactivated"
    : body.status === "ACTIVE" ? "User Activated"
    : "User Updated";

  await prisma.auditLog.create({
    data: {
      action:      actionLabel,
      description: `${actionLabel}: ${user.name} (${user.email})`,
      category:    "ADMIN",
      severity:    body.status === "INACTIVE" ? "WARNING" : "INFO",
      userId:      session.userId,
      userName:    session.name,
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}

/* ── DELETE /api/users/[id] ──────────────────────────────────────────────── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ ok: false, message: "You cannot delete your own account." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });

  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action:      "User Deleted",
      description: `Deleted user account: ${user.name} (${user.email})`,
      category:    "ADMIN",
      severity:    "WARNING",
      userId:      session.userId,
      userName:    session.name,
    },
  });

  return NextResponse.json({ ok: true, message: "User deleted." });
}
