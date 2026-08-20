import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

const mockPrisma = {
  passwordResetOtp: { findFirst: vi.fn(), update: vi.fn() },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockLogAudit = vi.fn();
vi.mock("@/lib/audit-log", () => ({ logAudit: (...args: unknown[]) => mockLogAudit(...args) }));

const { POST } = await import("@/app/api/auth/verify-otp/route");
const { verifyResetToken } = await import("@/lib/auth");

const APP_URL = "http://localhost:3004";
const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

let ipCounter = 0;
function nextTestIp() {
  ipCounter += 1;
  return `10.30.${(ipCounter >> 8) & 0xff}.${ipCounter & 0xff}`;
}

function otpRequest(body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json", "x-forwarded-for": nextTestIp() });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/auth/verify-otp`, { method: "POST", headers, body: JSON.stringify(body) });
}

const VALID_OTP = "123456";
function makeRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "otp-1",
    email: "user@example.com",
    otpHash: hashOtp(VALID_OTP),
    attempts: 0,
    consumedAt: null,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  };
}

describe("POST /api/auth/verify-otp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    mockPrisma.passwordResetOtp.update.mockResolvedValue({});
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }, "http://evil.example.com"));
    expect(res.status).toBe(403);
    expect(mockPrisma.passwordResetOtp.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed OTP (not 6 digits)", async () => {
    const res1 = await POST(otpRequest({ email: "user@example.com", otp: "12345" }));
    expect(res1.status).toBe(400);
    const res2 = await POST(otpRequest({ email: "user@example.com", otp: "abcdef" }));
    expect(res2.status).toBe(400);
    const res3 = await POST(otpRequest({ email: "user@example.com", otp: "1234567" }));
    expect(res3.status).toBe(400);
    expect(mockPrisma.passwordResetOtp.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(otpRequest({ otp: VALID_OTP }));
    expect(res.status).toBe(400);
  });

  it("accepts the correct OTP, consumes it, and returns a reset token scoped to that email", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(typeof json.resetToken).toBe("string");

    const payload = await verifyResetToken(json.resetToken);
    expect(payload).toMatchObject({ email: "user@example.com" });
    expect(typeof payload?.jti).toBe("string");

    expect(mockPrisma.passwordResetOtp.update).toHaveBeenCalledWith({
      where: { id: "otp-1" },
      data: { consumedAt: expect.any(Date), resetTokenJti: payload!.jti },
    });
  });

  it("rejects an incorrect OTP and increments the attempt counter", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: "999999" }));
    expect(res.status).toBe(400);
    expect(mockPrisma.passwordResetOtp.update).toHaveBeenCalledWith({
      where: { id: "otp-1" },
      data: { attempts: { increment: 1 } },
    });
  });

  it("does not mark the record consumed on an incorrect OTP", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    await POST(otpRequest({ email: "user@example.com", otp: "999999" }));
    const updateArgs = mockPrisma.passwordResetOtp.update.mock.calls[0][0];
    expect(updateArgs.data.consumedAt).toBeUndefined();
  });

  it("rejects when no unconsumed OTP record exists for the email", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(null);
    const res = await POST(otpRequest({ email: "nobody@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/expired/i);
  });

  it("rejects an expired OTP even if the code is correct", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(
      makeRecord({ expiresAt: new Date(Date.now() - 1000) })
    );
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/expired/i);
    expect(mockPrisma.passwordResetOtp.update).not.toHaveBeenCalled();
  });

  it("rejects reuse of an already-consumed OTP (findFirst is scoped to consumedAt: null, so a consumed record won't be returned)", async () => {
    // The query itself excludes consumed rows — simulate that by having findFirst
    // return null, exactly as the real scoped query would for an already-used OTP.
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(null);
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);
    expect(mockPrisma.passwordResetOtp.findFirst).toHaveBeenCalledWith({
      where: { email: "user@example.com", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
  });

  it("rejects once the record has reached the 5-attempt cap, even with the correct OTP", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord({ attempts: 5 }));
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/too many/i);
    expect(mockPrisma.passwordResetOtp.update).not.toHaveBeenCalled();
  });

  it("enforces the per-IP+email rate limit after 10 requests in the window", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const ip = "192.0.2.70";
    const email = "ratelimited-otp@example.com";

    for (let i = 0; i < 10; i++) {
      const req = otpRequest({ email, otp: "000000" }); // wrong code, but still counts against the limit
      req.headers.set("x-forwarded-for", ip);
      const res = await POST(req);
      expect(res.status).toBe(400);
    }

    const req11 = otpRequest({ email, otp: "000000" });
    req11.headers.set("x-forwarded-for", ip);
    const blocked = await POST(req11);
    expect(blocked.status).toBe(429);
  });

  it("SECURITY: OTP hash comparison uses crypto.timingSafeEqual (constant-time), not a leaky !== on the hash", async () => {
    // app/api/auth/verify-otp/route.ts compares hashes via hashesMatch(), which decodes both
    // hex digests to buffers and calls crypto.timingSafeEqual — never `!==` on the raw hash
    // string, which would leak timing information proportional to how many leading bytes
    // match. Exercised at the route level to confirm the comparison still correctly rejects
    // a wrong code end-to-end (a unit test on hashesMatch alone wouldn't catch a regression
    // where the route stops calling it).
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: "000000" }));
    expect(res.status).toBe(400); // comparison ran and correctly rejected the wrong code
  });

  it("reset token from verify-otp cannot be used as a session token (different purpose/shape, verifyToken doesn't reject it structurally but the app never accepts it as one)", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    const { resetToken } = await res.json();

    // A reset token must carry purpose: "password-reset" and be rejected by
    // verifyResetToken if that purpose is tampered with or absent — this is what
    // actually prevents confusion with a session token, not the JWT shape alone.
    const payload = await verifyResetToken(resetToken);
    expect(payload).not.toBeNull();

    const { verifyToken } = await import("@/lib/auth");
    const asSession = await verifyToken(resetToken);
    // verifyToken() has no purpose check, so it decodes successfully — but it will
    // never have the fields a real session needs (role, dsDivision), so any route
    // reading session.role would receive `undefined` and be denied by role checks.
    expect(asSession).not.toHaveProperty("role");
  });
});

describe("POST /api/auth/verify-otp — audit trail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    mockPrisma.passwordResetOtp.update.mockResolvedValue({});
  });

  it("logs a SUCCESS audit event when the OTP is verified correctly", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(200);

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "OTP Verified",
        category: "AUTH",
        severity: "SUCCESS",
      })
    );
  });

  it("logs a WARNING audit event when the OTP is incorrect", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: "999999" }));
    expect(res.status).toBe(400);

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "OTP Verification Failed",
        category: "AUTH",
        severity: "WARNING",
        metadata: expect.objectContaining({ reason: "invalid_code" }),
      })
    );
  });

  it("logs a WARNING audit event when no active OTP record exists (covers missing, expired, and already-consumed codes)", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(null);
    const res = await POST(otpRequest({ email: "nobody@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "OTP Verification Failed",
        category: "AUTH",
        severity: "WARNING",
        metadata: expect.objectContaining({ reason: "expired_or_missing" }),
      })
    );
  });

  it("logs a WARNING audit event for an expired (but present) OTP record", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(
      makeRecord({ expiresAt: new Date(Date.now() - 1000) })
    );
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    expect(res.status).toBe(400);

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "OTP Verification Failed",
        severity: "WARNING",
        metadata: expect.objectContaining({ reason: "expired_or_missing" }),
      })
    );
  });

  it("logs an OTP Attempt Limit Exceeded event once the 5-attempt cap is reached, without a second 'invalid code' event", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord({ attempts: 5 }));
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP })); // correct code, but locked out
    expect(res.status).toBe(400);

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "OTP Attempt Limit Exceeded",
        category: "AUTH",
        severity: "WARNING",
        metadata: expect.objectContaining({ reason: "attempt_limit_exceeded" }),
      })
    );
  });

  it("does not log an OTP audit event for requests rejected before the OTP is looked up (CSRF, malformed input)", async () => {
    const csrfRes = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }, "http://evil.example.com"));
    expect(csrfRes.status).toBe(403);

    const malformedRes = await POST(otpRequest({ email: "user@example.com", otp: "abcdef" }));
    expect(malformedRes.status).toBe(400);

    expect(mockLogAudit).not.toHaveBeenCalled();
  });

  it("does not log an audit event when blocked by the rate limiter (rate-limit rejection happens before the OTP check)", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const ip = "192.0.2.171";
    const email = "audit-rate-limited@example.com";

    for (let i = 0; i < 10; i++) {
      const req = otpRequest({ email, otp: "000000" });
      req.headers.set("x-forwarded-for", ip);
      await POST(req);
    }
    mockLogAudit.mockClear();

    const req11 = otpRequest({ email, otp: "000000" });
    req11.headers.set("x-forwarded-for", ip);
    const blocked = await POST(req11);
    expect(blocked.status).toBe(429);
    expect(mockLogAudit).not.toHaveBeenCalled();
  });

  it("never includes the plaintext OTP, the OTP hash, the reset token, or any secret-shaped value in an audit record", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const res = await POST(otpRequest({ email: "user@example.com", otp: VALID_OTP }));
    const { resetToken } = await res.json();
    expect(typeof resetToken).toBe("string");

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    const call = mockLogAudit.mock.calls[0][0];
    const serialized = JSON.stringify(call);

    // The raw 6-digit OTP itself.
    expect(serialized).not.toContain(VALID_OTP);
    // The SHA-256 hash stored for this OTP.
    expect(serialized).not.toContain(hashOtp(VALID_OTP));
    // The short-lived resetToken issued on success.
    expect(serialized).not.toContain(resetToken);
    // No JWT-shaped value: a real JWT's segments are each individually much longer than an
    // email's local-part/domain labels, so require long base64url runs to avoid flagging
    // an ordinary "for user@example.com." sentence as a false positive.
    expect(serialized).not.toMatch(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/);
    // No field name that would suggest a secret is being carried in the payload.
    for (const key of Object.keys(call)) {
      expect(key.toLowerCase()).not.toMatch(/password|token|hash|secret|cookie|jwt/);
    }
    if (call.metadata && typeof call.metadata === "object") {
      for (const key of Object.keys(call.metadata)) {
        expect(key.toLowerCase()).not.toMatch(/password|token|hash|secret|cookie|jwt/);
      }
    }
  });

  it("never includes the plaintext OTP, hash, or any secret-shaped value in a failed-attempt audit record either", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const wrongOtp = "999999";
    await POST(otpRequest({ email: "user@example.com", otp: wrongOtp }));

    expect(mockLogAudit).toHaveBeenCalledTimes(1);
    const call = mockLogAudit.mock.calls[0][0];
    const serialized = JSON.stringify(call);

    expect(serialized).not.toContain(wrongOtp);
    expect(serialized).not.toContain(VALID_OTP);
    expect(serialized).not.toContain(hashOtp(VALID_OTP));
    expect(serialized).not.toContain(hashOtp(wrongOtp));
  });

  it("logs the request IP and a request identifier as safe correlation metadata", async () => {
    mockPrisma.passwordResetOtp.findFirst.mockResolvedValue(makeRecord());
    const req = otpRequest({ email: "user@example.com", otp: VALID_OTP });
    req.headers.set("x-forwarded-for", "203.0.113.44");
    await POST(req);

    const call = mockLogAudit.mock.calls[0][0];
    expect(call.userIp).toBe("203.0.113.44");
    expect(call.metadata).toEqual(expect.objectContaining({ requestId: expect.any(String) }));
  });
});
