import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOrigin } from "@/lib/csrf";
import { signResetToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit-log";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

const MAX_ATTEMPTS = 5;

const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

// Constant-time hash comparison — never compares plaintext OTPs, and never lets
// a length mismatch short-circuit the comparison via `!==` (which would leak
// timing information about the stored hash).
function hashesMatch(storedHex: string, candidateHex: string): boolean {
  const stored = Buffer.from(storedHex, "hex");
  const candidate = Buffer.from(candidateHex, "hex");
  if (stored.length !== candidate.length) return false;
  return timingSafeEqual(stored, candidate);
}

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
    const { allowed, retryAfterSeconds } = await rateLimit(`verify-otp:${ip}:${emailLower}`, 10, 60 * 15);
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

    const requestId = getRequestId(req);

    if (!record || record.expiresAt < new Date()) {
      // Covers three cases the query can't distinguish (findFirst excludes consumed rows by
      // design): no OTP was ever requested, it expired, or it was already consumed/reused.
      // Never reveal which — that would leak whether an OTP/account exists.
      logAudit({
        action:      "OTP Verification Failed",
        description: `OTP verification failed for ${emailLower}: no active code found (missing, expired, or already used).`,
        category:    "AUTH",
        severity:    "WARNING",
        userId:      null,
        userName:    "Unknown",
        userIp:      ip,
        metadata:    { requestId, reason: "expired_or_missing", route: "/api/auth/verify-otp" },
      });
      return NextResponse.json({ ok: false, message: "This code has expired. Please request a new one." }, { status: 400 });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      logAudit({
        action:      "OTP Attempt Limit Exceeded",
        description: `OTP verification blocked for ${emailLower}: attempt limit (${MAX_ATTEMPTS}) reached.`,
        category:    "AUTH",
        severity:    "WARNING",
        userId:      null,
        userName:    "Unknown",
        userIp:      ip,
        metadata:    { requestId, reason: "attempt_limit_exceeded", route: "/api/auth/verify-otp" },
      });
      return NextResponse.json({ ok: false, message: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
    }

    if (!hashesMatch(record.otpHash, hashOtp(otp))) {
      await prisma.passwordResetOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      logAudit({
        action:      "OTP Verification Failed",
        description: `OTP verification failed for ${emailLower}: incorrect code (attempt ${record.attempts + 1}/${MAX_ATTEMPTS}).`,
        category:    "AUTH",
        severity:    "WARNING",
        userId:      null,
        userName:    "Unknown",
        userIp:      ip,
        metadata:    { requestId, reason: "invalid_code", route: "/api/auth/verify-otp" },
      });
      return NextResponse.json({ ok: false, message: "Incorrect code. Please try again." }, { status: 400 });
    }

    const { token: resetToken, jti } = await signResetToken(emailLower);

    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data:  { consumedAt: new Date(), resetTokenJti: jti },
    });

    logAudit({
      action:      "OTP Verified",
      description: `OTP verification succeeded for ${emailLower}.`,
      category:    "AUTH",
      severity:    "SUCCESS",
      userId:      null,
      userName:    "Unknown",
      userIp:      ip,
      metadata:    { requestId, route: "/api/auth/verify-otp" },
    });

    return NextResponse.json({ ok: true, resetToken });
  } catch (err) {
    logger.error("Unhandled error in POST /api/auth/verify-otp", { requestId: getRequestId(req), route: "/api/auth/verify-otp", method: "POST" }, err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
