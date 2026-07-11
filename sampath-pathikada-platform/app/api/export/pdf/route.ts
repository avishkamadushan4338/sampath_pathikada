import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";
import {
  aggregateHousing, aggregateEmployment, aggregateEducation, aggregateHealth,
  aggregateEconomicAgriculture, aggregateCommunityWelfare, aggregateInfrastructure, aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];
const NAVY = "#0E2B4E";

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
      gnDivision: true, status: true, createdAt: true, reviewedAt: true, data: true,
      submittedBy: { select: { name: true } },
    },
  });

  const division = dsDivisionFilter ? DIVISIONAL_SECRETARIATS.find((d) => d.id === dsDivisionFilter) : null;
  const district = districtFilter
    ? DISTRICTS.find((d) => d.id === districtFilter)
    : division
      ? DISTRICTS.find((d) => d.id === division.districtId)
      : null;
  const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;

  // Single-GN scope gets its own explicit label in the report header, matching the CSV/Excel scoping.
  const singleGn = gnDivisionFilter && gnDivisionFilter.length === 1 ? GN_DIVISIONS.find((g) => g.id === gnDivisionFilter[0]) : null;
  const scopeLabel = singleGn
    ? `${singleGn.en} GN Division${division ? ` · ${division.en}` : ""}${district ? ` · ${district.en} District` : ""}`
    : division
      ? `${division.en} · ${district?.en ?? ""}`
      : district
        ? `${district.en} District`
        : "All Districts";

  const aggregate = aggregateDemographics(rows);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });

  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  doc.text("Sampath Pathikada — Division Summary Report", 40, 40);

  doc.setFontSize(11);
  doc.setTextColor("#47556D");
  doc.text(
    `${scopeLabel}  |  Reporting Year ${year}/${(year + 1) % 100}  |  Generated ${new Date().toLocaleDateString("en-LK")}`,
    40, 60
  );

  doc.setFontSize(11);
  doc.setTextColor("#111111");
  doc.text(
    `Total Population: ${aggregate.totalPopulation}   |   Female: ${aggregate.female} (${aggregate.femalePercentage ?? "—"}%)   |   Male: ${aggregate.male}   |   Households: ${aggregate.households.total}   |   Registered Voters: ${aggregate.registeredVoters.total}`,
    40, 80
  );

  autoTable(doc, {
    startY: 100,
    head: [["Age Band", "Female", "Male", "Total"]],
    body: aggregate.populationByAge.map((a) => [a.en, a.female, a.male, a.total]),
    headStyles: { fillColor: [14, 43, 78] },
    styles: { fontSize: 9 },
    tableWidth: 250,
  });

  const afterAgeY = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: 100,
    margin: { left: 320 },
    head: [["Ethnicity", "Female", "Male", "Total"]],
    body: aggregate.populationByEthnicity.map((e) => [e.en, e.female, e.male, e.total]),
    headStyles: { fillColor: [14, 43, 78] },
    styles: { fontSize: 9 },
    tableWidth: 250,
  });

  autoTable(doc, {
    startY: 100,
    margin: { left: 600 },
    head: [["Religion", "Female", "Male", "Total"]],
    body: aggregate.populationByReligion.map((r) => [r.en, r.female, r.male, r.total]),
    headStyles: { fillColor: [14, 43, 78] },
    styles: { fontSize: 9 },
    tableWidth: 200,
  });

  autoTable(doc, {
    startY: afterAgeY + 20,
    head: [["GN Division", "Officer", "Status", "Submitted", "Decided"]],
    body: rows.map((r) => [
      gnLabel(r.gnDivision),
      r.submittedBy.name,
      r.status,
      r.createdAt.toISOString().split("T")[0],
      r.reviewedAt ? r.reviewedAt.toISOString().split("T")[0] : "—",
    ]),
    headStyles: { fillColor: [14, 43, 78] },
    styles: { fontSize: 9 },
  });

  /* ── Page 2: Section Coverage Summary — a decision-maker's overview of how many
     GN divisions have submitted data for each of the 15 form sections. Full
     per-section detail lives in the Excel export, not here — 15 sections'
     worth of tables would make the PDF unreadable. ── */
  const totalScoped = rows.length;
  const coverageRows: [string, string][] = [
    ["Demographics", `${rows.filter((r) => Object.keys((r.data as any)?.demographics ?? {}).length > 0).length}/${totalScoped}`],
    ["Housing", `${aggregateHousing(rows, gnLabel).coverage.withData}/${totalScoped}`],
    ["Employment", `${aggregateEmployment(rows, gnLabel).coverage.withData}/${totalScoped}`],
    ["Education", `${aggregateEducation(rows, gnLabel).coverage.withData}/${totalScoped}`],
    ["Health", `${aggregateHealth(rows, gnLabel).coverage.withData}/${totalScoped}`],
    ["Agriculture & Economy", `${aggregateEconomicAgriculture(rows, gnLabel).coverage.withData}/${totalScoped}`],
    ["Community Organizations", `${aggregateCommunityWelfare(rows, gnLabel).coverage.communityOrganizations.withData}/${totalScoped}`],
    ["Social Welfare", `${aggregateCommunityWelfare(rows, gnLabel).coverage.socialWelfare.withData}/${totalScoped}`],
    ["Infrastructure", `${aggregateInfrastructure(rows, gnLabel).coverage.withData}/${totalScoped}`],
  ];
  const areaProfileCoverage = aggregateAreaProfile(rows, gnLabel).coverage;
  coverageRows.push(
    ["Physical Environment", `${areaProfileCoverage.physicalEnvironment.withData}/${totalScoped}`],
    ["Religious & Cultural", `${areaProfileCoverage.religiousCultural.withData}/${totalScoped}`],
    ["Tourism", `${areaProfileCoverage.tourism.withData}/${totalScoped}`],
    ["Waste Management", `${areaProfileCoverage.wasteDisaster.withData}/${totalScoped}`],
    ["Identification", `${areaProfileCoverage.identification.withData}/${totalScoped}`],
    ["State Institutions & Land", `${areaProfileCoverage.stateInstitutionsLand.withData}/${totalScoped}`],
  );

  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(NAVY);
  doc.text("Section Coverage Summary", 40, 40);
  doc.setFontSize(10);
  doc.setTextColor("#47556D");
  doc.text("GN divisions with submitted data, by form section. Full detail available in the Excel export.", 40, 58);

  autoTable(doc, {
    startY: 75,
    head: [["Section", "Divisions Reporting"]],
    body: coverageRows,
    headStyles: { fillColor: [14, 43, 78] },
    styles: { fontSize: 10 },
    tableWidth: 300,
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  const scopeSlug = gnDivisionFilter && gnDivisionFilter.length === 1
    ? gnDivisionFilter[0]
    : dsDivisionFilter ?? districtFilter ?? "all";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="division-summary-${scopeSlug}-${year}.pdf"`,
    },
  });
}
