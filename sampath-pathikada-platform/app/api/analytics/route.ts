import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";
import {
  aggregateHousing, aggregateEmployment, aggregateEducation, aggregateHealth,
  aggregateEconomicAgriculture, aggregateCommunityWelfare, aggregateInfrastructure, aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "DIVISIONAL_SECRETARIAT"];
const VALID_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REVISION_NEEDED"];

interface SubmissionRow {
  id: string;
  gnDivision: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  data: unknown;
  submittedBy: { name: string; email: string };
}

function monthlyTrend(rows: SubmissionRow[]) {
  const now = new Date();
  const buckets: { key: string; month: string; approved: number; pending: number; rejected: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en", { month: "short" }), approved: 0, pending: 0, rejected: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const r of rows) {
    const d = new Date(r.updatedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    if (r.status === "APPROVED") bucket.approved++;
    else if (r.status === "REJECTED") bucket.rejected++;
    else bucket.pending++;
  }
  return buckets;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : CURRENT_YEAR;

  const statusParam = searchParams.get("status");
  const status = statusParam && VALID_STATUSES.includes(statusParam.toUpperCase()) ? statusParam.toUpperCase() : null;

  const gnDivisionsParam = searchParams.get("gnDivisions");
  const gnDivisionFilter = gnDivisionsParam
    ? gnDivisionsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  let dsDivisionFilter: string | null = null;
  let districtFilter: string | null = null;

  if (session.role === "ADMIN" || session.role === "DIVISIONAL_SECRETARIAT") {
    if (!session.dsDivision) {
      return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
    }
    dsDivisionFilter = session.dsDivision;
  } else {
    // SUPER_ADMIN may optionally scope down via query params; unscoped = all 3 districts.
    dsDivisionFilter = searchParams.get("dsDivision");
    districtFilter = searchParams.get("district");
  }

  const where: Record<string, unknown> = { year };
  if (dsDivisionFilter) where.dsDivision = dsDivisionFilter;
  else if (districtFilter) where.district = districtFilter;
  if (status) where.status = status;
  if (gnDivisionFilter && gnDivisionFilter.length > 0) where.gnDivision = { in: gnDivisionFilter };

  // Scope for "who has an officer account at all" — independent of whether that officer
  // has ever created a submission row (which only happens once they open the entry form).
  const officerWhere: Record<string, unknown> = { role: "ECONOMIC_DEVELOPMENT_OFFICER" };
  if (dsDivisionFilter) officerWhere.dsDivision = dsDivisionFilter;
  else if (districtFilter) officerWhere.district = districtFilter;

  const [rows, registeredOfficers] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: {
        id: true, gnDivision: true, status: true,
        createdAt: true, updatedAt: true, reviewedAt: true, data: true,
        submittedBy: { select: { name: true, email: true } },
      },
    }) as unknown as Promise<SubmissionRow[]>,
    prisma.user.findMany({ where: officerWhere, select: { gnDivision: true, name: true } }),
  ]);

  const registeredGnMap = new Map(
    registeredOfficers.filter((o): o is typeof o & { gnDivision: string } => !!o.gnDivision).map((o) => [o.gnDivision, o.name])
  );

  const division = dsDivisionFilter ? DIVISIONAL_SECRETARIATS.find((d) => d.id === dsDivisionFilter) : null;
  const district = districtFilter ? DISTRICTS.find((d) => d.id === districtFilter) : null;

  // GN division roster this scope is responsible for — narrowed further by an explicit gnDivisions filter,
  // but always within the caller's already-enforced dsDivision/district scope (never a way to escape it).
  let gnRoster = dsDivisionFilter
    ? GN_DIVISIONS.filter((gn) => gn.dsId === dsDivisionFilter)
    : districtFilter
      ? GN_DIVISIONS.filter((gn) => DIVISIONAL_SECRETARIATS.find((d) => d.id === gn.dsId)?.districtId === districtFilter)
      : GN_DIVISIONS;

  if (gnDivisionFilter && gnDivisionFilter.length > 0) {
    const allowed = new Set(gnDivisionFilter);
    gnRoster = gnRoster.filter((gn) => allowed.has(gn.id));
  }

  const submissionByGn = new Map(rows.map((r) => [r.gnDivision, r]));
  const gnLabel = (id: string) => GN_DIVISIONS.find((gn) => gn.id === id)?.en ?? id;

  const funnel = {
    notStarted: Math.max(0, gnRoster.length - rows.length),
    submitted: rows.filter((r) => r.status === "SUBMITTED").length,
    revisionNeeded: rows.filter((r) => r.status === "REVISION_NEEDED").length,
    approved: rows.filter((r) => r.status === "APPROVED").length,
    rejected: rows.filter((r) => r.status === "REJECTED").length,
    draft: rows.filter((r) => r.status === "DRAFT").length,
  };

  const decided = rows.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");
  const approvalRate = decided.length > 0 ? Math.round((funnel.approved / decided.length) * 100) : null;

  const decisionDurations = rows
    .filter((r) => r.reviewedAt && (r.status === "APPROVED" || r.status === "REJECTED"))
    .map((r) => (new Date(r.reviewedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const avgDecisionDays = decisionDurations.length > 0
    ? Math.round((decisionDurations.reduce((a, b) => a + b, 0) / decisionDurations.length) * 10) / 10
    : null;

  const notRegisteredCount = gnRoster.filter((gn) => !registeredGnMap.has(gn.id)).length;

  const gnBreakdown = [...gnRoster]
    .sort((a, b) => a.en.localeCompare(b.en))
    .map((gn) => {
      const submission = submissionByGn.get(gn.id);
      return {
        gnId: gn.id,
        gnName: gn.en,
        gnNameSi: gn.si,
        officer: submission?.submittedBy.name ?? registeredGnMap.get(gn.id) ?? null,
        officerRegistered: registeredGnMap.has(gn.id),
        status: submission?.status ?? null,
        createdAt: submission?.createdAt ?? null,
        reviewedAt: submission?.reviewedAt ?? null,
        // Each GN division's own demographic numbers, so the frontend can drill into a single division
        // without a second request.
        demographics: submission ? aggregateDemographics([submission]) : null,
      };
    });

  return NextResponse.json({
    ok: true,
    scope: {
      role: session.role,
      dsDivision: division ? { id: division.id, en: division.en, si: division.si } : null,
      district: district ? { id: district.id, en: district.en, si: district.si } : (division ? DISTRICTS.find((d) => d.id === division.districtId) ?? null : null),
    },
    year,
    demographics: aggregateDemographics(rows),
    sections: {
      housing: aggregateHousing(rows, gnLabel),
      employment: aggregateEmployment(rows, gnLabel),
      education: aggregateEducation(rows, gnLabel),
      health: aggregateHealth(rows, gnLabel),
      economicAgriculture: aggregateEconomicAgriculture(rows, gnLabel),
      communityWelfare: aggregateCommunityWelfare(rows, gnLabel),
      infrastructure: aggregateInfrastructure(rows, gnLabel),
      areaProfile: aggregateAreaProfile(rows, gnLabel),
    },
    funnel,
    approvalRate,
    avgDecisionDays,
    totalGnDivisions: gnRoster.length,
    notRegisteredCount,
    totalSubmissions: rows.length,
    trend: monthlyTrend(rows),
    gnBreakdown,
  });
}
