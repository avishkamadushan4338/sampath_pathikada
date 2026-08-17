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
  divisionProfile: {
    upsert: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { PATCH } = await import("@/app/api/submissions/[id]/sections/[section]/route");

const DS_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS Officer",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

const APP_URL = "http://localhost:3004";

function allApprovedExcept(...pending: string[]) {
  const reviews: Record<string, unknown> = {};
  for (const key of SECTION_KEYS) {
    if (pending.includes(key)) continue;
    reviews[key] = { status: "APPROVED", note: null, reviewedById: "ds-1", reviewedAt: "2026-01-01T00:00:00.000Z" };
  }
  return reviews;
}

const SUBMITTED_ROW = {
  id: "sub-1",
  status: "SUBMITTED",
  dsDivision: "galle-fg",
  gnDivision: "galle-fort",
  district: "galle",
  year: 2026,
  data: { identification: { officerName: "K. Perera" } },
  sectionReviews: null,
};

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

function paramsFor(section: string) {
  return { params: Promise.resolve({ id: "sub-1", section }) };
}

describe("PATCH /api/submissions/[id]/sections/[section]", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma));
    mockPrisma.$queryRaw.mockResolvedValue(undefined);
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" }, "http://evil.example.com");
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(403);
  });

  it("rejects a non-reviewer role", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ECONOMIC_DEVELOPMENT_OFFICER" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(401);
  });

  it("rejects an unknown section", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/not-a-section`, { action: "approve" });
    const res = await PATCH(req, paramsFor("not-a-section"));
    expect(res.status).toBe(400);
  });

  it("rejects an unknown action", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "delete-it" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(400);
  });

  it("requires a note for request-revision", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "request-revision" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(400);
  });

  it("does not require a note for approve", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "SUBMITTED" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(200);
  });

  it("returns 404 for a reviewer outside the submission's DS division", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(404);
  });

  it("rejects deciding a section on a submission that's still a DRAFT", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "DRAFT" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(409);
  });

  it("allows deciding a section while the submission is REVISION_NEEDED (not just SUBMITTED)", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "REVISION_NEEDED" });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "REVISION_NEEDED" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));
    expect(res.status).toBe(200);
  });

  it("stores the note and status for a single section decision without touching other sections", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, sectionReviews: { health: allApprovedExcept()["health"] } });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "REVISION_NEEDED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, {
      action: "request-revision",
      note: "Missing tertiary institution data",
    });
    const res = await PATCH(req, paramsFor("education"));

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.sectionReviews.education).toMatchObject({ status: "REVISION_NEEDED", note: "Missing tertiary institution data" });
    expect(updateArg.data.sectionReviews.health).toBeDefined();
    expect(updateArg.data.status).toBe("REVISION_NEEDED");
  });

  it("does not upsert DivisionProfile when only some sections are approved", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, sectionReviews: allApprovedExcept("education", "health") });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "SUBMITTED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));

    expect(res.status).toBe(200);
    expect(mockPrisma.divisionProfile.upsert).not.toHaveBeenCalled();
  });

  it("upserts DivisionProfile the moment the last section becomes approved", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, sectionReviews: allApprovedExcept("education") });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "APPROVED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, { action: "approve" });
    const res = await PATCH(req, paramsFor("education"));

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.status).toBe("APPROVED");
    expect(mockPrisma.divisionProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gnDivision: "galle-fort" },
        create: expect.objectContaining({ sourceSubmissionId: "sub-1", data: SUBMITTED_ROW.data }),
      })
    );
  });

  it("logs the decision at INFO severity, not WARNING — avoids flooding the DS's own Data Quality Alerts feed", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "SUBMITTED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1/sections/education`, {
      action: "request-revision",
      note: "Missing data",
    });
    await PATCH(req, paramsFor("education"));

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ severity: "INFO", category: "DATA" }) })
    );
  });
});
