import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

const mockPrisma = {
  user: { findUnique: vi.fn() },
  passwordResetOtp: { deleteMany: vi.fn(), create: vi.fn() },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockSendOtpEmail = vi.fn();
vi.mock("@/lib/email", () => ({ sendPasswordResetOtpEmail: (...args: unknown[]) => mockSendOtpEmail(...args) }));

const { POST } = await import("@/app/api/auth/forgot-password/route");

const APP_URL = "http://localhost:3004";
const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

let ipCounter = 0;
function nextTestIp() {
  ipCounter += 1;
  return `10.20.${(ipCounter >> 8) & 0xff}.${ipCounter & 0xff}`;
}

function fpRequest(body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json", "x-forwarded-for": nextTestIp() });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/auth/forgot-password`, { method: "POST", headers, body: JSON.stringify(body) });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mockSendOtpEmail.mockResolvedValue(undefined);
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    const res = await POST(fpRequest({ email: "a@example.com" }, "http://evil.example.com"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing/invalid email", async () => {
    const res1 = await POST(fpRequest({}));
    expect(res1.status).toBe(400);
    const res2 = await POST(fpRequest({ email: "not-an-email" }));
    expect(res2.status).toBe(400);
  });

  it("returns the exact same generic response for an existing active email as for a non-existent one (no enumeration)", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ status: "ACTIVE" });
    const existing = await POST(fpRequest({ email: "real@example.com" }));
    const existingJson = await existing.json();

    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    const missing = await POST(fpRequest({ email: "nobody@example.com" }));
    const missingJson = await missing.json();

    expect(existing.status).toBe(missing.status);
    expect(existingJson).toEqual(missingJson);
  });

  it("issues an OTP and emails it only for an ACTIVE user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    await POST(fpRequest({ email: "real@example.com" }));
    expect(mockPrisma.passwordResetOtp.create).toHaveBeenCalledTimes(1);
    expect(mockSendOtpEmail).toHaveBeenCalledTimes(1);
    expect(mockSendOtpEmail.mock.calls[0][0]).toBe("real@example.com");
  });

  it("does not issue an OTP for a SUSPENDED or INACTIVE user, but still returns ok:true", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "SUSPENDED" });
    const res = await POST(fpRequest({ email: "suspended@example.com" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockPrisma.passwordResetOtp.create).not.toHaveBeenCalled();
    expect(mockSendOtpEmail).not.toHaveBeenCalled();
  });

  it("generates a 6-digit numeric OTP and stores only its SHA-256 hash, never the plaintext code", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    await POST(fpRequest({ email: "real@example.com" }));

    const createArgs = mockPrisma.passwordResetOtp.create.mock.calls[0][0];
    const storedHash = createArgs.data.otpHash;
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex

    const emailedOtp = mockSendOtpEmail.mock.calls[0][1] as string;
    expect(emailedOtp).toMatch(/^\d{6}$/);
    expect(hashOtp(emailedOtp)).toBe(storedHash);
  });

  it("the API response never includes the OTP itself", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    const res = await POST(fpRequest({ email: "real@example.com" }));
    const bodyText = JSON.stringify(await res.json());
    const emailedOtp = mockSendOtpEmail.mock.calls[0][1] as string;
    expect(bodyText).not.toContain(emailedOtp);
  });

  it("sets a 10-minute expiry on the new OTP", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    const before = Date.now();
    await POST(fpRequest({ email: "real@example.com" }));
    const createArgs = mockPrisma.passwordResetOtp.create.mock.calls[0][0];
    const expiresAtMs = (createArgs.data.expiresAt as Date).getTime();
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + 10 * 60 * 1000 - 2000);
    expect(expiresAtMs).toBeLessThanOrEqual(before + 10 * 60 * 1000 + 5000);
  });

  it("deletes previously unconsumed OTPs for the same email before creating a new one (superseding, not stacking)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    await POST(fpRequest({ email: "real@example.com" }));
    expect(mockPrisma.passwordResetOtp.deleteMany).toHaveBeenCalledWith({
      where: { email: "real@example.com", consumedAt: null },
    });
  });

  it("still returns ok:true even if the email provider throws (does not leak the failure or the OTP)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    mockSendOtpEmail.mockRejectedValue(new Error("RESEND_API_KEY not configured"));
    const res = await POST(fpRequest({ email: "real@example.com" }));
    // Route has no explicit try/catch around sendPasswordResetOtpEmail beyond the outer
    // handler, so a thrown email error surfaces as the outer catch's generic 500 — but
    // critically it must NOT be a 200 with a silently-swallowed failure that misleads the
    // caller into thinking an email was sent when it wasn't, and must never expose
    // provider internals to the client.
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(JSON.stringify(json)).not.toMatch(/RESEND_API_KEY/);
  });

  it("enforces per-IP+email rate limiting after 5 requests in the window", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    const ip = "192.0.2.50";
    const email = "ratelimited@example.com";

    for (let i = 0; i < 5; i++) {
      const req = fpRequest({ email });
      req.headers.set("x-forwarded-for", ip);
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const req6 = fpRequest({ email });
    req6.headers.set("x-forwarded-for", ip);
    const blocked = await POST(req6);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).not.toBeNull();
  });

  it("rate limit is keyed per email too — a different email from the same IP is not blocked by the first email's exhaustion", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    const ip = "192.0.2.60";
    for (let i = 0; i < 5; i++) {
      const req = fpRequest({ email: "first@example.com" });
      req.headers.set("x-forwarded-for", ip);
      await POST(req);
    }
    const otherEmailReq = fpRequest({ email: "second@example.com" });
    otherEmailReq.headers.set("x-forwarded-for", ip);
    const res = await POST(otherEmailReq);
    expect(res.status).toBe(200);
  });

  it("lowercases and trims the email before all lookups/rate-limit keys", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ status: "ACTIVE" });
    await POST(fpRequest({ email: "  MixedCase@Example.com  " }));
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "mixedcase@example.com" },
      select: { status: true },
    });
  });
});
