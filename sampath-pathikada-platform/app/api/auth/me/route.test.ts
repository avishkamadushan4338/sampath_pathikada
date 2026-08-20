import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = { user: { findUnique: vi.fn() } };
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

// getSession() reads the session cookie via next/headers' cookies(), which only works
// inside a real request context in Next.js. Mocking just that boundary keeps signToken/
// verifyToken/getSession itself fully real, so a tampered or expired JWT is genuinely
// rejected by real jose verification, not by a mock pretending to reject it.
let currentCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "sp_session" && currentCookieValue ? { value: currentCookieValue } : undefined),
  }),
}));

const { GET } = await import("@/app/api/auth/me/route");
const { signToken, COOKIE_NAME } = await import("@/lib/auth");

const SESSION_PAYLOAD = {
  userId: "user-1",
  email: "officer@example.com",
  name: "Officer One",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: null,
};

const DB_USER = {
  id: "user-1",
  name: "Officer One",
  nameSinhala: null,
  email: "officer@example.com",
  phone: "0771234567",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  district: "galle",
  dsDivision: null,
  gnDivision: "galle-gn-1",
  localGovt: null,
  electoral: null,
  farmers: null,
  eduZone: null,
  eduDiv: null,
  mahaweli: null,
};

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentCookieValue = undefined;
  });

  it("returns the caller's own profile for a valid session", async () => {
    currentCookieValue = await signToken(SESSION_PAYLOAD);
    mockPrisma.user.findUnique.mockResolvedValue(DB_USER);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe(SESSION_PAYLOAD.userId);
    expect(json.data.email).toBe(SESSION_PAYLOAD.email);

    // The lookup must be scoped to the session's own userId — never accept an id from
    // anywhere else (query/body), which would let a caller fetch another user's profile.
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: SESSION_PAYLOAD.userId },
      select: expect.any(Object),
    });
  });

  it("returns 401 when no session cookie is present", async () => {
    currentCookieValue = undefined;
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 for a tampered JWT", async () => {
    const valid = await signToken(SESSION_PAYLOAD);
    currentCookieValue = valid.slice(0, -4) + "abcd";
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 for garbage cookie content", async () => {
    currentCookieValue = "not-a-jwt-at-all";
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 for an expired JWT", async () => {
    // Sign a token that already expired via jose directly, bypassing SESSION_DURATION.
    const { SignJWT } = await import("jose");
    const { JWT_SECRET } = await import("@/lib/jwt-secret");
    const expired = await new SignJWT({ ...SESSION_PAYLOAD })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
      .sign(JWT_SECRET);

    currentCookieValue = expired;
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 404 if the session's user was deleted after the token was issued", async () => {
    currentCookieValue = await signToken(SESSION_PAYLOAD);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("never returns passwordHash or other sensitive columns (select-list regression)", async () => {
    currentCookieValue = await signToken(SESSION_PAYLOAD);
    mockPrisma.user.findUnique.mockResolvedValue(DB_USER);
    await GET();
    const call = mockPrisma.user.findUnique.mock.calls[0][0];
    expect(call.select.passwordHash).toBeUndefined();
    expect(call.select.loginAttempts).toBeUndefined();
  });

  it("a valid session for user A cannot be used to fetch user B's profile — identity comes only from the signed token", async () => {
    currentCookieValue = await signToken(SESSION_PAYLOAD);
    mockPrisma.user.findUnique.mockResolvedValue(DB_USER);
    await GET();
    // Regardless of anything else, the where-clause id must equal the token's own userId.
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } })
    );
  });

  it("COOKIE_NAME matches what the route/cookie mock expect (sp_session)", () => {
    expect(COOKIE_NAME).toBe("sp_session");
  });
});
