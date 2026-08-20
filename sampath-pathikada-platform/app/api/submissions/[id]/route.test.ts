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
  user: {
    findMany: vi.fn(),
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

const { GET, PATCH } = await import("@/app/api/submissions/[id]/route");

const DS_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS Officer",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

const AD_SESSION = {
  userId: "ad-1",
  email: "ad@example.com",
  name: "AD Officer",
  role: "ASSISTANT_DIRECTOR_PLANNING",
  dsDivision: "galle-fg",
};

const APP_URL = "http://localhost:3004";

// DS-stage row — the fixture most existing tests below exercise (DS is the terminal reviewer).
const SUBMITTED_ROW = {
  id: "sub-1",
  status: "AD_APPROVED",
  reviewStage: "DS",
  dsDivision: "galle-fg",
  gnDivision: "galle-fort",
  district: "galle",
  year: 2026,
  data: { identification: { officerName: "K. Perera" } },
  sectionReviews: null,
};

// AD-stage row — a submission still awaiting its first review.
const AD_STAGE_ROW = {
  ...SUBMITTED_ROW,
  status: "SUBMITTED",
  reviewStage: "AD",
};

function getRequest(url: string) {
  return new NextRequest(url);
}

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

describe("GET /api/submissions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([]);
  });

  it("rejects a non-reviewer role", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ECONOMIC_DEVELOPMENT_OFFICER" });
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 (not 403) for a submission outside the reviewer's DS division", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a genuinely missing submission", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns the submission for a DS reviewer within their own division", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("does not scope SUPER_ADMIN to any single dsDivision", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "SUPER_ADMIN", dsDivision: null });
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 (not 403) for a division-scoped ADMIN reading a submission outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ADMIN", dsDivision: "galle-fg" });
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns the submission for an ADMIN within their own dsDivision", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ADMIN", dsDivision: "galle-fg" });
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns the submission for an AD reviewer while it's still at the AD stage", async () => {
    mockGetSession.mockResolvedValue(AD_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(AD_STAGE_ROW);
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 (not 403) for an AD reviewer once the submission has moved to the DS stage", async () => {
    mockGetSession.mockResolvedValue(AD_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW); // reviewStage: "DS"
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 (not 403) for a DS reviewer while the submission is still at the AD stage", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(AD_STAGE_ROW); // reviewStage: "AD"
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("does not query for reviewer names when no section has been decided yet", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, reviewedById: null, sectionReviews: null });
    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    const json = await res.json();
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    expect(json.data.reviewerNames).toEqual({});
  });

  it("resolves reviewedById in sectionReviews to a name/role, keyed by user id", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      ...SUBMITTED_ROW,
      reviewedById: "ad-1",
      sectionReviews: {
        education: { status: "APPROVED", note: null, reviewedById: "ad-1", reviewedAt: "2026-01-01T00:00:00.000Z" },
        health: { status: "APPROVED", note: null, reviewedById: "ds-1", reviewedAt: "2026-01-02T00:00:00.000Z" },
      },
    });
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "ad-1", name: "AD Officer", role: "ASSISTANT_DIRECTOR_PLANNING" },
      { id: "ds-1", name: "DS Officer", role: "DIVISIONAL_SECRETARIAT" },
    ]);

    const res = await GET(getRequest(`${APP_URL}/api/submissions/sub-1`), { params: Promise.resolve({ id: "sub-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    const findManyArg = mockPrisma.user.findMany.mock.calls[0][0];
    expect(new Set(findManyArg.where.id.in)).toEqual(new Set(["ad-1", "ds-1"]));
    expect(json.data.reviewerNames).toEqual({
      "ad-1": { name: "AD Officer", role: "ASSISTANT_DIRECTOR_PLANNING" },
      "ds-1": { name: "DS Officer", role: "DIVISIONAL_SECRETARIAT" },
    });
  });
});

describe("PATCH /api/submissions/[id] — whole-submission Reject (bulk approve removed — approval is per-section only)", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Supports both the interactive-callback form (used by this route) and the old array form,
    // invoking the callback with `mockPrisma` itself as `tx` — so `tx.submission.findUnique()`
    // etc. inside the route resolve to the same mocks the tests configure directly.
    mockPrisma.$transaction.mockImplementation(async (fnOrOps: unknown) => {
      if (typeof fnOrOps === "function") {
        return (fnOrOps as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
      }
      return Promise.all(fnOrOps as Promise<unknown>[]);
    });
    mockPrisma.$queryRaw.mockResolvedValue(undefined);
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "x" }, "http://evil.example.com");
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(403);
  });

  it("rejects an unknown action", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "delete-it" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("no longer accepts approve — bulk-approving a submission is not supported, only per-section approval via .../sections/[section]", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("no longer accepts request-revision — that's per-section only now", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "request-revision", note: "Fix section X" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("requires a note for reject", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a reviewer outside the submission's DS division, not 403", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "x" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a division-scoped ADMIN rejecting a submission outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ADMIN", dsDivision: "galle-fg" });
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "x" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("rejects deciding a submission that's still a DRAFT", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "DRAFT" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "x" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(409);
  });

  it("rejects deciding a submission that's already fully APPROVED", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "APPROVED" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "x" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(409);
  });

  it("allows Reject while the submission is REVISION_NEEDED (still under review), not just SUBMITTED", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "REVISION_NEEDED" });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "REJECTED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "Start over" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("on reject at the DS stage, does not touch DivisionProfile, stores the note as rejectionNote, clears sectionReviews, and resets reviewStage to AD so the resubmit restarts the whole review from AD", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      ...SUBMITTED_ROW, // reviewStage: "DS"
      sectionReviews: { [SECTION_KEYS[0]]: { status: "APPROVED", note: null, reviewedById: "ds-1", reviewedAt: "2026-01-01T00:00:00.000Z" } },
    });
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "REJECTED", reviewStage: "AD" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "Incomplete tea estate data" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });

    expect(res.status).toBe(200);
    expect(mockPrisma.divisionProfile.upsert).not.toHaveBeenCalled();
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.rejectionNote).toBe("Incomplete tea estate data");
    expect(updateArg.data.status).toBe("REJECTED");
    expect(updateArg.data.reviewStage).toBe("AD");
    expect(updateArg.data.sectionReviews).toEqual({});
  });

  it("on reject at the AD stage, also sets reviewStage to AD (a no-op change, but confirms reject always restarts at AD regardless of who rejected it)", async () => {
    mockGetSession.mockResolvedValue(AD_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(AD_STAGE_ROW); // reviewStage: "AD"
    mockPrisma.submission.update.mockResolvedValue({ ...AD_STAGE_ROW, status: "REJECTED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "Start over" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.reviewStage).toBe("AD");
  });
});
