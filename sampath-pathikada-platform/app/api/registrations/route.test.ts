import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
  hashPassword: vi.fn(),
}));

const mockPrisma = {
  economicDevelopmentOfficerRegistration: { findMany: vi.fn(), count: vi.fn() },
  assistantDirectorPlanningRegistration: { findMany: vi.fn(), count: vi.fn() },
  divisionalSecretariatRegistration: { findMany: vi.fn(), count: vi.fn() },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock("@/lib/verification-docs", () => ({
  saveVerificationDoc: vi.fn(),
  deleteVerificationDocs: vi.fn(),
  cleanupPartialUpload: vi.fn(),
  InvalidDocumentError: class InvalidDocumentError extends Error {},
}));

const { GET } = await import("@/app/api/registrations/route");

const APP_URL = "http://localhost:3004";

function getRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/registrations — division scoping (IDOR regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.economicDevelopmentOfficerRegistration.findMany.mockResolvedValue([]);
    mockPrisma.assistantDirectorPlanningRegistration.findMany.mockResolvedValue([]);
    mockPrisma.divisionalSecretariatRegistration.findMany.mockResolvedValue([]);
    mockPrisma.economicDevelopmentOfficerRegistration.count.mockResolvedValue(0);
    mockPrisma.assistantDirectorPlanningRegistration.count.mockResolvedValue(0);
    mockPrisma.divisionalSecretariatRegistration.count.mockResolvedValue(0);
  });

  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(401);
  });

  it("denies an ADMIN with no dsDivision assigned, rather than falling through to an unscoped query", async () => {
    mockGetSession.mockResolvedValue({ userId: "admin-1", role: "ADMIN", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(403);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findMany).not.toHaveBeenCalled();
  });

  it("denies an ASSISTANT_DIRECTOR_PLANNING with no dsDivision assigned", async () => {
    mockGetSession.mockResolvedValue({ userId: "ad-1", role: "ASSISTANT_DIRECTOR_PLANNING", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(403);
  });

  it("denies a DIVISIONAL_SECRETARIAT with no dsDivision assigned", async () => {
    mockGetSession.mockResolvedValue({ userId: "ds-1", role: "DIVISIONAL_SECRETARIAT", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(403);
  });

  it("scopes an ADMIN's query to their own dsDivision", async () => {
    mockGetSession.mockResolvedValue({ userId: "admin-1", role: "ADMIN", dsDivision: "galle-fg" });
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(200);
    // The stale-doc cleanup job also calls findMany on this table first (unrelated where
    // shape, no dsDivision) — the actual list query is the last call, ordered by submittedAt.
    const calls = mockPrisma.economicDevelopmentOfficerRegistration.findMany.mock.calls;
    const listCall = calls.find((c) => c[0]?.orderBy?.submittedAt === "desc");
    expect(listCall?.[0].where.dsDivision).toBe("galle-fg");
  });

  it("does not scope a SUPER_ADMIN's query", async () => {
    mockGetSession.mockResolvedValue({ userId: "sa-1", role: "SUPER_ADMIN", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations`));
    expect(res.status).toBe(200);
    const calls = mockPrisma.economicDevelopmentOfficerRegistration.findMany.mock.calls;
    const listCall = calls.find((c) => c[0]?.orderBy?.submittedAt === "desc");
    expect(listCall?.[0].where.dsDivision).toBeUndefined();
  });

  it("also denies the countsOnly path for a division-less ADMIN, before hitting count queries", async () => {
    mockGetSession.mockResolvedValue({ userId: "admin-1", role: "ADMIN", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations?countsOnly=true`));
    expect(res.status).toBe(403);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.count).not.toHaveBeenCalled();
  });
});
