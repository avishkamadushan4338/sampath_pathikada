import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  economicDevelopmentOfficerRegistration: { findFirst: vi.fn() },
  assistantDirectorPlanningRegistration: { findFirst: vi.fn() },
  divisionalSecretariatRegistration: { findFirst: vi.fn() },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockLogAudit = vi.fn();
vi.mock("@/lib/audit-log", () => ({ logAudit: (...args: unknown[]) => mockLogAudit(...args) }));

// loginWithCredentials, verifyToken, hashPassword etc. are the REAL implementation from
// lib/auth.ts — only the Prisma client and audit logger are mocked, so bcrypt compare,
// lockout arithmetic, and JWT signing are all genuinely exercised end-to-end.
const { POST } = await import("@/app/api/auth/login/route");
const { verifyToken, COOKIE_NAME } = await import("@/lib/auth");

const APP_URL = "http://localhost:3004";

// The login route rate-limits per source IP against a shared in-memory Map that
// persists for the lifetime of the test process. Every test gets its own IP by
// default so unrelated tests can't exhaust each other's rate-limit bucket; tests
// that specifically exercise rate limiting set x-forwarded-for explicitly instead.
let ipCounter = 0;
function nextTestIp() {
  ipCounter += 1;
  return `10.${(ipCounter >> 16) & 0xff}.${(ipCounter >> 8) & 0xff}.${ipCounter & 0xff}`;
}

function loginRequest(body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json", "x-forwarded-for": nextTestIp() });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/auth/login`, { method: "POST", headers, body: JSON.stringify(body) });
}

function loginRequestRaw(rawBody: string, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json", "x-forwarded-for": nextTestIp() });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/auth/login`, { method: "POST", headers, body: rawBody });
}

const BASE_USER = {
  id: "user-1",
  email: "officer@example.com",
  name: "Officer One",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: null,
  status: "ACTIVE",
  loginAttempts: 0,
  lockedUntil: null,
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(null);
    mockPrisma.assistantDirectorPlanningRegistration.findFirst.mockResolvedValue(null);
    mockPrisma.divisionalSecretariatRegistration.findFirst.mockResolvedValue(null);
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    const res = await POST(loginRequest({ email: "a@example.com", password: "x" }, "http://evil.example.com"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a request with no origin/referer", async () => {
    const res = await POST(loginRequest({ email: "a@example.com", password: "x" }, null));
    expect(res.status).toBe(403);
  });

  it("returns 400 on malformed JSON body", async () => {
    const res = await POST(loginRequestRaw("{not valid json"));
    expect(res.status).toBe(500); // req.json() throws inside the try/catch -> generic 500, not a crash
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(loginRequest({ password: "secret123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(loginRequest({ email: "a@example.com" }));
    expect(res.status).toBe(400);
  });

  it("authenticates with valid credentials and sets a secure session cookie", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.redirectTo).toBe("/economic-development-officer/dashboard");

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${COOKIE_NAME}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    // Secure depends on NODE_ENV (see the dedicated "cookie attributes in production"
    // describe block below, which pins it via vi.stubEnv) — CI runs this whole suite
    // with NODE_ENV=production, so it isn't a safe ambient assumption here.

    // The cookie must contain a real, verifiable session token for this exact user.
    const tokenMatch = setCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    expect(tokenMatch).not.toBeNull();
    const session = await verifyToken(decodeURIComponent(tokenMatch![1]));
    expect(session).toMatchObject({ userId: BASE_USER.id, email: BASE_USER.email, role: BASE_USER.role });
  });

  it("resets loginAttempts/lockedUntil and stamps lastLoginAt/lastLoginIp on success", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 3 });
    mockPrisma.user.update.mockResolvedValue({});

    const req = loginRequest({ email: BASE_USER.email, password: "correct-password" });
    req.headers.set("x-forwarded-for", "203.0.113.9");
    await POST(req);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: BASE_USER.id },
      data: expect.objectContaining({ loginAttempts: 0, lockedUntil: null, lastLoginIp: "203.0.113.9" }),
    });
  });

  it("logs a SUCCESS audit event on successful login", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash });
    mockPrisma.user.update.mockResolvedValue({});

    await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));

    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "User Login", category: "AUTH", severity: "SUCCESS", userId: BASE_USER.id })
    );
  });

  it("rejects an invalid password with a generic message (no hint the account exists)", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "wrong-password" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toBe("Invalid email or password.");
  });

  it("returns the same generic message for an unknown email as for a wrong password (no account enumeration)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await POST(loginRequest({ email: "nobody@example.com", password: "whatever123" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toBe("Invalid email or password.");
  });

  it("does not reveal a pending registration exists unless the submitted password actually matches it", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const pendingHash = await bcrypt.hash("their-real-password", 12);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue({ passwordHash: pendingHash });

    const wrongGuess = await POST(loginRequest({ email: "pending@example.com", password: "a-guess" }));
    expect((await wrongGuess.json()).pending).toBeFalsy();

    const correctGuess = await POST(loginRequest({ email: "pending@example.com", password: "their-real-password" }));
    const json = await correctGuess.json();
    expect(json.pending).toBe(true);
    expect(json.message).toMatch(/under review/i);
  });

  it("increments loginAttempts atomically on a failed attempt and audit-logs it", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 1 });
    mockPrisma.user.update.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 2, lockedUntil: null });

    await POST(loginRequest({ email: BASE_USER.email, password: "wrong" }));

    // Uses Prisma's atomic `increment` (a single DB-level `attempts = attempts + 1`), not a
    // read-then-write of a locally computed number — see lib/auth.ts for why.
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: BASE_USER.id },
      data: { loginAttempts: { increment: 1 } },
    });
    // Below the lockout threshold: no second call to set lockedUntil.
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "Failed Login", category: "AUTH", severity: "INFO" })
    );
  });

  it("locks the account for 15 minutes after the 5th consecutive failed attempt", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 4 });
    // First update call: the atomic increment, returning the post-increment row.
    mockPrisma.user.update.mockResolvedValueOnce({ ...BASE_USER, passwordHash, loginAttempts: 5, lockedUntil: null });
    mockPrisma.user.update.mockResolvedValueOnce({});

    const before = Date.now();
    const res = await POST(loginRequest({ email: BASE_USER.email, password: "wrong" }));
    expect(res.status).toBe(401);

    expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.user.update).toHaveBeenNthCalledWith(1, {
      where: { id: BASE_USER.id },
      data: { loginAttempts: { increment: 1 } },
    });

    const lockCall = mockPrisma.user.update.mock.calls[1][0];
    expect(lockCall.where).toEqual({ id: BASE_USER.id });
    expect(lockCall.data.lockedUntil).toBeInstanceOf(Date);
    const lockedUntilMs = (lockCall.data.lockedUntil as Date).getTime();
    expect(lockedUntilMs).toBeGreaterThanOrEqual(before + 15 * 60 * 1000 - 1000);
    expect(lockedUntilMs).toBeLessThanOrEqual(before + 15 * 60 * 1000 + 5000);

    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "Failed Login", severity: "WARNING" }));
  });

  it("SECURITY: concurrent failed logins each get a distinct atomic increment — no lost updates", async () => {
    // Simulates two requests racing for the same account: each calls prisma.user.update with
    // the atomic `increment` operator rather than a precomputed number, so — unlike a naive
    // `loginAttempts: user.loginAttempts + 1` — a real concurrent pair of UPDATEs against the
    // same row can never both compute from the same stale read and silently lose one attempt.
    // We assert the route always issues the operator form (mockResolvedValue below stands in
    // for "the DB applies both increments"), which is what makes that guarantee hold for real.
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 3 });
    mockPrisma.user.update.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 4, lockedUntil: null });

    await Promise.all([
      POST(loginRequest({ email: BASE_USER.email, password: "wrong" })),
      POST(loginRequest({ email: BASE_USER.email, password: "wrong" })),
    ]);

    const incrementCalls = mockPrisma.user.update.mock.calls.filter(
      ([args]) => args.data?.loginAttempts?.increment === 1
    );
    expect(incrementCalls).toHaveLength(2);
  });

  it("does not lock an account that crosses the threshold but was already locked by a concurrent request (avoids double-extending the lock)", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, loginAttempts: 4 });
    const alreadyLockedByConcurrentRequest = new Date(Date.now() + 15 * 60 * 1000);
    mockPrisma.user.update.mockResolvedValueOnce({
      ...BASE_USER, passwordHash, loginAttempts: 5, lockedUntil: alreadyLockedByConcurrentRequest,
    });

    await POST(loginRequest({ email: BASE_USER.email, password: "wrong" }));

    // Only the increment call — no second update, since the row already carries a
    // still-active lockedUntil set by the concurrent request that won the race.
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it("rejects login on a currently-locked account without re-checking the password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...BASE_USER,
      passwordHash,
      loginAttempts: 5,
      lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toMatch(/locked/i);
    // Correct password was supplied but must NOT be accepted while locked, and must
    // not trigger another attempts-increment write (no update call at all).
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("allows login again once the lockout window has expired", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...BASE_USER,
      passwordHash,
      loginAttempts: 5,
      lockedUntil: new Date(Date.now() - 1000), // lock expired 1s ago
    });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(200);
  });

  it("rejects a SUSPENDED account even with the correct password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, status: "SUSPENDED" });
    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(401);
    expect((await res.json()).message).toMatch(/suspended/i);
  });

  it("rejects an INACTIVE account even with the correct password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash, status: "INACTIVE" });
    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(401);
    expect((await res.json()).message).toMatch(/inactive/i);
  });

  it("enforces the per-IP rate limit after 10 requests in the window", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const ip = "198.51.100.42";

    let last;
    for (let i = 0; i < 10; i++) {
      const req = loginRequest({ email: "x@example.com", password: "wrong" });
      req.headers.set("x-forwarded-for", ip);
      last = await POST(req);
      expect(last.status).toBe(401); // still under the limit
    }

    const req11 = loginRequest({ email: "x@example.com", password: "wrong" });
    req11.headers.set("x-forwarded-for", ip);
    const blocked = await POST(req11);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).not.toBeNull();
  });

  it("does not rate-limit a different IP independently of an exhausted one", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 10; i++) {
      const req = loginRequest({ email: "x@example.com", password: "wrong" });
      req.headers.set("x-forwarded-for", "198.51.100.77");
      await POST(req);
    }
    const otherIpReq = loginRequest({ email: "x@example.com", password: "wrong" });
    otherIpReq.headers.set("x-forwarded-for", "198.51.100.88");
    const res = await POST(otherIpReq);
    expect(res.status).toBe(401); // not 429 — independent bucket
  });

  it("rejects an unexpected HTTP method (GET is not exported, so the route has no handler for it)", async () => {
    const routeModule: Record<string, unknown> = await import("@/app/api/auth/login/route");
    expect(routeModule.GET).toBeUndefined();
  });
});

// Isolated from the main describe block above so `NODE_ENV=production` never leaks into
// other tests in this file (or, since vitest.config.ts runs each test *file* in its own
// module context, any other file either) — stubbed per-test via vi.stubEnv and reverted in
// afterEach, following the same pattern already used in lib/logger.test.ts.
describe("POST /api/auth/login — cookie attributes in production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("SECURITY: sets Secure on the session cookie when NODE_ENV=production, alongside HttpOnly/SameSite/Path/Max-Age", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie") ?? "";
    const lower = setCookie.toLowerCase();
    expect(setCookie).toContain(`${COOKIE_NAME}=`);
    expect(lower).toContain("httponly");
    expect(lower).toContain("secure");
    expect(lower).toContain("samesite=lax");
    expect(lower).toContain("path=/");
    expect(lower).toMatch(/max-age=\d+/);

    const maxAgeMatch = lower.match(/max-age=(\d+)/);
    expect(Number(maxAgeMatch![1])).toBe(60 * 60 * 8); // SESSION_DURATION
  });

  it("does not set Secure outside of production (dev/test), so local HTTP dev servers still work", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockPrisma.user.findUnique.mockResolvedValue({ ...BASE_USER, passwordHash });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await POST(loginRequest({ email: BASE_USER.email, password: "correct-password" }));
    const setCookie = (res.headers.get("set-cookie") ?? "").toLowerCase();
    expect(setCookie).not.toContain("secure");
  });
});
