import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const search   = searchParams.get("search")   ?? undefined;
  const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));

  const where: Record<string, unknown> = {};
  if (severity && severity !== "all") where.severity = severity.toUpperCase();
  if (category && category !== "all") where.category = category.toUpperCase();
  if (search) {
    where.OR = [
      { action:      { contains: search } },
      { description: { contains: search } },
      { userName:    { contains: search } },
      { userIp:      { contains: search } },
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ ok: true, data: items, total, page, pageSize });
}
