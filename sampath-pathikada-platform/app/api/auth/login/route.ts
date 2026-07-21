import { NextRequest, NextResponse } from "next/server";
import { loginWithCredentials, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOrigin } from "@/lib/csrf";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SECONDS = 60;

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

    const { allowed, retryAfterSeconds } = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many login attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 });
    }

    const result = await loginWithCredentials(email, password, ip === "unknown" ? undefined : ip);

    if (!result.ok || !result.token) {
      return NextResponse.json(
        { ok: false, message: result.message, pending: result.pending ?? false },
        { status: 401 }
      );
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
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
