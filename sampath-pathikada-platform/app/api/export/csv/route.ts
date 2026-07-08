import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
import { buildCsvRows, toCsvText } from "@/lib/analytics/csv-export";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : CURRENT_YEAR;

  let dsDivisionFilter: string | null = null;
  let districtFilter: string | null = null;
  if (session.role === "ADMIN") {
    if (!session.dsDivision) {
      return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
    }
    dsDivisionFilter = session.dsDivision;
  } else {
    dsDivisionFilter = searchParams.get("dsDivision");
    districtFilter = searchParams.get("district");
  }

  const gnDivisionsParam = searchParams.get("gnDivisions");
  const gnDivisionFilter = gnDivisionsParam
    ? gnDivisionsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const where: Record<string, unknown> = { year };
  if (dsDivisionFilter) where.dsDivision = dsDivisionFilter;
  else if (districtFilter) where.district = districtFilter;
  if (gnDivisionFilter && gnDivisionFilter.length > 0) where.gnDivision = { in: gnDivisionFilter };

  const rows = await prisma.submission.findMany({
    where,
    orderBy: { gnDivision: "asc" },
    select: {
      gnDivision: true, dsDivision: true, district: true, status: true,
      createdAt: true, reviewedAt: true, data: true,
      submittedBy: { select: { name: true, email: true } },
    },
  });

  const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;
  const dsLabel = (id: string) => DIVISIONAL_SECRETARIATS.find((d) => d.id === id)?.en ?? id;

  const csvRows = buildCsvRows(rows, gnLabel, dsLabel);
  const csvText = toCsvText(csvRows);

  // UTF-8 BOM so Excel correctly detects encoding for Sinhala GN division names etc.
  const buffer = Buffer.concat([Buffer.from("﻿", "utf-8"), Buffer.from(csvText, "utf-8")]);

  const scopeSlug = gnDivisionFilter && gnDivisionFilter.length === 1
    ? gnDivisionFilter[0]
    : dsDivisionFilter ?? districtFilter ?? "all";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="division-summary-${scopeSlug}-${year}.csv"`,
    },
  });
}
