import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

vi.mock("@/lib/verification-docs", () => ({
  deleteVerificationDocs: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  divisionalSecretariatRegistration: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  assistantDirectorPlanningRegistration: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  economicDevelopmentOfficerRegistration: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { PATCH } = await import("@/app/api/registrations/[id]/route");

const APP_URL = "http://localhost:3004";

const SUPER_ADMIN_SESSION = {
  userId: "sa-1",
  email: "sa@example.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  dsDivision: null,
};

const PENDING_DS_REG = {
  id: "reg-1",
  status: "PENDING",
  name: "New DS Applicant",
  email: "newds@example.com",
  nic: "199912345678",
  passwordHash: "hash",
  district: "galle",
  dsDivision: "galle-fg",
  verificationDocFrontPath: null,
  verificationDocBackPath: null,
};

function patchRequest(body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(`${APP_URL}/api/registrations/reg-1`, { method: "PATCH", headers, body: JSON.stringify(body) });
}

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/registrations/[id] — approve, one active AD/DS per division", () => {
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
    mockPrisma.divisionalSecretariatRegistration.findUnique.mockResolvedValue(PENDING_DS_REG);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user-1" });
  });

  it("approves a DS registration when the division has no existing active DS", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    // First findFirst call = email/NIC dup check, second = active-holder-per-division check.
    mockPrisma.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const req = patchRequest({ action: "approve", role: "ds" });
    const res = await PATCH(req, paramsFor("reg-1"));

    expect(res.status).toBe(200);
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "DIVISIONAL_SECRETARIAT", dsDivision: "galle-fg" }) })
    );
  });

  it("rejects approving a second active DS for a division that already has one, naming the existing holder", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findFirst
      .mockResolvedValueOnce(null) // no email/NIC dup
      .mockResolvedValueOnce({ name: "Existing DS", email: "existingds@example.com" }); // active holder found

    const req = patchRequest({ action: "approve", role: "ds" });
    const res = await PATCH(req, paramsFor("reg-1"));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.message).toContain("Existing DS");
    expect(json.message).toContain("existingds@example.com");
    expect(mockPrisma.user.create).not.toHaveBeenCalled();

    // Confirms the check is scoped to ACTIVE holders of the same role in the same division.
    const secondCallArgs = mockPrisma.user.findFirst.mock.calls[1][0];
    expect(secondCallArgs.where).toMatchObject({ role: "DIVISIONAL_SECRETARIAT", dsDivision: "galle-fg", status: "ACTIVE" });
  });

  it("rejects approving a second active AD for a division that already has one", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.assistantDirectorPlanningRegistration.findUnique.mockResolvedValue({
      ...PENDING_DS_REG,
      email: "newad@example.com",
    });
    mockPrisma.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ name: "Existing AD", email: "existingad@example.com" });

    const req = patchRequest({ action: "approve", role: "ad" });
    const res = await PATCH(req, paramsFor("reg-1"));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.message).toContain("Existing AD");
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("allows approving a new DS when the existing holder for that division is no longer active", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    // Active-holder query itself only ever matches ACTIVE users, so a deactivated prior holder
    // simply never turns up — this simulates that by returning null from the second call.
    mockPrisma.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const req = patchRequest({ action: "approve", role: "ds" });
    const res = await PATCH(req, paramsFor("reg-1"));

    expect(res.status).toBe(200);
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it("does not apply the per-division uniqueness check to Economic Development Officer approvals", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.economicDevelopmentOfficerRegistration.findUnique.mockResolvedValue({
      ...PENDING_DS_REG,
      email: "newgn@example.com",
      gnDivision: "galle-fort",
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce(null); // only the email/NIC dup check runs

    const req = patchRequest({ action: "approve", role: "gn" });
    const res = await PATCH(req, paramsFor("reg-1"));

    expect(res.status).toBe(200);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });
});
