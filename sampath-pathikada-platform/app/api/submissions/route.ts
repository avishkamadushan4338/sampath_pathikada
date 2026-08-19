import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { REVIEWER_ROLES } from "@/lib/review-scope";
import { parseSectionReviews, countSectionReviews } from "@/lib/submission-review";

/* ── GET /api/submissions ── reviewer-facing list, filterable by district/status/year ── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !REVIEWER_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const yearParam = searchParams.get("year") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  const where: Record<string, unknown> = {};
  if (district) where.district = district;
  if (status && status !== "all") where.status = status.toUpperCase();
  if (yearParam) {
    const year = parseInt(yearParam);
    if (!Number.isNaN(year)) where.year = year;
  }
  if (search) {
    where.OR = [
      { gnDivision: { contains: search } },
      { dsDivision: { contains: search } },
      { submittedBy: { name: { contains: search } } },
    ];
  }

  // An Assistant Director Planning, Divisional Secretariat, or Admin may only ever see
  // submissions from their own DS division — this overrides any other filter and is not
  // client-controllable.
  if (session.role === "ASSISTANT_DIRECTOR_PLANNING" || session.role === "DIVISIONAL_SECRETARIAT" || session.role === "ADMIN") {
    if (!session.dsDivision) {
      return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
    }
    where.dsDivision = session.dsDivision;
  }
  // AD and DS are further scoped to whichever review stage is theirs — AD only sees submissions
  // still awaiting AD review, DS only sees submissions AD has already cleared. Session-derived
  // only, not client-controllable, same as the dsDivision scoping above. ADMIN/SUPER_ADMIN see
  // every stage within/without their scope, unchanged.
  if (session.role === "ASSISTANT_DIRECTOR_PLANNING") where.reviewStage = "AD";
  if (session.role === "DIVISIONAL_SECRETARIAT") where.reviewStage = "DS";

  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        year: true,
        district: true,
        dsDivision: true,
        gnDivision: true,
        status: true,
        reviewStage: true,
        rejectionNote: true,
        sectionReviews: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        submittedBy: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
  ]);

  // Only the Identification section's officer designation is surfaced here — pulled straight out
  // of MySQL's JSON column with JSON_EXTRACT instead of selecting the whole multi-section `data`
  // blob (which used to be tens/hundreds of KB per row) and discarding everything but this one
  // string. That used to make this list slower with every submission that accumulated. Scoped by
  // the same `id`s the (already dsDivision/role-scoped) query above just returned, so it needs no
  // separate authorization check of its own.
  const officerDesignationById = new Map<string, string | null>();
  if (submissions.length > 0) {
    const rows = await prisma.$queryRaw<{ id: string; officerDesignation: string | null }[]>`
      SELECT id, JSON_UNQUOTE(JSON_EXTRACT(data, '$.identification.officerDesignation')) AS officerDesignation
      FROM submissions
      WHERE id IN (${Prisma.join(submissions.map((s) => s.id))})
    `;
    for (const row of rows) officerDesignationById.set(row.id, row.officerDesignation);
  }

  // `sectionReviews` is similarly reduced to counts — the full per-section notes only matter on
  // the detail page, and a 15-entry object per row is unnecessary weight for a list.
  const shaped = submissions.map(({ sectionReviews, ...rest }) => ({
    ...rest,
    officerDesignation: officerDesignationById.get(rest.id) ?? null,
    sectionReviewCounts: countSectionReviews(parseSectionReviews(sectionReviews)),
  }));

  return NextResponse.json({ ok: true, data: shaped, total, page, pageSize });
}
