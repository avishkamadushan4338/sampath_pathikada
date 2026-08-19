import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  auditLog: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/audit-logs/route");

const APP_URL = "http://localhost:3004";

function getRequest(url: string) {
  return new NextRequest(url);
}

const SUPER_ADMIN_SESSION = {
  userId: "admin-1",
  email: "admin@example.com",
  name: "Admin One",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

const DS_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS One",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-ds",
};

const AD_SESSION = {
  userId: "ad-1",
  email: "ad@example.com",
  name: "AD One",
  role: "ASSISTANT_DIRECTOR_PLANNING",
  dsDivision: "galle-ds",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
  mockPrisma.auditLog.count.mockResolvedValue(0);
  mockPrisma.auditLog.findMany.mockResolvedValue([]);
});

describe("GET /api/audit-logs", () => {
  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs`));
    expect(res.status).toBe(401);
  });

  it("rejects a role that isn't Super Admin or Divisional Secretariat", async () => {
    mockGetSession.mockResolvedValue({ userId: "edo-1", role: "ECONOMIC_DEVELOPMENT_OFFICER", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs`));
    expect(res.status).toBe(401);
  });

  it("lets Super Admin query without any division restriction", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs?category=admin`));
    expect(res.status).toBe(200);
    const where = mockPrisma.auditLog.findMany.mock.calls[0][0].where;
    expect(where.category).toBe("ADMIN");
    expect(where.user).toBeUndefined();
  });

  it("scopes a Divisional Secretariat's query to their own division, DATA category, and WARNING/ERROR severity — regardless of what they ask for", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    // Attempt to request an unrelated category/severity — should be overridden, not honored.
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs?category=admin&severity=info`));
    expect(res.status).toBe(200);
    const where = mockPrisma.auditLog.findMany.mock.calls[0][0].where;
    expect(where.category).toBe("DATA");
    expect(where.severity).toEqual({ in: ["WARNING", "ERROR"] });
    expect(where.user).toEqual({ dsDivision: "galle-ds" });
  });

  it("returns an empty result for a Divisional Secretariat with no division assigned, without querying the database", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, data: [], total: 0 });
    expect(mockPrisma.auditLog.findMany).not.toHaveBeenCalled();
  });

  it("scopes an Assistant Director Planning's query to their own division, DATA category, and WARNING/ERROR severity — regardless of what they ask for", async () => {
    mockGetSession.mockResolvedValue(AD_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs?category=admin&severity=info`));
    expect(res.status).toBe(200);
    const where = mockPrisma.auditLog.findMany.mock.calls[0][0].where;
    expect(where.category).toBe("DATA");
    expect(where.severity).toEqual({ in: ["WARNING", "ERROR"] });
    expect(where.user).toEqual({ dsDivision: "galle-ds" });
  });

  it("returns an empty result for an Assistant Director Planning with no division assigned, without querying the database", async () => {
    mockGetSession.mockResolvedValue({ ...AD_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/audit-logs`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, data: [], total: 0 });
    expect(mockPrisma.auditLog.findMany).not.toHaveBeenCalled();
  });
});
