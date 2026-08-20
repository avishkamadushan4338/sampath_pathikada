import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  $queryRaw: vi.fn(),
};
vi.mock("@/lib/db", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health — liveness (must stay DB-independent)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 without ever touching the database", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("includes uptimeSeconds and a timestamp", async () => {
    const res = await GET();
    const json = await res.json();
    expect(typeof json.uptimeSeconds).toBe("number");
    expect(typeof json.timestamp).toBe("string");
  });
});
