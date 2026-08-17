import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  divisionProfile: {
    findUnique: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/division-profile/route");

const APP_URL = "http://localhost:3004";

function getRequest(url: string) {
  return new NextRequest(url);
}

// Kurunduwatta is a real GN division inside the galle-fg DS division (lib/registration-data.ts).
const GALLE_GN_DIVISION = "3-1-39-020";

const ADMIN_SESSION = {
  userId: "admin-1",
  email: "admin@example.com",
  name: "Admin One",
  role: "ADMIN",
  dsDivision: "galle-fg",
};

const OTHER_DIVISION_ADMIN_SESSION = {
  ...ADMIN_SESSION,
  userId: "admin-2",
  dsDivision: "matara-fg",
};

const SUPER_ADMIN_SESSION = {
  userId: "super-1",
  email: "super@example.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

const EDO_SESSION = {
  userId: "officer-1",
  email: "officer@example.com",
  name: "Officer One",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.divisionProfile.findUnique.mockResolvedValue(null);
});

describe("GET /api/division-profile", () => {
  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    expect(res.status).toBe(401);
  });

  it("rejects a role that isn't a reviewer role", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    expect(res.status).toBe(401);
  });

  it("requires a gnDivision query param", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/division-profile`));
    expect(res.status).toBe(400);
  });

  it("404s for an Admin requesting a GN division outside their assigned DS division", async () => {
    mockGetSession.mockResolvedValue(OTHER_DIVISION_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    expect(res.status).toBe(404);
    expect(mockPrisma.divisionProfile.findUnique).not.toHaveBeenCalled();
  });

  it("404s for an unknown GN division id", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=not-a-real-id`));
    expect(res.status).toBe(404);
  });

  it("allows an Admin to fetch a GN division inside their own assigned DS division", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.divisionProfile.findUnique.mockResolvedValue({
      gnDivision: GALLE_GN_DIVISION,
      data: { education: { schoolFacilities: [] } },
      year: 2026,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.gnDivision).toBe(GALLE_GN_DIVISION);
    expect(mockPrisma.divisionProfile.findUnique).toHaveBeenCalledWith({
      where: { gnDivision: GALLE_GN_DIVISION },
      select: { gnDivision: true, data: true, year: true, approvedAt: true },
    });
  });

  it("returns ok:true with null data when no submission has been approved for that GN division yet", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.divisionProfile.findUnique.mockResolvedValue(null);

    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeNull();
  });

  it("lets a Super Admin fetch any GN division regardless of dsDivision scope", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.divisionProfile.findUnique.mockResolvedValue({
      gnDivision: GALLE_GN_DIVISION,
      data: {},
      year: 2026,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const res = await GET(getRequest(`${APP_URL}/api/division-profile?gnDivision=${GALLE_GN_DIVISION}`));
    expect(res.status).toBe(200);
  });
});
