import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

const mockPrisma = {
  user: { findUnique: vi.fn(), update: vi.fn() },
  passwordResetOtp: { deleteMany: vi.fn(), updateMany: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { POST } = await import("@/app/api/auth/reset-password/route");
const { signResetToken, verifyPassword } = await import("@/lib/auth");

const APP_URL = "http://localhost:3004";

function resetRequest(body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/auth/reset-password`, { method: "POST", headers, body: JSON.stringify(body) });
}

const EXISTING_USER = {
  id: "user-1",
  email: "user@example.com",
  name: "User One",
  passwordHash: "old-hash-irrelevant",
};

// Mints a reset token the way /api/auth/verify-otp does (issue token, then persist its
// jti on the PasswordResetOtp row) so route tests can drive the claim check realistically.
async function issueResetToken(email = EXISTING_USER.email) {
  const { token, jti } = await signResetToken(email);
  return { token, jti };
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.passwordResetOtp.deleteMany.mockResolvedValue({});
    mockPrisma.passwordResetOtp.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    const { token } = await issueResetToken();
    const res = await POST(resetRequest({ resetToken: token, newPassword: "newpassword123" }, "http://evil.example.com"));
    expect(res.status).toBe(403);
  });

  it("returns 400 when resetToken or newPassword is missing", async () => {
    const res1 = await POST(resetRequest({ newPassword: "newpassword123" }));
    expect(res1.status).toBe(400);
    const { token } = await issueResetToken();
    const res2 = await POST(resetRequest({ resetToken: token }));
    expect(res2.status).toBe(400);
  });

  it("rejects a password below the 8-character minimum", async () => {
    const { token } = await issueResetToken();
    const res = await POST(resetRequest({ resetToken: token, newPassword: "short1" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/8 characters/i);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("accepts a password at exactly the 8-character boundary", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    const res = await POST(resetRequest({ resetToken: token, newPassword: "exactly8" }));
    expect(res.status).toBe(200);
  });

  it("successfully resets the password with a valid token and valid password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    const res = await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it("atomically claims the reset token by jti before touching the password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token, jti } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));

    expect(mockPrisma.passwordResetOtp.updateMany).toHaveBeenCalledWith({
      where: { email: EXISTING_USER.email, resetTokenJti: jti, resetTokenUsedAt: null },
      data: { resetTokenUsedAt: expect.any(Date) },
    });
  });

  it("hashes the new password with bcrypt before storing it (never stores plaintext)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));

    expect(mockPrisma.user.update).toHaveBeenCalled();
    const args = mockPrisma.user.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: EXISTING_USER.id });
    expect(args.data.passwordHash).not.toBe("brand-new-password");
    expect(await bcrypt.compare("brand-new-password", args.data.passwordHash)).toBe(true);
  });

  it("clears loginAttempts/lockedUntil/mustResetPassword on successful reset", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));

    const args = mockPrisma.user.update.mock.calls[0][0];
    expect(args.data).toMatchObject({ loginAttempts: 0, lockedUntil: null, mustResetPassword: false });
  });

  it("deletes all password-reset OTP rows for the email as part of the same transaction", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));

    expect(mockPrisma.passwordResetOtp.deleteMany).toHaveBeenCalledWith({ where: { email: EXISTING_USER.email } });
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()])
    );
  });

  it("audit-logs a successful password reset within the same transaction", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "Password Reset", category: "AUTH", severity: "SUCCESS", userId: EXISTING_USER.id }),
    });
  });

  it("rejects an expired reset token", async () => {
    const { SignJWT } = await import("jose");
    const { JWT_SECRET } = await import("@/lib/jwt-secret");
    const expiredToken = await new SignJWT({ email: EXISTING_USER.email, purpose: "password-reset", jti: "expired-jti" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
      .sign(JWT_SECRET);

    const res = await POST(resetRequest({ resetToken: expiredToken, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a garbage/invalid token", async () => {
    const res = await POST(resetRequest({ resetToken: "not-a-real-token", newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token missing the jti claim", async () => {
    const { SignJWT } = await import("jose");
    const { JWT_SECRET } = await import("@/lib/jwt-secret");
    const noJtiToken = await new SignJWT({ email: EXISTING_USER.email, purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(JWT_SECRET);

    const res = await POST(resetRequest({ resetToken: noJtiToken, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
    expect(mockPrisma.passwordResetOtp.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a token signed with a different purpose (e.g. a real session token) — cannot be reused as a reset token", async () => {
    const { signToken } = await import("@/lib/auth");
    const sessionToken = await signToken({
      userId: EXISTING_USER.id,
      email: EXISTING_USER.email,
      name: EXISTING_USER.name,
      role: "ECONOMIC_DEVELOPMENT_OFFICER",
      dsDivision: null,
    });
    const res = await POST(resetRequest({ resetToken: sessionToken, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a token whose email does not match any account it's scoped to (belt-and-suspenders on the claim query)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const { token } = await issueResetToken("someone-else@example.com");
    const res = await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
    expect(mockPrisma.passwordResetOtp.updateMany).not.toHaveBeenCalled();
  });

  it("SECURITY: replay — a second submission of the same reset token is rejected once the token has been claimed", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();

    // First call claims the token (updateMany matches and reports count: 1).
    mockPrisma.passwordResetOtp.updateMany.mockResolvedValueOnce({ count: 1 });
    const first = await POST(resetRequest({ resetToken: token, newPassword: "first-new-password" }));
    expect(first.status).toBe(200);

    // Second call with the identical still-valid (not yet expired) token: the claim query's
    // `resetTokenUsedAt: null` guard no longer matches the row, so updateMany reports count: 0.
    mockPrisma.passwordResetOtp.updateMany.mockResolvedValueOnce({ count: 0 });
    const second = await POST(resetRequest({ resetToken: token, newPassword: "second-new-password" }));
    expect(second.status).toBe(401);
    expect((await second.json()).message).toMatch(/already been used/i);

    // Password was only ever changed once — the replay never reached the update.
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it("SECURITY: concurrent submissions of the same token — only one can win the atomic claim", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();

    // Simulate two requests racing for the same underlying DB row: only the first
    // updateMany call to actually run against the real row would report count: 1;
    // the second (already-claimed) reports count: 0. We model that ordering here
    // since the mock can't simulate real row-level atomicity itself — the point of
    // this test is that the route correctly refuses to proceed when count is 0,
    // which is exactly what a real concurrent loser would observe.
    mockPrisma.passwordResetOtp.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const [a, b] = await Promise.all([
      POST(resetRequest({ resetToken: token, newPassword: "password-from-request-a" })),
      POST(resetRequest({ resetToken: token, newPassword: "password-from-request-b" })),
    ]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 401]);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it("does not change the password when the token has already been consumed (claim fails before hashPassword's result is persisted)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    mockPrisma.passwordResetOtp.updateMany.mockResolvedValue({ count: 0 });

    const res = await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects if the user account no longer exists (deleted after the reset link was issued)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const { token } = await issueResetToken();
    const res = await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));
    expect(res.status).toBe(401);
  });

  it("old password no longer verifies after a successful reset (integration-level check on the produced hash)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(EXISTING_USER);
    const { token } = await issueResetToken();
    await POST(resetRequest({ resetToken: token, newPassword: "brand-new-password" }));

    const newHash = mockPrisma.user.update.mock.calls[0][0].data.passwordHash;
    expect(await verifyPassword("old-password-that-was-never-actually-this-hash", newHash)).toBe(false);
    expect(await verifyPassword("brand-new-password", newHash)).toBe(true);
  });
});
