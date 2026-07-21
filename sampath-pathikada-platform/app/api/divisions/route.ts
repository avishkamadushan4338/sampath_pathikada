import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";

/* ── GET /api/divisions ── DS division roster, optionally filtered by district ──
   Used by: Super Admin's division picker / admin-assignment UI, and the Admin's
   own division-detail page. Annotates each division with a live submission count. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get("district") ?? undefined;

  const divisions = districtId
    ? DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === districtId)
    : DIVISIONAL_SECRETARIATS;

  const counts = await prisma.submission.groupBy({
    by: ["dsDivision", "status"],
    where: { year: CURRENT_YEAR },
    _count: { _all: true },
  });

  const countMap = new Map<string, { submitted: number; approved: number; rejected: number; total: number }>();
  for (const c of counts) {
    const entry = countMap.get(c.dsDivision) ?? { submitted: 0, approved: 0, rejected: 0, total: 0 };
    entry.total += c._count._all;
    if (c.status === "APPROVED") entry.approved += c._count._all;
    else if (c.status === "REJECTED") entry.rejected += c._count._all;
    else if (c.status === "SUBMITTED") entry.submitted += c._count._all;
    countMap.set(c.dsDivision, entry);
  }

  const data = divisions.map((d) => {
    const district = DISTRICTS.find((dist) => dist.id === d.districtId);
    const gnCount = GN_DIVISIONS.filter((gn) => gn.dsId === d.id).length;
    const stats = countMap.get(d.id) ?? { submitted: 0, approved: 0, rejected: 0, total: 0 };
    return {
      id: d.id,
      en: d.en,
      si: d.si,
      districtId: d.districtId,
      districtEn: district?.en ?? d.districtId,
      districtSi: district?.si ?? d.districtId,
      gnDivisionCount: gnCount,
      ...stats,
    };
  });

  return NextResponse.json({ ok: true, data, districts: DISTRICTS });
}
