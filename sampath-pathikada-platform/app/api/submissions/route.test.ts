import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/submissions/route");

const APP_URL = "http://localhost:3004";

function getRequest(url: string) {
  return new NextRequest(url);
}

const DS_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS One",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

const AD_SESSION = {
  userId: "ad-1",
  email: "ad@example.com",
  name: "AD One",
  role: "ASSISTANT_DIRECTOR_PLANNING",
  dsDivision: "galle-fg",
};

const ROW = {
  id: "sub-1",
  year: 2026,
  district: "galle",
  dsDivision: "galle-fg",
  gnDivision: "galle-fort",
  status: "SUBMITTED",
  rejectionNote: null,
  sectionReviews: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  reviewedAt: null,
  submittedBy: { id: "officer-1", name: "K. Perera", email: "officer@example.com", phone: null },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.submission.count.mockResolvedValue(1);
  mockPrisma.submission.findMany.mockResolvedValue([ROW]);
  mockPrisma.$queryRaw.mockResolvedValue([{ id: "sub-1", officerDesignation: "Grama Niladhari" }]);
});

describe("GET /api/submissions", () => {
  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/submissions`));
    expect(res.status).toBe(401);
  });

  it("does not select the full `data` JSON column in the list query — only lightweight scalar fields", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    await GET(getRequest(`${APP_URL}/api/submissions?year=2026&limit=100`));

    const call = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(call.select).not.toHaveProperty("data");
  });

  it("does not run the officerDesignation lookup query when the page is empty", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([]);
    mockPrisma.submission.count.mockResolvedValue(0);

    await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));

    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("fetches officerDesignation via a targeted JSON_EXTRACT query and merges it by id", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));
    const json = await res.json();

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(json.data[0].officerDesignation).toBe("Grama Niladhari");
    expect(json.data[0].data).toBeUndefined();
  });

  it("falls back to null officerDesignation when the JSON_EXTRACT query has no matching row", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const res = await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));
    const json = await res.json();

    expect(json.data[0].officerDesignation).toBeNull();
  });

  it("shapes sectionReviews down to counts instead of shipping the raw per-section object", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([
      { ...ROW, sectionReviews: { education: { status: "APPROVED", note: null, reviewedById: "ds-1", reviewedAt: "2026-01-01T00:00:00.000Z" } } },
    ]);

    const res = await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));
    const json = await res.json();

    expect(json.data[0].sectionReviews).toBeUndefined();
    expect(json.data[0].sectionReviewCounts).toMatchObject({ approved: 1 });
  });

  it("scopes a Divisional Secretariat to their own dsDivision", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));

    const call = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(call.where.dsDivision).toBe("galle-fg");
  });

  it("rejects a Divisional Secretariat with no assigned division", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));
    expect(res.status).toBe(403);
  });

  it("scopes a Divisional Secretariat to reviewStage DS", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));

    const call = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(call.where.reviewStage).toBe("DS");
  });

  it("scopes an Assistant Director Planning to their own dsDivision and reviewStage AD", async () => {
    mockGetSession.mockResolvedValue(AD_SESSION);
    await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));

    const call = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(call.where.dsDivision).toBe("galle-fg");
    expect(call.where.reviewStage).toBe("AD");
  });

  it("rejects an Assistant Director Planning with no assigned division", async () => {
    mockGetSession.mockResolvedValue({ ...AD_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/submissions?year=2026`));
    expect(res.status).toBe(403);
  });
});
