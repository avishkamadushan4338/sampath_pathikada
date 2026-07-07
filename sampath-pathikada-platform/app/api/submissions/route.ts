import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

const REVIEWER_ROLES = ["REGIONAL_SECRETARY", "ADMIN", "SUPER_ADMIN"];

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
        rejectionNote: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        submittedBy: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, data: submissions, total, page, pageSize });
}
