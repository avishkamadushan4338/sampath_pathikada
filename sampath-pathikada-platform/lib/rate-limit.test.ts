import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-under-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 5, 60).allowed).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-over-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", async () => {
    const key = `test-reset-${Date.now()}`;
    expect(rateLimit(key, 1, 0.05).allowed).toBe(true);
    expect(rateLimit(key, 1, 0.05).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 100));
    expect(rateLimit(key, 1, 0.05).allowed).toBe(true);
  });

  it("tracks independent keys separately", () => {
    const keyA = `test-a-${Date.now()}`;
    const keyB = `test-b-${Date.now()}`;
    expect(rateLimit(keyA, 1, 60).allowed).toBe(true);
    expect(rateLimit(keyA, 1, 60).allowed).toBe(false);
    expect(rateLimit(keyB, 1, 60).allowed).toBe(true);
  });
});
