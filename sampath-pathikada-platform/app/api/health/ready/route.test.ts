import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}));

const { GET } = await import("@/app/api/health/ready/route");

describe("GET /api/health/ready — readiness (DB-dependent)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and db: up when the database responds", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, db: "up" });
  });

  it("returns 503 and db: down when the database is unreachable, without leaking the raw error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:3306"));
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json).toMatchObject({ ok: false, db: "down" });
    expect(JSON.stringify(json)).not.toContain("ECONNREFUSED");
  });
});
