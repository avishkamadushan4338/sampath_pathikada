import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  submission: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  divisionProfile: {
    findUnique: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET, PATCH } = await import("@/app/api/my-submission/[year]/route");

const EDO_SESSION = {
  userId: "officer-1",
  email: "officer@example.com",
  name: "Officer One",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  dsDivision: null,
};

const APP_URL = "http://localhost:3004";

function getRequest(url: string) {
  return new NextRequest(url);
}

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

describe("GET /api/my-submission/[year]", () => {
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

  it("rejects an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(401);
  });

  it("rejects a non-EDO role", async () => {
    mockGetSession.mockResolvedValue({ ...EDO_SESSION, role: "DIVISIONAL_SECRETARIAT" });
    const res = await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(401);
  });

  it("rejects an invalid year", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/my-submission/not-a-year`), { params: Promise.resolve({ year: "not-a-year" }) });
    expect(res.status).toBe(400);
  });

  it("returns the existing submission if one is already found", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const existing = { id: "sub-1", submittedById: "officer-1", year: 2026, data: { identification: {} }, status: "DRAFT" };
    mockPrisma.submission.findUnique.mockResolvedValue(existing);

    const res = await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual(existing);
    expect(mockPrisma.submission.create).not.toHaveBeenCalled();
  });

  it("rejects when the officer has no geographic assignment", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ district: null, dsDivision: null, gnDivision: null });

    const res = await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(400);
    expect(mockPrisma.submission.create).not.toHaveBeenCalled();
  });

  it("creates a blank draft when no prior DivisionProfile exists for the GN division", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ district: "galle", dsDivision: "galle-fg", gnDivision: "galle-fort" });
    mockPrisma.divisionProfile.findUnique.mockResolvedValue(null);
    mockPrisma.submission.create.mockResolvedValue({ id: "sub-new", data: {}, status: "DRAFT" });

    const res = await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(201);
    expect(mockPrisma.submission.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ data: {} }) })
    );
  });

  it("seeds a new draft from the division's last approved profile when one exists", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ district: "galle", dsDivision: "galle-fg", gnDivision: "galle-fort" });
    mockPrisma.divisionProfile.findUnique.mockResolvedValue({ data: { identification: { officerName: "Prior Officer" } } });
    mockPrisma.submission.create.mockResolvedValue({ id: "sub-new", data: { identification: { officerName: "Prior Officer" } }, status: "DRAFT" });

    await GET(getRequest(`${APP_URL}/api/my-submission/2026`), { params: Promise.resolve({ year: "2026" }) });
    expect(mockPrisma.submission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ data: { identification: { officerName: "Prior Officer" } } }),
      })
    );
  });
});

describe("PATCH /api/my-submission/[year]", () => {
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

  it("rejects a request with a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "identification", data: {} }, "http://evil.example.com");
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(403);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("rejects an unknown section name", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "notASection", data: {} });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when no submission exists yet for that year", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue(null);
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "identification", data: {} });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(404);
  });

  it("blocks editing once the submission has been submitted", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "SUBMITTED",
      data: {},
    });
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "identification", data: {} });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(409);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("blocks editing once the submission has been approved", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "APPROVED",
      data: {},
    });
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "identification", data: {} });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(409);
  });

  it("rejects data that fails the section's partial schema", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: {},
    });
    // officerPhone fails the phone-format regex in the identification schema.
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, {
      section: "identification",
      data: { officerPhone: "not-a-phone" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(400);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
    // A routine validation failure (missing/malformed field) is not flag-worthy on its own.
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it("flags a demographics population-total mismatch with an ERROR-severity audit log entry, distinct from routine validation failures", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: {},
    });
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, {
      section: "demographics",
      data: {
        populationByAge: [{ band: "0-4", female: 10, male: 12 }],
        populationByEthnicity: [{ ethnicity: "sinhala", female: 999, male: 12 }],
        populationByReligion: [{ religion: "buddhist", female: 10, male: 12 }],
      },
    });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(400);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalledTimes(1);
    const logCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(logCall.data.severity).toBe("ERROR");
    expect(logCall.data.category).toBe("DATA");
    expect(logCall.data.userId).toBe("officer-1");
  });

  it("rejects a row missing a required field (e.g. an added table row left incomplete)", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: {},
    });
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, {
      section: "state-institutions-land",
      data: { stateInstitutions: [{ name: "", address: "" }] },
    });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(400);
    expect(mockPrisma.submission.update).not.toHaveBeenCalled();
  });

  it("merges the saved section into existing data without dropping other sections", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "officer-1",
      status: "DRAFT",
      data: { housing: { totalHouseholds: 10 } },
    });
    mockPrisma.submission.update.mockResolvedValue({ id: "sub-1", data: {} });

    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, {
      section: "identification",
      data: { officerName: "K. Perera" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });

    expect(res.status).toBe(200);
    const updateCall = mockPrisma.submission.update.mock.calls[0][0];
    expect(updateCall.data.data.housing).toEqual({ totalHouseholds: 10 });
    expect(updateCall.data.data.identification).toMatchObject({ officerName: "K. Perera" });
  });

  it("rejects a submission that belongs to a different user", async () => {
    mockGetSession.mockResolvedValue(EDO_SESSION);
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: "sub-1",
      submittedById: "someone-else",
      status: "DRAFT",
      data: {},
    });
    const req = patchRequest(`${APP_URL}/api/my-submission/2026`, { section: "identification", data: {} });
    const res = await PATCH(req, { params: Promise.resolve({ year: "2026" }) });
    expect(res.status).toBe(401);
  });
});
