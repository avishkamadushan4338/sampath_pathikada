import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[GET /api/health]", err);
    return NextResponse.json({ ok: false, db: "down", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() }, { status: 503 });
  }
}
