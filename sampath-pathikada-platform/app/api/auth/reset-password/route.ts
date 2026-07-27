import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyResetToken, hashPassword } from "@/lib/auth";
import { verifyOrigin } from "@/lib/csrf";

const MIN_PASSWORD_LENGTH = 8;

/* ── POST /api/auth/reset-password { resetToken, newPassword } ── Finishes the
   forgot-password flow: resetToken must be a still-valid token issued by
   /api/auth/verify-otp for this email. Also clears any lockout state and any
   still-pending OTP rows for the account. ── */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { resetToken, newPassword } = (await req.json()) as { resetToken?: string; newPassword?: string };
    if (!resetToken || !newPassword) {
      return NextResponse.json({ ok: false, message: "Missing reset token or new password." }, { status: 400 });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
    }

    const payload = await verifyResetToken(resetToken);
    if (!payload) {
      return NextResponse.json({ ok: false, message: "This reset link has expired. Please start over." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "This reset link has expired. Please start over." }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, loginAttempts: 0, lockedUntil: null, mustResetPassword: false },
      }),
      prisma.passwordResetOtp.deleteMany({ where: { email: payload.email } }),
      prisma.auditLog.create({
        data: {
          action: "Password Reset",
          description: `Password reset via forgot-password flow: ${user.name} (${user.email})`,
          category: "AUTH",
          severity: "SUCCESS",
          userId: user.id,
          userName: user.name,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
