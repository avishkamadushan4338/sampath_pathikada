import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockLogAudit = vi.fn();
vi.mock("@/lib/audit-log", () => ({
  logAudit: (...args: unknown[]) => mockLogAudit(...args),
}));

const { PATCH, DELETE } = await import("@/app/api/users/[id]/route");

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

const TARGET_USER = {
  id: "user-2",
  name: "Target User",
  email: "target@example.com",
  role: "ECONOMIC_DEVELOPMENT_OFFICER",
  status: "ACTIVE",
};

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

function deleteRequest(url: string, origin: string | null = APP_URL) {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "DELETE", headers });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
});

describe("PATCH /api/users/[id] — CSRF", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  afterAll(() => { process.env.NEXT_PUBLIC_APP_URL = originalAppUrl; });

  it("accepts a matching (valid) origin", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, status: "INACTIVE" });
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }, APP_URL), params("user-2"));
    expect(res.status).toBe(200);
  });

  it("rejects a mismatched (invalid) origin before touching session or DB", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }, "http://evil.example.com"), params("user-2"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects a missing origin/referer", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }, null), params("user-2"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/users/[id] — authentication", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/users/[id] — authorization (SUPER_ADMIN-only mutation)", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("allows SUPER_ADMIN", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, status: "INACTIVE" });
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(200);
  });

  it("rejects ADMIN — read-only for user management, cannot modify any account (even within their own division)", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT) attempting unauthorized user modification", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/users/[id] — validation", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
  });

  it("accepts valid input (status change)", async () => {
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, status: "INACTIVE" });
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(res.status).toBe(200);
  });

  it("accepts an empty body (no fields to update) without error", async () => {
    mockPrisma.user.update.mockResolvedValue(TARGET_USER);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, {}), params("user-2"));
    expect(res.status).toBe(200);
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data).toEqual({});
  });

  it("returns 404 for a genuinely missing user (malformed/unknown id)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/does-not-exist`, { status: "INACTIVE" }), params("does-not-exist"));
    expect(res.status).toBe(404);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("trims whitespace from name and phone", async () => {
    mockPrisma.user.update.mockResolvedValue(TARGET_USER);
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { name: "  Padded Name  ", phone: " 0771234567 " }), params("user-2"));
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data.name).toBe("Padded Name");
    expect(arg.data.phone).toBe("0771234567");
  });

  it("rejects malformed JSON body", async () => {
    const headers = new Headers({ "content-type": "application/json", origin: APP_URL });
    const req = new NextRequest(`${APP_URL}/api/users/user-2`, { method: "PATCH", headers, body: "{not-json" });
    await expect(PATCH(req, params("user-2"))).rejects.toThrow();
  });
});

describe("PATCH /api/users/[id] — field whitelisting", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.update.mockResolvedValue(TARGET_USER);
  });

  it("ignores an attempt to set role via the body — not one of the accepted fields", async () => {
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { role: "SUPER_ADMIN" }), params("user-2"));
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data).not.toHaveProperty("role");
  });

  it("ignores an attempt to set email via the body — not one of the accepted fields", async () => {
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { email: "hijacked@example.com" }), params("user-2"));
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data).not.toHaveProperty("email");
  });

  it("ignores an attempt to set passwordHash via the body — not one of the accepted fields", async () => {
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { passwordHash: "raw-injected-hash" }), params("user-2"));
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data).not.toHaveProperty("passwordHash");
  });

  it("only writes the fields explicitly present in the body", async () => {
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { name: "Only Name" }), params("user-2"));
    const arg = mockPrisma.user.update.mock.calls[0][0];
    expect(arg.data).toEqual({ name: "Only Name" });
  });
});

describe("PATCH /api/users/[id] — database behavior", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
  });

  it("writes a WARNING-severity audit log on deactivation", async () => {
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, status: "INACTIVE" });
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "INACTIVE" }), params("user-2"));
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "User Deactivated", severity: "WARNING" }));
  });

  it("writes an INFO-severity audit log on activation", async () => {
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, status: "ACTIVE" });
    await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { status: "ACTIVE" }), params("user-2"));
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "User Activated", severity: "INFO" }));
  });

  it("returns the updated user in the response body", async () => {
    mockPrisma.user.update.mockResolvedValue({ ...TARGET_USER, name: "New Name" });
    const res = await PATCH(patchRequest(`${APP_URL}/api/users/user-2`, { name: "New Name" }), params("user-2"));
    const json = await res.json();
    expect(json.data.name).toBe("New Name");
  });
});

describe("DELETE /api/users/[id] — CSRF", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  afterAll(() => { process.env.NEXT_PUBLIC_APP_URL = originalAppUrl; });

  it("accepts a matching (valid) origin", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.delete.mockResolvedValue(TARGET_USER);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`, APP_URL), params("user-2"));
    expect(res.status).toBe(200);
  });

  it("rejects a mismatched (invalid) origin before touching session or DB", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`, "http://evil.example.com"), params("user-2"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });

  it("rejects a missing origin/referer", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`, null), params("user-2"));
    expect(res.status).toBe(403);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/users/[id] — authentication", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/users/[id] — authorization (SUPER_ADMIN-only mutation)", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("allows SUPER_ADMIN", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.delete.mockResolvedValue(TARGET_USER);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(200);
  });

  it("rejects ADMIN — read-only for user management, cannot delete accounts", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT) attempting unauthorized deletion", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(401);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/users/[id] — self-delete protection", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });

  it("rejects a SUPER_ADMIN attempting to delete their own account", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/${SUPER_ADMIN_SESSION.userId}`), params(SUPER_ADMIN_SESSION.userId));
    expect(res.status).toBe(400);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });

  it("allows a SUPER_ADMIN to delete a different account", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.user.delete.mockResolvedValue(TARGET_USER);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(res.status).toBe(200);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-2" } });
  });
});

describe("DELETE /api/users/[id] — validation / database behavior", () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_APP_URL = APP_URL; });
  beforeEach(() => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
  });

  it("returns 404 for a genuinely missing user (malformed/unknown id)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await DELETE(deleteRequest(`${APP_URL}/api/users/does-not-exist`), params("does-not-exist"));
    expect(res.status).toBe(404);
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });

  it("writes a WARNING-severity audit log on delete", async () => {
    mockPrisma.user.delete.mockResolvedValue(TARGET_USER);
    await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "User Deleted", severity: "WARNING" }));
  });

  it("actually deletes the correct row by id", async () => {
    mockPrisma.user.delete.mockResolvedValue(TARGET_USER);
    await DELETE(deleteRequest(`${APP_URL}/api/users/user-2`), params("user-2"));
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-2" } });
  });
});
