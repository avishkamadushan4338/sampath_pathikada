import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOrigin } from "@/lib/csrf";
import { signResetToken } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

/* ── POST /api/auth/verify-otp { email, otp } ── Checks the OTP issued by
   /api/auth/forgot-password. On success, consumes it and returns a short-lived
   resetToken that /api/auth/reset-password requires — the OTP itself is never
   reusable, and this endpoint is the only place it's checked. ── */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { email, otp } = (await req.json()) as { email?: string; otp?: string };
    const emailLower = email?.toLowerCase().trim();
    if (!emailLower || !otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ ok: false, message: "A valid email and 6-digit code are required." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const { allowed, retryAfterSeconds } = rateLimit(`verify-otp:${ip}:${emailLower}`, 10, 60 * 15);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: { email: emailLower, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, message: "This code has expired. Please request a new one." }, { status: 400 });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ ok: false, message: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
    }

    if (record.otpHash !== hashOtp(otp)) {
      await prisma.passwordResetOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ ok: false, message: "Incorrect code. Please try again." }, { status: 400 });
    }

    await prisma.passwordResetOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

    const resetToken = await signResetToken(emailLower);
    return NextResponse.json({ ok: true, resetToken });
  } catch (err) {
    console.error("[POST /api/auth/verify-otp]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
