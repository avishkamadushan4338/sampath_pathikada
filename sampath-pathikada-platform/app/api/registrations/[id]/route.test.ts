import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  economicDevelopmentOfficerRegistration: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  assistantDirectorPlanningRegistration: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  divisionalSecretariatRegistration: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock("@/lib/verification-docs", () => ({
  deleteVerificationDocs: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/audit-log", () => ({
  logAudit: vi.fn(),
}));

const { GET, PATCH } = await import("@/app/api/registrations/[id]/route");

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

const REG_ROW = {
  id: "reg-1",
  name: "K. Perera",
  email: "perera@example.com",
  phone: "0771234567",
  nic: "199012345678",
  district: "galle",
  dsDivision: "matara-fg", // deliberately a DIFFERENT division than ADMIN_SESSION
  status: "PENDING",
  passwordHash: "hashed",
  verificationDocFrontPath: "reg-1/front.jpg",
  verificationDocBackPath: "reg-1/back.jpg",
};

function getRequest(url: string) {
  return new NextRequest(url);
}

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

describe("GET /api/registrations/[id] — division scoping (IDOR regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("rejects a non-admin role", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, role: "DIVISIONAL_SECRETARIAT" });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 (not 403) for a division-scoped ADMIN reading a registration outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(null); // scoped query finds nothing
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(404);
    // The critical assertion: the scoping filter was actually applied to the query,
    // not just checked after the fact.
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1", dsDivision: "galle-fg" },
    });
  });

  it("returns the registration for an ADMIN within their own dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue({ ...REG_ROW, dsDivision: "galle-fg" });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(200);
  });

  it("does not scope SUPER_ADMIN to any single dsDivision", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(REG_ROW); // dsDivision: matara-fg
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(200);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1" },
    });
  });

  it("never serializes passwordHash or raw document paths", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(REG_ROW);
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    const json = await res.json();
    expect(json.data.passwordHash).toBeUndefined();
    expect(json.data.verificationDocFrontPath).toBeUndefined();
    expect(json.data.hasDocFront).toBe(true);
  });

  it("denies an ADMIN with no dsDivision assigned, rather than falling through to an unscoped query (edge-case regression)", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, dsDivision: null });
    const res = await GET(getRequest(`${APP_URL}/api/registrations/reg-1?role=gn`), { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(403);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/registrations/[id] — division scoping (IDOR regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
    // Real signature is $transaction(fn, options) — options (isolation level/timeout) is
    // irrelevant to these mocks, so just invoke the callback with mockPrisma as `tx`.
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma));
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "gn" }, "http://evil.example.com");
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a division-scoped ADMIN approving a registration outside their dsDivision, and never reaches the transaction", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(null); // scoped query finds nothing
    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "gn" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(404);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns 404 for a division-scoped ADMIN rejecting a registration outside their dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(null);
    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "reject", role: "gn", rejectionNote: "no" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(404);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.update).not.toHaveBeenCalled();
  });

  it("denies an ADMIN with no dsDivision assigned, rather than falling through to an unscoped query (edge-case regression)", async () => {
    mockGetSession.mockResolvedValue({ ...ADMIN_SESSION, dsDivision: null });
    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "gn" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(403);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).not.toHaveBeenCalled();
  });

  it("allows an ADMIN to approve a registration within their own dsDivision", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const ownDivisionReg = { ...REG_ROW, dsDivision: "galle-fg" };
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(ownDivisionReg);
    mockPrisma.user.findFirst.mockResolvedValue(null); // no duplicate email/nic, no existing holder
    mockPrisma.user.create.mockResolvedValue({ id: "new-user-1" });
    mockPrisma.economicDevelopmentOfficerRegistration.update.mockResolvedValue({});

    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "gn" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(200);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1", dsDivision: "galle-fg" },
    });
  });

  it("allows SUPER_ADMIN to approve a registration in any division", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findFirst.mockResolvedValue(REG_ROW); // dsDivision: matara-fg
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user-1" });
    mockPrisma.economicDevelopmentOfficerRegistration.update.mockResolvedValue({});

    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "gn" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });
    expect(res.status).toBe(200);
    expect(mockPrisma.economicDevelopmentOfficerRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: "reg-1" },
    });
  });

  it("re-checks for an active AD/DS holder inside the transaction (TOCTOU regression) — returns 409 and never creates the user if a concurrent approval won the race", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const adReg = { ...REG_ROW, dsDivision: "galle-fg" };
    mockPrisma.assistantDirectorPlanningRegistration.findFirst.mockResolvedValue(adReg);
    // Pre-check (outside the transaction) sees no holder yet...
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);
    // ...but by the time the in-transaction re-check runs, a concurrent approval has
    // already committed one — this is exactly the race the fix closes.
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "concurrent-holder" });

    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "ad" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });

    expect(res.status).toBe(409);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(mockPrisma.assistantDirectorPlanningRegistration.update).not.toHaveBeenCalled();
  });

  it("runs the approve transaction with Serializable isolation", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const dsReg = { ...REG_ROW, dsDivision: "galle-fg" };
    mockPrisma.divisionalSecretariatRegistration.findFirst.mockResolvedValue(dsReg);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user-1" });
    mockPrisma.divisionalSecretariatRegistration.update.mockResolvedValue({});

    const req = patchRequest(`${APP_URL}/api/registrations/reg-1`, { action: "approve", role: "ds" });
    await PATCH(req, { params: Promise.resolve({ id: "reg-1" }) });

    const [, options] = mockPrisma.$transaction.mock.calls[0];
    expect(options).toMatchObject({ isolationLevel: "Serializable" });
  });
});
