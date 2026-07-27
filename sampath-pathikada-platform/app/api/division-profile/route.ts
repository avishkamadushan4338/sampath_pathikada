import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { GN_DIVISIONS } from "@/lib/registration-data";

const ALLOWED_ROLES = ["DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"];

/* ── GET /api/division-profile?gnDivision=<id> ── one GN division's latest approved
   record (DivisionProfile) — the same approved-only, always-current source that powers
   "My Division Information" area-wide aggregates, scoped down to a single division so a
   section page can render its raw section data (tables, not numbers) for one GN division
   at a time. ──────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const gnDivision = new URL(req.url).searchParams.get("gnDivision");
  if (!gnDivision) {
    return NextResponse.json({ ok: false, message: "gnDivision is required." }, { status: 400 });
  }

  const gn = GN_DIVISIONS.find((g) => g.id === gnDivision);

  // A Divisional Secretariat (or Admin scoped to one division) may only look up GN divisions
  // inside their own division — an unknown id and an out-of-scope id get the identical 404,
  // so the response can never be used to probe which divisions exist elsewhere.
  const outOfScope =
    !gn ||
    ((session.role === "DIVISIONAL_SECRETARIAT" || session.role === "ADMIN") && gn.dsId !== session.dsDivision);
  if (outOfScope) {
    return NextResponse.json({ ok: false, message: "Unknown GN division." }, { status: 404 });
  }

  const profile = await prisma.divisionProfile.findUnique({
    where: { gnDivision },
    select: { gnDivision: true, data: true, year: true, approvedAt: true },
  });

  return NextResponse.json({ ok: true, data: profile });
}
