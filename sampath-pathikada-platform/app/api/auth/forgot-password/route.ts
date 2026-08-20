import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOrigin } from "@/lib/csrf";
import { sendPasswordResetOtpEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

const OTP_LIMIT = 5;
const OTP_WINDOW_SECONDS = 60 * 15;
const OTP_TTL_MS = 10 * 60 * 1000;

const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

/* ── POST /api/auth/forgot-password { email } ── Issues a fresh 6-digit OTP for
   the given email if (and only if) it belongs to an active user, and emails it via
   Resend. Always returns the same generic ok:true response regardless of whether the
   email exists, so this endpoint can't be used to enumerate registered accounts. ── */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { email } = (await req.json()) as { email?: string };
    const emailLower = email?.toLowerCase().trim();
    if (!emailLower || !emailLower.includes("@")) {
      return NextResponse.json({ ok: false, message: "A valid email address is required." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const { allowed, retryAfterSeconds } = await rateLimit(`forgot-password:${ip}:${emailLower}`, OTP_LIMIT, OTP_WINDOW_SECONDS);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: emailLower }, select: { status: true } });

    if (user && user.status === "ACTIVE") {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");

      await prisma.$transaction([
        prisma.passwordResetOtp.deleteMany({ where: { email: emailLower, consumedAt: null } }),
        prisma.passwordResetOtp.create({
          data: {
            email: emailLower,
            otpHash: hashOtp(otp),
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
          },
        }),
      ]);

      await sendPasswordResetOtpEmail(emailLower, otp);
    }

    return NextResponse.json({ ok: true, message: "If that email is registered, a code has been sent." });
  } catch (err) {
    logger.error("Unhandled error in POST /api/auth/forgot-password", { requestId: getRequestId(req), route: "/api/auth/forgot-password", method: "POST" }, err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
