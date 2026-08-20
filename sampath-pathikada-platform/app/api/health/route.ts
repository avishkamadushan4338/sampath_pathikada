import { NextResponse } from "next/server";

/* ── GET /api/health ── liveness ──────────────────────────────────────────────
   "Is the Node process itself alive and able to handle a request?" Deliberately
   does NOT touch MySQL — an orchestrator/process-manager restarting this
   process because the *database* is briefly slow would be actively harmful
   (kills a perfectly healthy Node process, adds restart churn on top of a
   pre-existing DB problem). For "is this instance ready to serve real traffic"
   (which does need to know about DB connectivity), see /api/health/ready. ── */
export async function GET() {
  return NextResponse.json({ ok: true, uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
}
