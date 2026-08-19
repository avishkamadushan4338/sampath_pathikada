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
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
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
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma));
    mockPrisma.$queryRaw.mockResolvedValue(undefined);
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

  it("allows resubmitting a REVISION_NEEDED submission flagged at the AD stage, clearing only the flagged sections, keeping approved ones, and landing back on SUBMITTED/stage AD", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const row = {
      id: "sub-1",
      submittedById: "officer-1",
      status: "REVISION_NEEDED" as const,
      reviewStage: "AD" as const,
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
      rejectionNote: "Missing tea estate data",
      reviewedById: "ad-1",
      sectionReviews: {
        [SECTION_KEYS[0]]: { status: "REVISION_NEEDED", note: "Fix this", reviewedById: "ad-1", reviewedAt: "2026-01-01T00:00:00.000Z" },
        [SECTION_KEYS[1]]: { status: "APPROVED", note: null, reviewedById: "ad-1", reviewedAt: "2026-01-01T00:00:00.000Z" },
      },
    };
    mockPrisma.submission.findUnique.mockResolvedValue(row);
    mockPrisma.submission.update.mockResolvedValue({ ...row, status: "SUBMITTED" });

    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.status).toBe("SUBMITTED");
    expect(updateArg.data.reviewStage).toBe("AD");
    expect(updateArg.data.rejectionNote).toBeNull();
    expect(updateArg.data.sectionReviews[SECTION_KEYS[0]]).toBeUndefined();
    expect(updateArg.data.sectionReviews[SECTION_KEYS[1]]).toEqual(row.sectionReviews[SECTION_KEYS[1]]);
  });

  it("allows resubmitting a REVISION_NEEDED submission flagged at the DS stage — clearing the flagged section reopens it as pending, landing on SUBMITTED/stage DS (not skipping straight to approval, since the section itself hasn't been re-approved yet, only unflagged)", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const row = {
      id: "sub-1",
      submittedById: "officer-1",
      status: "REVISION_NEEDED" as const,
      reviewStage: "DS" as const,
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
      rejectionNote: null,
      reviewedById: "ds-1",
      sectionReviews: {
        [SECTION_KEYS[0]]: { status: "REVISION_NEEDED", note: "Fix this", reviewedById: "ds-1", reviewedAt: "2026-01-01T00:00:00.000Z" },
        [SECTION_KEYS[1]]: { status: "APPROVED", note: null, reviewedById: "ad-1", reviewedAt: "2026-01-01T00:00:00.000Z" },
      },
    };
    mockPrisma.submission.findUnique.mockResolvedValue(row);
    mockPrisma.submission.update.mockResolvedValue({ ...row, status: "SUBMITTED" });

    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    // reviewStage is preserved as "DS" (unchanged) — the submission stays in DS's queue, it just
    // isn't fully decided yet since the reopened section hasn't been re-approved.
    expect(updateArg.data.status).toBe("SUBMITTED");
    expect(updateArg.data.reviewStage).toBe("DS");
    expect(updateArg.data.sectionReviews[SECTION_KEYS[0]]).toBeUndefined();
    expect(updateArg.data.sectionReviews[SECTION_KEYS[1]]).toEqual(row.sectionReviews[SECTION_KEYS[1]]);
  });

  it("reaches terminal APPROVED when every section is already approved at the DS stage after clearing revision flags (edge case: a REVISION_NEEDED submission where all flagged sections were already re-approved via the per-section save route before resubmit) — the AD-to-DS handoff only happens once, when AD itself finishes, not on every subsequent DS-stage resubmit", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const approvedEntry = (reviewedById: string) => ({ status: "APPROVED" as const, note: null, reviewedById, reviewedAt: "2026-01-01T00:00:00.000Z" });
    const sectionReviews: Record<string, unknown> = {};
    for (const key of SECTION_KEYS) sectionReviews[key] = approvedEntry("ad-1");
    // No REVISION_NEEDED entries remain — this models the state right after the EDO's per-section
    // save already cleared+reapproved every flagged section, and REVISION_NEEDED status is only
    // still set because deriveSubmissionStatus hasn't been recomputed since.
    const row = {
      id: "sub-1",
      submittedById: "officer-1",
      status: "REVISION_NEEDED" as const,
      reviewStage: "DS" as const,
      data: allSectionsFilled(),
      gnDivision: "galle-fort",
      rejectionNote: null,
      reviewedById: "ds-1",
      sectionReviews,
    };
    mockPrisma.submission.findUnique.mockResolvedValue(row);
    mockPrisma.submission.update.mockResolvedValue({ ...row, status: "APPROVED" });

    const res = await POST(postRequest(`${APP_URL}/api/my-submission/2026/submit`), {
      params: Promise.resolve({ year: "2026" }),
    });

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.status).toBe("APPROVED");
    expect(updateArg.data.reviewStage).toBe("DS");
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
