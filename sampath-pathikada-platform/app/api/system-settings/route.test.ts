import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

const mockPrisma = {
  systemSetting: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const mockLogAudit = vi.fn();
vi.mock("@/lib/audit-log", () => ({
  logAudit: (...args: unknown[]) => mockLogAudit(...args),
}));

const { GET, PATCH } = await import("@/app/api/system-settings/route");

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

function patchRequest(url: string, body: unknown, origin: string | null = APP_URL) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.systemSetting.findMany.mockResolvedValue([]);
});

describe("GET /api/system-settings — authentication", () => {
  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("rejects an invalid/expired session (getSession resolves null)", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockPrisma.systemSetting.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/system-settings — authorization", () => {
  it.each([
    ["SUPER_ADMIN", SUPER_ADMIN_SESSION],
    ["ADMIN", ADMIN_SESSION],
  ])("allows %s (read access)", async (_label, session) => {
    mockGetSession.mockResolvedValue(session);
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockPrisma.systemSetting.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/system-settings — data behavior", () => {
  it("returns an empty list when there are no settings", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.findMany.mockResolvedValue([]);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("returns settings ordered by key for normal data", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.findMany.mockResolvedValue([
      { key: "maintenance_mode", value: "false" },
      { key: "submission_deadline", value: "2026-12-31" },
    ]);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(mockPrisma.systemSetting.findMany).toHaveBeenCalledWith({ orderBy: { key: "asc" } });
  });
});

describe("PATCH /api/system-settings — CSRF", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("accepts a matching (valid) origin", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" }, APP_URL);
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("rejects a mismatched (invalid) origin before touching the session or DB", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" }, "http://evil.example.com");
    const res = await PATCH(req);
    expect(res.status).toBe(403);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });

  it("rejects a missing origin/referer", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" }, null);
    const res = await PATCH(req);
    expect(res.status).toBe(403);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/system-settings — authentication", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("rejects a missing session", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/system-settings — authorization", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("allows SUPER_ADMIN to write", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("rejects ADMIN — read-only role for this route", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });

  it("rejects a forbidden role (DIVISIONAL_SECRETARIAT)", async () => {
    mockGetSession.mockResolvedValue(FORBIDDEN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/system-settings — validation", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("accepts valid key/value input", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("rejects a missing key", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { value: "v" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });

  it("rejects a missing value", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.systemSetting.upsert).not.toHaveBeenCalled();
  });

  it("accepts an empty-string value as valid (boundary — not the same as undefined)", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("rejects malformed JSON body", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    const headers = new Headers({ "content-type": "application/json", origin: APP_URL });
    const req = new NextRequest(`${APP_URL}/api/system-settings`, { method: "PATCH", headers, body: "{not-json" });
    await expect(PATCH(req)).rejects.toThrow();
  });

  it("ignores unexpected extra fields in the body", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v", unexpectedField: "hacked" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const arg = mockPrisma.systemSetting.upsert.mock.calls[0][0];
    expect(arg.create).not.toHaveProperty("unexpectedField");
    expect(arg.update).not.toHaveProperty("unexpectedField");
  });
});

describe("PATCH /api/system-settings — database behavior", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("upserts using key as the unique identifier", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "maintenance_mode", value: "true" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "maintenance_mode", value: "true" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith({
      where: { key: "maintenance_mode" },
      update: { value: "true" },
      create: { key: "maintenance_mode", value: "true" },
    });
  });

  it("writes an audit log entry on successful update", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v" });
    await PATCH(req);
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({
      action: "System Setting Updated",
      category: "SYSTEM",
      userId: SUPER_ADMIN_SESSION.userId,
    }));
  });

  it("returns the upserted setting in the response body", async () => {
    mockGetSession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockPrisma.systemSetting.upsert.mockResolvedValue({ key: "k", value: "v2" });
    const req = patchRequest(`${APP_URL}/api/system-settings`, { key: "k", value: "v2" });
    const res = await PATCH(req);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, data: { key: "k", value: "v2" } });
  });
});
