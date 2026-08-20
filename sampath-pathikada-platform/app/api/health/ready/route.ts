import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";

/* ── GET /api/health/ready ── readiness ────────────────────────────────────────
   "Is this instance ready to serve real traffic?" — unlike /api/health
   (liveness), this deliberately DOES depend on MySQL: a load balancer or
   orchestrator should stop routing traffic to an instance that can't reach its
   database, even though the Node process itself is still alive and shouldn't
   be killed for it. Kept as a separate endpoint so those two failure modes
   (process is dead vs. process is alive but not ready) are never conflated. ── */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error("Readiness check failed: database unreachable", { route: "/api/health/ready" }, err);
    return NextResponse.json({ ok: false, db: "down", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() }, { status: 503 });
  }
}
