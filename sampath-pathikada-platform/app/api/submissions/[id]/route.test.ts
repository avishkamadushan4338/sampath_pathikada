import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

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

const APP_URL = "http://localhost:3004";

const SUBMITTED_ROW = {
  id: "sub-1",
  status: "SUBMITTED",
  dsDivision: "galle-fg",
  gnDivision: "galle-fort",
  district: "galle",
  year: 2026,
  data: { identification: { officerName: "K. Perera" } },
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
  beforeEach(() => vi.clearAllMocks());

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
});

describe("PATCH /api/submissions/[id]", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" }, "http://evil.example.com");
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(403);
  });

  it("rejects an unknown action", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "delete-it" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("requires a note for reject", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("requires a note for request-revision", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "request-revision", note: "   " });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(400);
  });

  it("does not require a note for approve", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "APPROVED" });
    mockPrisma.divisionProfile.upsert.mockResolvedValue({});

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 for a reviewer outside the submission's DS division, not 403", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a division-scoped ADMIN approving a submission outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue({ ...DS_SESSION, role: "ADMIN", dsDivision: "galle-fg" });
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, dsDivision: "matara-fg" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(404);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("rejects reviewing a submission that isn't SUBMITTED", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({ ...SUBMITTED_ROW, status: "DRAFT" });
    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });
    expect(res.status).toBe(409);
  });

  it("on approve, upserts DivisionProfile keyed by gnDivision with the submission's data", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "APPROVED" });
    mockPrisma.divisionProfile.upsert.mockResolvedValue({});

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "approve" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });

    expect(res.status).toBe(200);
    expect(mockPrisma.divisionProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gnDivision: "galle-fort" },
        create: expect.objectContaining({ data: SUBMITTED_ROW.data, sourceSubmissionId: "sub-1" }),
        update: expect.objectContaining({ data: SUBMITTED_ROW.data, sourceSubmissionId: "sub-1" }),
      })
    );
  });

  it("on reject, does not touch DivisionProfile and stores the note as rejectionNote", async () => {
    mockGetSession.mockResolvedValue(DS_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(SUBMITTED_ROW);
    mockPrisma.submission.update.mockResolvedValue({ ...SUBMITTED_ROW, status: "REJECTED" });

    const req = patchRequest(`${APP_URL}/api/submissions/sub-1`, { action: "reject", note: "Incomplete tea estate data" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "sub-1" }) });

    expect(res.status).toBe(200);
    expect(mockPrisma.divisionProfile.upsert).not.toHaveBeenCalled();
    const updateArg = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateArg.data.rejectionNote).toBe("Incomplete tea estate data");
    expect(updateArg.data.status).toBe("REJECTED");
  });
});
