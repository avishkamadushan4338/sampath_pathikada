import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";

/* ── GET /api/system-settings ── list all settings ───────────────────────────
   SUPER_ADMIN and ADMIN can both view; ADMIN is read-only (see PATCH below). */
export async function GET() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ ok: true, data: settings });
}

/* ── PATCH /api/system-settings ── upsert one setting ─────────────────────────
   SUPER_ADMIN only. */
export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await req.json() as { key?: string; value?: string };
  if (!key || value === undefined) {
    return NextResponse.json({ ok: false, message: "key and value are required." }, { status: 400 });
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  await prisma.auditLog.create({
    data: {
      action:      "System Setting Updated",
      description: `${session.name} updated setting "${key}"`,
      category:    "SYSTEM",
      severity:    "INFO",
      userId:      session.userId,
      userName:    session.name,
      metadata:    { key, value },
    },
  });

  return NextResponse.json({ ok: true, data: setting });
}
