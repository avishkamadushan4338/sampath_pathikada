import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  economicDevelopmentOfficerRegistration: {
    findFirst: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock("@/lib/verification-docs", () => ({
  resolveVerificationDocPath: (p: string) => `/storage/${p}`,
  mimeTypeForPath: () => "image/jpeg",
}));

vi.mock("fs/promises", () => ({
  default: { readFile: vi.fn().mockResolvedValue(Buffer.from("fake-image-bytes")) },
}));

const { GET } = await import("@/app/api/registrations/[id]/document/[side]/route");

const APP_URL = "http://localhost:3004";

const ADMIN_SESSION = {
  userId: "admin-1",
  email: "admin@example.com",
  name: "Division Admin",
  role: "ADMIN",
  dsDivision: "galle-fg",
};

const SUPER_ADMIN_SESSION = {
  userId: "sa-1",
  email: "sa@example.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

function getRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/registrations/[id]/document/[side] — division scoping (IDOR regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 for a division-scoped ADMIN requesting a document outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(null); // scoped query finds nothing
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1/document/front?role=gn`), {
      params: Promise.resolve({ id: "reg-1", side: "front" }),
    });
    expect(res.status).toBe(404);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1", dsDivision: "galle-fg" },
    });
  });

  it("streams the document for an ADMIN within their own dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue({
      verificationDocFrontPath: "reg-1/front.jpg",
      verificationDocBackPath: "reg-1/back.jpg",
    });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1/document/front?role=gn`), {
      params: Promise.resolve({ id: "reg-1", side: "front" }),
    });
    expect(res.status).toBe(200);
  });

  it("does not scope SUPER_ADMIN to any single dsDivision", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue({
      verificationDocFrontPath: "reg-1/front.jpg",
      verificationDocBackPath: "reg-1/back.jpg",
    });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1/document/front?role=gn`), {
      params: Promise.resolve({ id: "reg-1", side: "front" }),
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1" },
    });
  });

  it("rejects a non-admin role", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, role: "DIVISIONAL_SECRETARIAT" });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1/document/front?role=gn`), {
      params: Promise.resolve({ id: "reg-1", side: "front" }),
    });
    expect(res.status).toBe(401);
  });

  it("denies an ADMIN with no dsDivision assigned, rather than falling through to an unscoped query (edge-case regression)", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1/document/front?role=gn`), {
      params: Promise.resolve({ id: "reg-1", side: "front" }),
    });
    expect(res.status).toBe(403);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).not.toHaveBeenCalled();
  });
});
