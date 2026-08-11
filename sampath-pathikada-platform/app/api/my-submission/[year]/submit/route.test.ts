import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { SECTION_KEYS } from "@/lib/types/submission";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { POST } = await import("@/app/api/my-submission/[year]/submit/route");

const EDO_SESSION = {
  userId: "officer-1",
  email: "officer@example.com",
  name: "Officer One",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: null,
};

const APP_URL = "http://localhost:3004";

function allSectionsFilled(): Record<string, unknown> {
  return Object.fromEntries(SECTION_KEYS.map((key) => [key, {}]));
}

function postRequest(url: string, origin: string | null = APP_URL) {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "POST", headers });
}

describe("POST /api/my-submission/[year]/submit", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`, "http://evil.example.com"), {
      params: Promise.resolve({ year: "2026" }),
    });
    expect(res.status).toBe(403);
  });

  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when no submission exists for that year", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects submitting when a section is still missing", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const { identification, ...incomplete } = allSectionsFilled();
    void identification;
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: incomplete,
      gnDivision: "galle-fort",
    });
    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.missingSections).toContain("identification");
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("rejects submitting a submission that isn't DRAFT or REVISION_NEEDED", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "SUBMITTED",
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
    });
    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });
    expect(res.status).toBe(409);
  });

  it("allows resubmitting a REVISION_NEEDED submission and clears the prior review", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "REVISION_NEEDED",
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
      rejectionNote: "Missing tea estate data",
      reviewedById: "ds-1",
    });
    mockPrisma.submission.update.mockResolvedValue({ id: "sub-1", status: "SUBMITTED" });

    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });

    expect(res.status).toBe(200);
    expect(mockPrisma.submission.update).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: {
        status: "SUBMITTED",
        rejectionNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
    });
  });

  it("submits successfully once every section has been saved", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
    });
    mockPrisma.submission.update.mockResolvedValue({ id: "sub-1", status: "SUBMITTED" });

    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });

    expect(res.status).toBe(200);
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
