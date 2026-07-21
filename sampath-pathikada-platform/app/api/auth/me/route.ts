import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, nameSinhala: true, email: true, phone: true, role: true,
      district: true, dsDivision: true, gnDivision: true,
      localGovt: true, electoral: true, farmers: true,
      eduZone: true, eduDiv: true, mahaweli: true,
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: user });
}
