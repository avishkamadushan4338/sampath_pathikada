import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   0,
    path:     "/",
  });
  return res;
}
