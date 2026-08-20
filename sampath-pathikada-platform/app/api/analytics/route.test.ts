import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: {
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
  divisionProfile: {
    findMany: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/analytics/route");

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

const AD_SESSION = {
  userId: "ad-1",
  email: "ad@example.com",
  name: "AD Officer",
  role: "ASSISTANT_DIRECTOR_PLANNING",
  dsDivision: "galle-fg",
};

const DS_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS Officer",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

const FORBIDDEN_SESSION = {
  userId: "edo-1",
  email: "edo@example.com",
  name: "EDO Officer",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: "galle-fg",
};

function getRequest(url: string) {
  return new NextRequest(url);
}

function submissionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    gnDivision: "3-1-39-005",
    status: "APPROVED",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-05T00:00:00.000Z"),
    reviewedAt: new Date("2026-01-05T00:00:00.000Z"),
    data: {},
    submittedBy: { name: "Officer One", email: "officer1@example.com" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.submission.findMany.mockResolvedValue([]);
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.divisionProfile.findMany.mockResolvedValue([]);
});

describe("GET /api/analytics — authentication", () => {
  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/analytics — authorization", () => {
  it.each([
    ["SUPER_ADMIN", SUPER_ADMIN_SESSION],
    ["ADMIN", ADMIN_SESSION],
    ["ASSISTANT_DIRECTOR_PLANNING", AD_SESSION],
    ["DIVISIONAL_SECRETARIAT", DS_SESSION],
  ])("allows %s", async (_label, session) => {
    mockGetSession.mockResolvedValue(session);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(200);
  });

  it("rejects a forbidden role (ECONOMIC_DEVELOPMENT_OFFICER)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });

  it("denies a division-scoped ADMIN with no dsDivision assigned, rather than falling through to an unscoped query", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(403);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });

  it("scopes ADMIN's query to their own dsDivision even if a different dsDivision is requested (division-scoping violation attempt)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?dsDivision=matara-fg`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("galle-fg");
  });

  it("scopes DIVISIONAL_SECRETARIAT's query to their own dsDivision regardless of query params (IDOR attempt)", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?dsDivision=matara-fg&district=matara`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("galle-fg");
  });

  it("lets SUPER_ADMIN optionally scope by dsDivision query param", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?dsDivision=matara-fg`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("matara-fg");
  });

  it("lets SUPER_ADMIN query unscoped (no dsDivision/district in where)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBeUndefined();
    expect(where.district).toBeUndefined();
  });

  it("lets SUPER_ADMIN scope by district query param", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?district=matara`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.district).toBe("matara");
  });
});

describe("GET /api/analytics — validation", () => {
  it("defaults to CURRENT_YEAR when no year is given (valid input)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.year).toBe(2026);
  });

  it("accepts an explicit valid year", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?year=2025`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.year).toBe(2025);
    expect(mockPrisma.submission.findMany.mock.calls[0][0].where.year).toBe(2025);
  });

  it("ignores an unknown status filter (malformed input) rather than erroring", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?status=NOT_A_REAL_STATUS`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.status).toBeUndefined();
  });

  it("accepts a valid status filter, case-insensitively", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?status=approved`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.status).toBe("APPROVED");
  });

  it("handles a non-numeric year (boundary/malformed input) by producing NaN passed straight through, not crashing", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?year=not-a-year`));
    expect(res.status).toBe(200);
  });

  it("parses a comma-separated gnDivisions filter, trimming whitespace and dropping empties", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?gnDivisions=${encodeURIComponent("3-1-39-005, 3-1-39-010,")}`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.gnDivision).toEqual({ in: ["3-1-39-005", "3-1-39-010"] });
  });

  it("ignores unexpected/extra query params without error", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics?bogusParam=xyz&another=1`));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/analytics — data behavior", () => {
  it("returns zeroed aggregates for an empty dataset", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([]);
    mockPrisma.divisionProfile.findMany.mockResolvedValue([]);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.totalSubmissions).toBe(0);
    expect(json.funnel.approved).toBe(0);
    expect(json.approvalRate).toBeNull();
    expect(json.avgDecisionDays).toBeNull();
  });

  it("computes funnel counts and approval rate correctly for a normal mixed dataset (aggregation correctness)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([
      submissionRow({ id: "s1", gnDivision: "3-1-39-005", status: "APPROVED" }),
      submissionRow({ id: "s2", gnDivision: "3-1-39-010", status: "APPROVED" }),
      submissionRow({ id: "s3", gnDivision: "3-1-39-015", status: "REJECTED" }),
      submissionRow({ id: "s4", gnDivision: "3-1-39-020", status: "SUBMITTED", reviewedAt: null }),
    ]);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.totalSubmissions).toBe(4);
    expect(json.funnel.approved).toBe(2);
    expect(json.funnel.rejected).toBe(1);
    expect(json.funnel.submitted).toBe(1);
    // approvalRate = approved / (approved + rejected) * 100 = 2/3 -> 67
    expect(json.approvalRate).toBe(67);
  });

  it("computes avgDecisionDays only from decided submissions with a reviewedAt timestamp", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([
      submissionRow({
        id: "s1",
        gnDivision: "3-1-39-005",
        status: "APPROVED",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        reviewedAt: new Date("2026-01-03T00:00:00.000Z"), // 2 days
      }),
      submissionRow({
        id: "s2",
        gnDivision: "3-1-39-010",
        status: "SUBMITTED",
        reviewedAt: null, // excluded — not decided
      }),
    ]);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    const json = await res.json();
    expect(json.avgDecisionDays).toBe(2);
  });

  it("reflects the scope's role in the response", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/analytics`));
    const json = await res.json();
    expect(json.scope.role).toBe("ADMIN");
    expect(json.scope.dsDivision.id).toBe("galle-fg");
  });
});
