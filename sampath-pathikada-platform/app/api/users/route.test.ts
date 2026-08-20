import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
const mockHashPassword = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
  hashPassword: (...args: unknown[]) => mockHashPassword(...args),
}));

const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockLogAudit = vi.fn();
vi.mock("@/lib/audit-log", () => ({
  logAudit: (...args: unknown[]) => mockLogAudit(...args),
}));

const { GET, POST } = await import("@/app/api/users/route");

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

const FORBIDDEN_SESSION = {
  userId: "ds-1",
  email: "ds@example.com",
  name: "DS Officer",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

function getRequest(url: string) {
  return new NextRequest(url);
}

function postRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "POST", headers, body: JSON.stringify(body) });
}

function newAdminPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "New Admin",
    email: "new.admin@example.com",
    phone: "0771234567",
    password: "supersecret1",
    dsDivision: "galle-fg",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.$queryRaw.mockResolvedValue([]);
  mockHashPassword.mockResolvedValue("hashed-password");
});

describe("GET /api/users — authentication", () => {
  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/users — authorization", () => {
  it.each([
    ["SUPER_ADMIN", SUPER_ADMIN_SESSION],
    ["ADMIN", ADMIN_SESSION],
  ])("allows %s (read access)", async (_label, session) => {
    mockGetSession.mockResolvedValue(session);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(200);
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });

  it("scopes ADMIN's query to their own dsDivision and excludes other ADMIN accounts (division-scoping / IDOR protection)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("galle-fg");
    expect(where.role).toEqual({ not: "ADMIN" });
  });

  it("does not scope SUPER_ADMIN's query to any dsDivision or exclude ADMIN accounts", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBeUndefined();
    expect(where.role).toBeUndefined();
  });

  it("ignores an ADMIN's attempt to override dsDivision scoping via query params (IDOR attempt)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?dsDivision=matara-fg`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.dsDivision).toBe("galle-fg");
  });
});

describe("GET /api/users — validation", () => {
  it("accepts a valid search filter", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?search=perera`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([{ name: { contains: "perera" } }, { email: { contains: "perera" } }]);
  });

  it("accepts a valid status filter", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?status=active`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.status).toBe("ACTIVE");
  });

  it("treats status=all as no filter", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?status=all`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.status).toBeUndefined();
  });

  it("accepts a role filter with a single hyphen, normalizing to the enum form", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?role=divisional-secretariat`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.role).toBe("DIVISIONAL_SECRETARIAT");
  });

  it("only replaces the first hyphen in a multi-hyphen role filter (route uses .replace, not .replaceAll — documents actual behavior)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?role=economic-development-officer`));
    expect(res.status).toBe(200);
    const where = mockPrisma.user.findMany.mock.calls[0][0].where;
    expect(where.role).toBe("ECONOMIC_DEVELOPMENT-OFFICER");
  });

  it("ignores unexpected extra query params without error", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await GET(getRequest(`${APP_URL}/api/users?bogus=1`));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/users — data behavior", () => {
  it("returns an empty list for no matching users", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findMany.mockResolvedValue([]);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("attaches officerDesignation only for EDO users, pulled from this year's submission", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "edo-1", name: "Officer A", role: "ECONOMIC_DEVELOPMENT_OFFICER" },
      { id: "admin-2", name: "Admin B", role: "ADMIN" },
    ]);
    mockPrisma.$queryRaw.mockResolvedValue([{ submittedById: "edo-1", officerDesignation: "Grama Niladhari" }]);
    const res = await GET(getRequest(`${APP_URL}/api/users`));
    const json = await res.json();
    const edo = json.data.find((u: { id: string }) => u.id === "edo-1");
    const admin = json.data.find((u: { id: string }) => u.id === "admin-2");
    expect(edo.officerDesignation).toBe("Grama Niladhari");
    expect(admin.officerDesignation).toBeNull();
  });
});

describe("POST /api/users — CSRF", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  afterAll(() => { process.env.NEXT_PUBLIC_APP_URL = originalAppUrl; });

  it("accepts a matching (valid) origin", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload(), APP_URL));
    expect(res.status).toBe(201);
  });

  it("rejects a mismatched (invalid) origin before touching session or DB", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload(), "http://evil.example.com"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a missing origin/referer", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload(), null));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/users — authentication", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(401);
  });
});

describe("POST /api/users — authorization (SUPER_ADMIN-only mutation)", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("allows SUPER_ADMIN to create an admin account", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(201);
  });

  it("rejects ADMIN — read-only for user management, cannot create accounts", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/users — validation", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
  });

  it("accepts valid input", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(201);
  });

  it("rejects missing name", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ name: undefined })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects missing email", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ email: undefined })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects missing password", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ password: undefined })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects missing dsDivision", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ dsDivision: undefined })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a password under the 8-character minimum (boundary)", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ password: "short1" })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("accepts a password at exactly the 8-character minimum (boundary)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ password: "exactly8" })));
    expect(res.status).toBe(201);
  });

  it("rejects an unknown/malformed dsDivision id", async () => {
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ dsDivision: "not-a-real-division" })));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON body", async () => {
    const headers = new Headers({ "content-type": "application/json", origin: APP_URL });
    const req = new NextRequest(`${APP_URL}/api/users`, { method: "POST", headers, body: "{not-json" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/users — field whitelisting", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
  });

  it("ignores an attempt to set role via the body — always forced to ADMIN", async () => {
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ role: "SUPER_ADMIN" })));
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data.role).toBe("ADMIN");
  });

  it("ignores an attempt to set status via the body — always forced to ACTIVE", async () => {
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ status: "SUSPICIOUSLY_SET" })));
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data.status).toBe("ACTIVE");
  });

  it("ignores an attempt to set createdById via the body — always forced to the caller's own id", async () => {
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ createdById: "someone-else" })));
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data.createdById).toBe(SUPER_ADMIN_SESSION.userId);
  });

  it("ignores an attempt to set passwordHash directly via the body — always derived from hashPassword()", async () => {
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ passwordHash: "raw-injected-hash" })));
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data.passwordHash).toBe("hashed-password");
  });

  it("does not accept a nic field — this route has no NIC input at all", async () => {
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ nic: "199012345678" })));
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data).not.toHaveProperty("nic");
  });
});

describe("POST /api/users — duplicate email handling", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
  });

  it("returns 409 for a duplicate email and does not create a user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-1", email: "new.admin@example.com" });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    expect(res.status).toBe(409);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("checks for a duplicate using the lowercased, trimmed email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", ...newAdminPayload() });
    await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload({ email: "  New.Admin@Example.com  " })));
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "new.admin@example.com" } });
  });
});

describe("POST /api/users — database behavior", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.findUnique.mockResolvedValue(null);
  });

  it("persists district/dsDivision derived from the selected division, and writes an audit log", async () => {
    mockPrisma.user.create.mockResolvedValue({ id: "new-1", name: "New Admin", email: "new.admin@example.com" });
    const res = await POST(postRequest(`${APP_URL}/api/users`, newAdminPayload()));
    const json = await res.json();
    expect(res.status).toBe(201);
    const arg = mockPrisma.user.create.mock.calls[0][0];
    expect(arg.data.dsDivision).toBe("galle-fg");
    expect(arg.data.district).toBe("galle");
    expect(arg.data.mustResetPassword).toBe(true);
    expect(json.data.id).toBe("new-1");
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "Admin Created" }));
  });
});
