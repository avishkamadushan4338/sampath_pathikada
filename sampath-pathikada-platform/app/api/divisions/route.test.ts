import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: {
    groupBy: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/divisions/route");

const APP_URL = "http://localhost:3004";

const SUPER_ADMIN_SESSION = {
  userId: "sa-1",
  email: "sa@example.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

const ADMIN_SESSION = {
  userId: "admin-1",
  email: "admin@example.com",
  name: "Division Admin",
  role: "ADMIN",
  dsDivision: "galle-fg",
};

const FORBIDDEN_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS Officer",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

function getRequest(url: string) {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.submission.groupBy.mockResolvedValue([]);
});

describe("GET /api/divisions — authentication", () => {
  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.groupBy).not.toHaveBeenCalled();
  });
});

describe("GET /api/divisions — authorization", () => {
  it.each([
    ["SUPER_ADMIN", SUPER_ADMIN_SESSION],
    ["ADMIN", ADMIN_SESSION],
  ])("allows %s", async (_label, session) => {
    mockGetSession.mockResolvedValue(session);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    expect(res.status).toBe(200);
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.groupBy).not.toHaveBeenCalled();
  });

  it("does not scope the roster by the ADMIN's own division — this route returns the full DS roster for all roles it allows", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(1);
  });
});

describe("GET /api/divisions — validation", () => {
  it("returns the full roster with no district filter (valid input)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.districts).toBeDefined();
  });

  it("filters the roster down when a valid district is given", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?district=galle`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.every((d: { districtId: string }) => d.districtId === "galle")).toBe(true);
  });

  it("returns an empty array for an unknown/malformed district id, without erroring", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?district=not-a-real-district`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("ignores unexpected extra query params", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?bogus=1`));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/divisions — data behavior / aggregation correctness", () => {
  it("returns zeroed stats per division for an empty dataset", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.groupBy.mockResolvedValue([]);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?district=galle`));
    const json = await res.json();
    const galleFg = json.data.find((d: { id: string }) => d.id === "galle-fg");
    expect(galleFg).toMatchObject({ submitted: 0, approved: 0, rejected: 0, total: 0 });
  });

  it("aggregates groupBy counts into per-status totals correctly for normal data", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.groupBy.mockResolvedValue([
      { dsDivision: "galle-fg", status: "APPROVED", _count: { _all: 5 } },
      { dsDivision: "galle-fg", status: "REJECTED", _count: { _all: 2 } },
      { dsDivision: "galle-fg", status: "SUBMITTED", _count: { _all: 3 } },
      { dsDivision: "galle-fg", status: "DRAFT", _count: { _all: 1 } },
    ]);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?district=galle`));
    const json = await res.json();
    const galleFg = json.data.find((d: { id: string }) => d.id === "galle-fg");
    expect(galleFg.approved).toBe(5);
    expect(galleFg.rejected).toBe(2);
    expect(galleFg.submitted).toBe(3);
    expect(galleFg.total).toBe(11); // sum of all statuses including DRAFT
  });

  it("scopes the groupBy query to the current reporting year", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    await GET(getRequest(`${APP_URL}/api/divisions`));
    const arg = mockPrisma.submission.groupBy.mock.calls[0][0];
    expect(arg.where.year).toBe(2026);
  });

  it("includes a GN division count per DS division", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/divisions?district=galle`));
    const json = await res.json();
    const galleFg = json.data.find((d: { id: string }) => d.id === "galle-fg");
    expect(galleFg.gnDivisionCount).toBeGreaterThan(0);
  });
});
