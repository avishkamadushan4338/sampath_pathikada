import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import Redis from "ioredis";
import { InMemoryRateLimiter, RedisRateLimiter, type RateLimiter } from "@/lib/rate-limit";

// Tests below run the *same* behavioral suite against both backends
// (`runSharedContractTests`) plus backend-specific tests (concurrency,
// multi-instance sharing, datastore failure) that only make sense for one
// or the other. This is deliberate: the point of the RateLimiter abstraction
// is that route handlers depend on `RateLimiter`, not on which backend is
// active, so both implementations must satisfy the same contract.

function runSharedContractTests(name: string, makeLimiter: () => RateLimiter) {
  describe(`${name} — RateLimiter contract`, () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = makeLimiter();
    });

    it("allows the first request for a fresh key", async () => {
      const key = `contract-first-${name}-${Date.now()}-${Math.random()}`;
      const result = await limiter.check(key, 5, 60);
      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBe(0);
    });

    it("allows requests within the limit", async () => {
      const key = `contract-within-${name}-${Date.now()}-${Math.random()}`;
      for (let i = 0; i < 4; i++) {
        expect((await limiter.check(key, 5, 60)).allowed).toBe(true);
      }
    });

    it("allows the request that lands exactly on the limit", async () => {
      const key = `contract-exact-${name}-${Date.now()}-${Math.random()}`;
      // limit=3: 1st, 2nd, 3rd all allowed (3rd is "exactly at limit")
      expect((await limiter.check(key, 3, 60)).allowed).toBe(true);
      expect((await limiter.check(key, 3, 60)).allowed).toBe(true);
      expect((await limiter.check(key, 3, 60)).allowed).toBe(true);
    });

    it("blocks the request that exceeds the limit", async () => {
      const key = `contract-exceed-${name}-${Date.now()}-${Math.random()}`;
      for (let i = 0; i < 3; i++) {
        expect((await limiter.check(key, 3, 60)).allowed).toBe(true);
      }
      const blocked = await limiter.check(key, 3, 60);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("keeps blocking subsequent requests once over the limit", async () => {
      const key = `contract-keepblock-${name}-${Date.now()}-${Math.random()}`;
      for (let i = 0; i < 2; i++) await limiter.check(key, 2, 60);
      expect((await limiter.check(key, 2, 60)).allowed).toBe(false);
      expect((await limiter.check(key, 2, 60)).allowed).toBe(false);
    });

    it("resets and allows again once the window expires", async () => {
      const key = `contract-expire-${name}-${Date.now()}-${Math.random()}`;
      expect((await limiter.check(key, 1, 0.2)).allowed).toBe(true);
      expect((await limiter.check(key, 1, 0.2)).allowed).toBe(false);
      await new Promise((r) => setTimeout(r, 400));
      expect((await limiter.check(key, 1, 0.2)).allowed).toBe(true);
    });

    it("tracks independent keys separately", async () => {
      const keyA = `contract-indep-a-${name}-${Date.now()}-${Math.random()}`;
      const keyB = `contract-indep-b-${name}-${Date.now()}-${Math.random()}`;
      expect((await limiter.check(keyA, 1, 60)).allowed).toBe(true);
      expect((await limiter.check(keyA, 1, 60)).allowed).toBe(false);
      // keyB is unaffected by keyA's state
      expect((await limiter.check(keyB, 1, 60)).allowed).toBe(true);
    });

    it("handles concurrent requests for the same key without exceeding the limit", async () => {
      const key = `contract-concurrent-${name}-${Date.now()}-${Math.random()}`;
      const limit = 5;
      // Fire 20 concurrent checks; exactly `limit` should be allowed, no more,
      // no fewer — a race-y implementation would let more than `limit` through
      // because it read-then-wrote the counter non-atomically.
      const results = await Promise.all(
        Array.from({ length: 20 }, () => limiter.check(key, limit, 60))
      );
      const allowedCount = results.filter((r) => r.allowed).length;
      expect(allowedCount).toBe(limit);
    });

    it("rejects malformed configuration", async () => {
      const key = `contract-malformed-${name}-${Date.now()}-${Math.random()}`;
      await expect(limiter.check(key, 0, 60)).rejects.toThrow();
      await expect(limiter.check(key, -1, 60)).rejects.toThrow();
      await expect(limiter.check(key, 5, 0)).rejects.toThrow();
      await expect(limiter.check(key, 5, -10)).rejects.toThrow();
      await expect(limiter.check("", 5, 60)).rejects.toThrow();
    });
  });
}

/* ─── In-memory backend ──────────────────────────────────────────────────── */
const inMemoryInstances: InMemoryRateLimiter[] = [];
runSharedContractTests("InMemoryRateLimiter", () => {
  const limiter = new InMemoryRateLimiter();
  inMemoryInstances.push(limiter);
  return limiter;
});

afterAll(() => {
  for (const limiter of inMemoryInstances) limiter.destroy();
});

describe("InMemoryRateLimiter — single-process limitation (documented, not a bug)", () => {
  it("does NOT share state across separate instances — this is why it's dev/test-only", async () => {
    const key = `inmemory-isolated-${Date.now()}`;
    const instanceA = new InMemoryRateLimiter();
    const instanceB = new InMemoryRateLimiter();
    try {
      // Simulates two app processes each holding their own in-memory map: a
      // request pinned to instance A exhausting the limit has no effect on B.
      expect((await instanceA.check(key, 1, 60)).allowed).toBe(true);
      expect((await instanceA.check(key, 1, 60)).allowed).toBe(false);
      expect((await instanceB.check(key, 1, 60)).allowed).toBe(true);
    } finally {
      instanceA.destroy();
      instanceB.destroy();
    }
  });
});

/* ─── Redis backend ───────────────────────────────────────────────────────
   Requires a reachable Redis/Valkey-compatible server. Set RATE_LIMIT_TEST_REDIS_URL
   (falls back to RATE_LIMIT_REDIS_URL/REDIS_URL) to point at one — CI provides a
   `redis:7-alpine` service container for this (see .github/workflows/ci.yml).
   These tests are skipped, not failed, when no server is reachable, so
   `npm test` still passes for contributors without Redis running locally —
   but distributed behavior is only ever verified against a REAL server here,
   never mocked, per this repo's rate-limiter design goals.
──────────────────────────────────────────────────────────────────────────── */
const TEST_REDIS_URL =
  process.env.RATE_LIMIT_TEST_REDIS_URL || process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL;

async function isRedisReachable(url: string): Promise<boolean> {
  const probe = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 1000 });
  try {
    await probe.connect();
    await probe.ping();
    return true;
  } catch {
    return false;
  } finally {
    probe.disconnect();
  }
}

const redisAvailable = TEST_REDIS_URL ? await isRedisReachable(TEST_REDIS_URL) : false;
const describeRedis = redisAvailable ? describe : describe.skip;

if (!redisAvailable) {
  console.warn(
    "[rate-limit.test.ts] No reachable Redis found (set RATE_LIMIT_TEST_REDIS_URL) — " +
    "skipping RedisRateLimiter tests. These run in CI against a real redis:7-alpine service."
  );
}

describeRedis("RedisRateLimiter (real Redis)", () => {
  const redisInstances: RedisRateLimiter[] = [];
  const makeLimiter = () => {
    const limiter = new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: `test:${Date.now()}:${Math.random()}:` });
    redisInstances.push(limiter);
    return limiter;
  };

  runSharedContractTests("RedisRateLimiter", makeLimiter);

  afterEach(async () => {
    while (redisInstances.length) await redisInstances.pop()!.destroy();
  });

  it("shares limit state across two independent RedisRateLimiter instances (simulated multi-instance app)", async () => {
    // The core requirement this whole redesign exists for: two `RateLimiter`
    // objects pointed at the same Redis, constructed independently (as they
    // would be in two separate Node processes / container replicas behind a
    // load balancer), must observe and enforce ONE shared counter — not two
    // independent ones like the old in-memory Map did.
    const sharedPrefix = `multi-instance:${Date.now()}:${Math.random()}:`;
    const instanceA = new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: sharedPrefix });
    const instanceB = new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: sharedPrefix });
    const key = "shared-key";

    try {
      expect((await instanceA.check(key, 3, 60)).allowed).toBe(true); // count=1 via A
      expect((await instanceB.check(key, 3, 60)).allowed).toBe(true); // count=2 via B
      expect((await instanceA.check(key, 3, 60)).allowed).toBe(true); // count=3 via A
      // 4th request, regardless of which "instance" makes it, is over the
      // shared limit of 3 — proving state isn't process-local.
      expect((await instanceB.check(key, 3, 60)).allowed).toBe(false);
      expect((await instanceA.check(key, 3, 60)).allowed).toBe(false);
    } finally {
      await instanceA.destroy();
      await instanceB.destroy();
    }
  });

  it("enforces the limit correctly under concurrent requests from multiple simulated instances", async () => {
    const sharedPrefix = `multi-instance-concurrent:${Date.now()}:${Math.random()}:`;
    const instances = [
      new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: sharedPrefix }),
      new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: sharedPrefix }),
      new RedisRateLimiter(TEST_REDIS_URL!, { keyPrefix: sharedPrefix }),
    ];
    const key = "shared-concurrent-key";
    const limit = 10;

    try {
      // 30 concurrent requests spread across 3 "instances" sharing one Redis —
      // exactly `limit` should be allowed in total across all of them, proving
      // the atomic INCR+PEXPIRE script prevents races even across connections.
      const results = await Promise.all(
        Array.from({ length: 30 }, (_, i) => instances[i % 3].check(key, limit, 60))
      );
      const allowedCount = results.filter((r) => r.allowed).length;
      expect(allowedCount).toBe(limit);
    } finally {
      for (const instance of instances) await instance.destroy();
    }
  });

  it("fails open (allows the request) when Redis is unreachable, and never throws to the caller", async () => {
    // Points at a port nothing is listening on — simulates a Redis outage.
    // maxRetriesPerRequest:1 + connectTimeout:2000 (set inside RedisRateLimiter)
    // bound how long this takes.
    const unreachable = new RedisRateLimiter("redis://127.0.0.1:1", {
      onError: () => {}, // suppress the expected error log for this test
    });
    try {
      const result = await unreachable.check(`unreachable-${Date.now()}`, 5, 60);
      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBe(0);
    } finally {
      await unreachable.destroy();
    }
  }, 10000);

  it("invokes the onError callback (for observability) when failing open, without leaking the raw error to the result", async () => {
    let capturedErr: unknown;
    let capturedKey: string | undefined;
    const unreachable = new RedisRateLimiter("redis://127.0.0.1:1", {
      onError: (err, ctx) => {
        capturedErr = err;
        capturedKey = ctx.key;
      },
    });
    try {
      const key = `onerror-${Date.now()}`;
      const result = await unreachable.check(key, 5, 60);
      expect(capturedErr).toBeDefined();
      expect(capturedKey).toBe(key);
      // The RateLimitResult itself carries no error detail — callers only see allowed/retryAfterSeconds.
      expect(Object.keys(result).sort()).toEqual(["allowed", "retryAfterSeconds"]);
    } finally {
      await unreachable.destroy();
    }
  }, 10000);
});
