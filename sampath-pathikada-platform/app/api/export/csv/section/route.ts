import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DIVISIONAL_SECRETARIATS, DISTRICTS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR, EXPORT_ROW_CAP } from "@/lib/constants";
import { buildCsvRows, filterCsvRowsToSection, toCsvText, type CsvRow } from "@/lib/analytics/csv-export";
import { isSectionKey, SECTION_ROUTES, type SectionKey } from "@/lib/types/submission";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "ASSISTANT_DIRECTOR_PLANNING", "DIVISIONAL_SECRETARIAT"];

/* Route slug ("state-institutions-land") -> SectionKey ("stateInstitutionsLand") — the inverse
   of SECTION_ROUTES, since the page passes the URL slug, not the internal camelCase key. */
const ROUTE_TO_SECTION_KEY: Record<string, SectionKey> = Object.fromEntries(
  Object.entries(SECTION_ROUTES).map(([key, route]) => [route, key])
) as Record<string, SectionKey>;

/* ── Identification: registered-officer directory, not submission data — see the comment on
   SECTION_CSV_PREFIXES in lib/analytics/csv-export.ts for why this can't share buildCsvRows. ── */
async function buildIdentificationCsv(
  dsDivisionFilter: string | null,
  districtFilter: string | null,
  gnDivisionFilter: string[] | null,
  year: number
): Promise<CsvRow[]> {
  const where: Record<string, unknown> = {};
  if (dsDivisionFilter) where.dsDivision = dsDivisionFilter;
  else if (districtFilter) where.district = districtFilter;
  if (gnDivisionFilter && gnDivisionFilter.length > 0) where.gnDivision = { in: gnDivisionFilter };

  const registrations = await prisma.economicDevelopmentOfficerRegistration.findMany({
    where,
    orderBy: { gnDivision: "asc" },
    take: EXPORT_ROW_CAP + 1,
    select: {
      id: true, name: true, phone: true, gnDivision: true, district: true, dsDivision: true,
      localGovt: true, electoral: true, farmers: true, eduZone: true, eduDiv: true, mahaweli: true,
    },
  });

  if (registrations.length === 0) return [];

  // officerDesignation lives in Submission.data (JSON), not a real column — same
  // JSON_EXTRACT approach already used by GET /api/submissions for the same field.
  const designationRows = await prisma.$queryRaw<{ gnDivision: string; officerDesignation: string | null }[]>`
    SELECT gnDivision, JSON_UNQUOTE(JSON_EXTRACT(data, '$.identification.officerDesignation')) AS officerDesignation
    FROM submissions WHERE year = ${year}
  `;
  const designationByGn = new Map<string, string | null>();
  for (const row of designationRows) designationByGn.set(row.gnDivision, row.officerDesignation);

  const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;
  const districtLabel = (id: string | null) => (id ? (DISTRICTS.find((d) => d.id === id)?.en ?? id) : "");
  const dsLabel = (id: string | null) => (id ? (DIVISIONAL_SECRETARIATS.find((d) => d.id === id)?.en ?? id) : "");

  return registrations.map((r) => ({
    "GN Division Name": gnLabel(r.gnDivision),
    "GN Division Number": r.gnDivision,
    "Officer Name": r.name,
    "Officer Designation": designationByGn.get(r.gnDivision) ?? "",
    "Telephone Number": r.phone ?? "",
    "District": districtLabel(r.district),
    "Divisional Secretariat Division": dsLabel(r.dsDivision),
    "Local Government Authority / Area": r.localGovt ?? "",
    "Electoral Division / Electorate Area": r.electoral ?? "",
    "Agrarian Services Centre": r.farmers ?? "",
    "Education Zone": r.eduZone ?? "",
    "Education Division": r.eduDiv ?? "",
    "Mahaweli Zone": r.mahaweli ?? "",
  }));
}

/* ── GET /api/export/csv/section?section=<route-slug>&[year|district|dsDivision|gnDivisions] ──
   Same auth/scoping as GET /api/export/csv, narrowed to one form section's columns instead of
   all 15 — the "Section-wise CSV" download button on each section's graphs page. ── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sectionSlug = searchParams.get("section") ?? "";
  const sectionKey = ROUTE_TO_SECTION_KEY[sectionSlug];
  if (!sectionKey || !isSectionKey(sectionKey)) {
    return NextResponse.json({ ok: false, message: "Unknown or missing section." }, { status: 400 });
  }

  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : CURRENT_YEAR;

  let dsDivisionFilter: string | null = null;
  let districtFilter: string | null = null;
  if (session.role === "ADMIN" || session.role === "ASSISTANT_DIRECTOR_PLANNING" || session.role === "DIVISIONAL_SECRETARIAT") {
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

  let csvRows: CsvRow[];

  if (sectionKey === "identification") {
    csvRows = await buildIdentificationCsv(dsDivisionFilter, districtFilter, gnDivisionFilter, year);
  } else {
    const where: Record<string, unknown> = { year };
    if (dsDivisionFilter) where.dsDivision = dsDivisionFilter;
    else if (districtFilter) where.district = districtFilter;
    if (gnDivisionFilter && gnDivisionFilter.length > 0) where.gnDivision = { in: gnDivisionFilter };

    const rows = await prisma.submission.findMany({
      where,
      orderBy: { gnDivision: "asc" },
      take: EXPORT_ROW_CAP + 1,
      select: {
        gnDivision: true, dsDivision: true, district: true, status: true,
        createdAt: true, reviewedAt: true, data: true,
        submittedBy: { select: { name: true, email: true } },
      },
    });

    if (rows.length > EXPORT_ROW_CAP) {
      return NextResponse.json(
        { ok: false, message: "This export exceeds the maximum supported row count. Narrow the filter (district or division) and try again." },
        { status: 413 }
      );
    }

    const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;
    const dsLabel = (id: string) => DIVISIONAL_SECRETARIATS.find((d) => d.id === id)?.en ?? id;
    csvRows = filterCsvRowsToSection(buildCsvRows(rows, gnLabel, dsLabel), sectionKey);
  }

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
      "Content-Disposition": `attachment; filename="${sectionSlug}-${scopeSlug}-${year}.csv"`,
    },
  });
}
