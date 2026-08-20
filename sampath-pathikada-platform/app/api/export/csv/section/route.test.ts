import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: { findMany: vi.fn() },
  economicDevelopmentOfficerRegistration: { findMany: vi.fn() },
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/export/csv/section/route");
const { EXPORT_ROW_CAP } = await import("@/lib/constants");

const APP_URL = "http://localhost:3004";

const SUPER_ADMIN_SESSION = { userId: "sa-1", role: "SUPER_ADMIN", dsDivision: null };
const ADMIN_SESSION = { userId: "admin-1", role: "ADMIN", dsDivision: "galle-fg" };

function makeSubmissionRow(gn: string) {
  return {
    gnDivision: gn,
    dsDivision: "galle-fg",
    district: "galle",
    status: "APPROVED",
    createdAt: new Date("2026-01-01"),
    reviewedAt: new Date("2026-01-02"),
    data: {
      housing: { housingCounts: { total: 100, permanent: 80, semiPermanent: 15, nonPermanent: 5 } },
    },
    submittedBy: { name: "Officer", email: "officer@example.com" },
  };
}

function getRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/export/csv/section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing`));
    expect(res.status).toBe(401);
  });

  it("rejects a missing section param", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section`));
    expect(res.status).toBe(400);
  });

  it("rejects an unknown section slug", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=not-a-real-section`));
    expect(res.status).toBe(400);
  });

  it("denies an ADMIN with no dsDivision assigned", async () => {
    mockGetSession.mockResolvedValue({ userId: "admin-1", role: "ADMIN", dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing`));
    expect(res.status).toBe(403);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });

  it("scopes an ADMIN's query to their own dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeSubmissionRow("galle-fort")]);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing`));
    expect(res.status).toBe(200);
    const arg = mockPrisma.submission.findMany.mock.calls[0][0];
    expect(arg.where.dsDivision).toBe("galle-fg");
  });

  it("returns only the requested section's columns, plus identity columns — not the full 15-section export", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeSubmissionRow("galle-fort")]);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing&year=2026`));
    expect(res.status).toBe(200);
    const text = await res.text();
    const header = text.split("\r\n")[0];
    expect(header).toContain("Housing: Total Units");
    expect(header).toContain("GN Division");
    // Columns from other sections must not leak into a section-scoped export.
    expect(header).not.toContain("Demographics:");
    expect(header).not.toContain("Education:");
    expect(header).not.toContain("Agriculture:");
  });

  it("caps the query and returns 413 for an unbounded result, same as the whole-export route", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const oversized = Array.from({ length: EXPORT_ROW_CAP + 1 }, (_, i) => makeSubmissionRow(`gn-${i}`));
    mockPrisma.submission.findMany.mockResolvedValue(oversized);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing`));
    expect(res.status).toBe(413);
  });

  it("routes the 'identification' section through the registrations directory, not submission data", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findMany.mockResolvedValue([
      {
        id: "reg-1", name: "K. Perera", phone: "0771234567", gnDivision: "galle-fort",
        district: "galle", dsDivision: "galle-fg",
        localGovt: "Galle MC", electoral: "Galle", farmers: "Galle ASC",
        eduZone: "Galle", eduDiv: "Galle", mahaweli: null,
      },
    ]);
    mockPrisma.$queryRaw.mockResolvedValue([{ gnDivision: "galle-fort", officerDesignation: "GN Officer" }]);

    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=identification`));
    expect(res.status).toBe(200);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findMany).toHaveBeenCalled();

    const text = await res.text();
    expect(text).toContain("Officer Designation");
    expect(text).toContain("K. Perera");
    expect(text).toContain("GN Officer");
  });

  it("scopes the identification export to an ADMIN's own dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findMany.mockResolvedValue([]);
    mockPrisma.$queryRaw.mockResolvedValue([]);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=identification`));
    expect(res.status).toBe(200);
    const arg = mockPrisma.economicDevelopmentOfficerRegistration.findMany.mock.calls[0][0];
    expect(arg.where.dsDivision).toBe("galle-fg");
  });

  it("sets a Content-Disposition header naming the section and a CSV content type", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeSubmissionRow("galle-fort")]);
    const res = await GET(getRequest(`${APP_URL}/api/export/csv/section?section=housing&year=2026`));
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("housing-");
  });
});
