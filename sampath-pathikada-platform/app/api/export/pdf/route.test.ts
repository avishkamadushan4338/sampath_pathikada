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

const { GET } = await import("@/app/api/export/pdf/route");
const { EXPORT_ROW_CAP } = await import("@/lib/constants");

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

function makeRow(i: number, overrides: Record<string, unknown> = {}) {
  return {
    gnDivision: `3-1-39-${String(i).padStart(3, "0")}`,
    status: "APPROVED",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    reviewedAt: new Date("2026-01-05T00:00:00.000Z"),
    data: {},
    submittedBy: { name: `Officer ${i}` },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.submission.findMany.mockResolvedValue([]);
});

describe("GET /api/export/pdf — authentication", () => {
  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/export/pdf — authorization", () => {
  it.each([
    ["SUPER_ADMIN", SUPER_ADMIN_SESSION],
    ["ADMIN", ADMIN_SESSION],
  ])("allows %s", async (_label, session) => {
    mockGetSession.mockResolvedValue(session);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(res.status).toBe(200);
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(res.status).toBe(401);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });

  it("denies a division-scoped ADMIN with no dsDivision assigned, rather than falling through to an unscoped export", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(res.status).toBe(403);
    expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
  });

  it("scopes ADMIN's export to their own dsDivision regardless of query params (division-scoping / IDOR attempt)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?dsDivision=matara-fg&district=matara`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("galle-fg");
  });

  it("lets SUPER_ADMIN scope by dsDivision or district query params", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?district=matara`));
    expect(res.status).toBe(200);
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.district).toBe("matara");
  });
});

describe("GET /api/export/pdf — validation", () => {
  it("defaults to CURRENT_YEAR when no year is given (valid input)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    await GET(getRequest(`${APP_URL}/api/export/pdf`));
    expect(mockPrisma.submission.findMany.mock.calls[0][0].where.year).toBe(2026);
  });

  it("accepts an explicit valid year", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    await GET(getRequest(`${APP_URL}/api/export/pdf?year=2025`));
    expect(mockPrisma.submission.findMany.mock.calls[0][0].where.year).toBe(2025);
  });

  it("parses a comma-separated gnDivisions filter and ignores unexpected extra params", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    await GET(getRequest(`${APP_URL}/api/export/pdf?gnDivisions=${encodeURIComponent("3-1-39-005, 3-1-39-010")}&bogus=1`));
    const where = mockPrisma.submission.findMany.mock.calls[0][0].where;
    expect(where.gnDivision).toEqual({ in: ["3-1-39-005", "3-1-39-010"] });
  });

  it("handles a non-numeric year (malformed input) without crashing", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=not-a-year`));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/export/pdf — row cap / large dataset protection", () => {
  it("requests take: EXPORT_ROW_CAP + 1, never an unbounded findMany", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1)]);
    await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    expect(mockPrisma.submission.findMany.mock.calls[0][0].take).toBe(EXPORT_ROW_CAP + 1);
  });

  it("returns 413 when the result exceeds the cap, without generating a PDF body", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const oversized = Array.from({ length: EXPORT_ROW_CAP + 1 }, (_, i) => makeRow(i));
    mockPrisma.submission.findMany.mockResolvedValue(oversized);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    expect(res.status).toBe(413);
    expect(res.headers.get("content-type")).not.toContain("application/pdf");
  });
});

describe("GET /api/export/pdf — empty datasets", () => {
  it("generates a valid PDF response for zero rows", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([]);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    expect(res.status).toBe(200);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
  });
});

describe("GET /api/export/pdf — generation, content type, filename", () => {
  it("returns the correct PDF content type", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1), makeRow(2)]);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    expect(res.headers.get("content-type")).toBe("application/pdf");
  });

  it("sets a Content-Disposition attachment header with a scoped filename", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1)]);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026&dsDivision=galle-fg`));
    const disposition = res.headers.get("content-disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain("division-summary-galle-fg-2026.pdf");
  });

  it("uses 'all' as the scope slug when unscoped (SUPER_ADMIN, no filters)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1)]);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    expect(res.headers.get("content-disposition")).toContain("division-summary-all-2026.pdf");
  });

  it("produces a well-formed PDF binary body for normal data (generation correctness smoke test)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.submission.findMany.mockResolvedValue([makeRow(1), makeRow(2), makeRow(3)]);
    const res = await GET(getRequest(`${APP_URL}/api/export/pdf?year=2026`));
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.slice(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
