import { NextRequest, NextResponse } from "next/server";
import { loginWithCredentials, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;
    const result = await loginWithCredentials(email, password, ip);

    if (!result.ok || !result.token) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, redirectTo: result.redirectTo });
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   SESSION_DURATION,
      path:     "/",
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
