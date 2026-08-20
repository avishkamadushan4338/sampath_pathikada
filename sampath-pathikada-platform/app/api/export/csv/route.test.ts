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
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/export/csv/route");
const { EXPORT_ROW_CAP } = await import("@/lib/constants");

const APP_URL = "http://localhost:3004";

const SUPER_ADMIN_SESSION = {
  userId: "sa-1",
  email: "sa@example.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

function makeRow(i: number) {
  return {
    gnDivision: `gn-${i}`,
    dsDivision: "galle-fg",
    district: "galle",
    status: "APPROVED",
    createdAt: new Date(),
    reviewedAt: new Date(),
    data: {},
    submittedBy: { name: "Officer", email: "officer@example.com" },
  };
}

function getRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/export/csv — row cap (unbounded-query regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests take: EXPORT_ROW_CAP + 1, never an unbounded findMany", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1)]);
    await GET(getRequest(`${APP_URL}/api/export/csv?year=2026`));
    const arg = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(arg.take).toBe(EXPORT_ROW_CAP + 1);
  });

  it("returns 413 when the result exceeds the cap, without generating a CSV body", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const oversized = Array.from({ length: EXPORT_ROW_CAP + 1 }, (_, i) => makeRow(i));
    mockPrisma.submission.findMany.mockResolvedValue(oversized);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv?year=2026`));
    expect(res.status).toBe(413);
  });

  it("succeeds normally when the result is at or under the cap", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1), makeRow(2)]);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv?year=2026`));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });
});
