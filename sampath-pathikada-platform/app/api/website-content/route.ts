import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";

/* ── GET /api/website-content ── list all content entries ──────────────────── */
export async function GET() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const content = await prisma.websiteContent.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ ok: true, data: content });
}

/* ── PATCH /api/website-content ── upsert one entry ────────────────────────────
   SUPER_ADMIN only — ADMIN has read-only access to website content. */
export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { key, title, body } = await req.json() as { key?: string; title?: string; body?: string };
  if (!key || !title || body === undefined) {
    return NextResponse.json({ ok: false, message: "key, title, and body are required." }, { status: 400 });
  }

  const content = await prisma.websiteContent.upsert({
    where: { key },
    update: { title, body, updatedById: session.userId },
    create: { key, title, body, updatedById: session.userId },
  });

  await prisma.auditLog.create({
    data: {
      action:      "Website Content Updated",
      description: `${session.name} updated website content "${key}"`,
      category:    "SYSTEM",
      severity:    "INFO",
      userId:      session.userId,
      userName:    session.name,
      metadata:    { key },
    },
  });

  return NextResponse.json({ ok: true, data: content });
}
