// Distributed fixed-window rate limiter.
//
// Backed by Redis/Valkey (via `RedisRateLimiter`) so limits are enforced
// correctly across every horizontally-scaled instance of this app, not just
// the process that happened to receive a given request. `RATE_LIMIT_REDIS_URL`
// (falling back to `REDIS_URL`) selects the backend:
//   - unset in production            -> throws at startup (fail closed on config)
//   - unset outside production       -> falls back to `InMemoryRateLimiter`
//     (single-process only; fine for local dev and tests, never for prod)
//   - set                            -> `RedisRateLimiter`
//
// Callers should not depend on which backend is active — both implement
// `RateLimiter` and are exercised by the same test suite (lib/rate-limit.test.ts).
import Redis from "ioredis";
import { logger } from "@/lib/logger";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

function validateInputs(key: string, limit: number, windowSeconds: number) {
  if (!key) throw new Error("rateLimit: key must be a non-empty string");
  if (!Number.isFinite(limit) || limit < 1) throw new Error(`rateLimit: limit must be >= 1, got ${limit}`);
  if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) {
    throw new Error(`rateLimit: windowSeconds must be > 0, got ${windowSeconds}`);
  }
}

/* ─── In-memory backend ───────────────────────────────────────────────────
   Single-process fixed-window counter. Correct within one process, but each
   horizontally-scaled instance would keep an independent count — never use
   this in a multi-instance production deployment. Kept for local dev/tests
   where spinning up Redis is unnecessary overhead.
──────────────────────────────────────────────────────────────────────────── */
interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>();
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of this.buckets) {
        if (bucket.resetAt <= now) this.buckets.delete(key);
      }
    }, 5 * 60 * 1000);
    this.cleanupTimer.unref?.();
  }

  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    validateInputs(key, limit, windowSeconds);
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  /** Test/shutdown only — stops the background cleanup interval. */
  destroy() {
    clearInterval(this.cleanupTimer);
    this.buckets.clear();
  }
}

/* ─── Redis backend ────────────────────────────────────────────────────────
   Atomic fixed-window counter shared across every app instance. INCR + a
   conditional PEXPIRE (only set on the first hit in a window) run as a single
   Lua script server-side, so concurrent requests — whether from the same
   instance or different ones — can never race past the limit: Redis executes
   scripts atomically, one at a time, so no two callers can observe a stale
   count and both increment past `limit`.
──────────────────────────────────────────────────────────────────────────── */

// KEYS[1] = bucket key, ARGV[1] = limit, ARGV[2] = window (ms)
// Returns [allowed (0/1), retryAfterMs].
const FIXED_WINDOW_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
if count > tonumber(ARGV[1]) then
  local ttl = redis.call("PTTL", KEYS[1])
  if ttl < 0 then ttl = tonumber(ARGV[2]) end
  return {0, ttl}
end
return {1, 0}
`;

export interface RedisRateLimiterOptions {
  /** Called whenever Redis is unreachable and the limiter fails open. Defaults to logger.error. */
  onError?: (err: unknown, context: { key: string }) => void;
  keyPrefix?: string;
}

export class RedisRateLimiter implements RateLimiter {
  private redis: Redis;
  private onError: (err: unknown, context: { key: string }) => void;
  private keyPrefix: string;

  constructor(redisUrl: string, options: RedisRateLimiterOptions = {}) {
    this.redis = new Redis(redisUrl, {
      // Bounded retry/backoff instead of the default unbounded reconnect loop —
      // a rate-limit check must resolve quickly (fail open) rather than hang a
      // request while Redis is down. maxRetriesPerRequest governs command-level
      // retries; connectTimeout bounds the initial connection attempt.
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => Math.min(times * 200, 2000),
      // lazyConnect: the client only opens a connection on the first command,
      // not when this class is constructed. Matters at Docker build time —
      // `next build` evaluates route modules (which import this file) with a
      // placeholder RATE_LIMIT_REDIS_URL (see Dockerfile) that resolves to
      // nothing reachable; an eager connection would retry/hang against it for
      // no reason, since no rate-limit check actually runs during a build.
      lazyConnect: true,
    });
    this.redis.on("error", (err) => {
      // ioredis requires an 'error' listener or it throws unhandled — this also
      // gives us one place to see connectivity issues without crashing requests.
      logger.error("Redis rate-limiter connection error", { route: "RedisRateLimiter" }, err);
    });
    this.onError = options.onError ?? ((err, context) =>
      logger.error("Rate limit check failed; failing open", { key: context.key, route: "RedisRateLimiter" }, err)
    );
    this.keyPrefix = options.keyPrefix ?? "ratelimit:";
  }

  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    validateInputs(key, limit, windowSeconds);
    const redisKey = `${this.keyPrefix}${key}`;
    const windowMs = Math.round(windowSeconds * 1000);

    try {
      const [allowedFlag, retryAfterMs] = (await this.redis.eval(
        FIXED_WINDOW_SCRIPT,
        1,
        redisKey,
        String(limit),
        String(windowMs)
      )) as [number, number];

      return {
        allowed: allowedFlag === 1,
        retryAfterSeconds: allowedFlag === 1 ? 0 : Math.ceil(retryAfterMs / 1000),
      };
    } catch (err) {
      // Fail safe = fail OPEN here, deliberately. This limiter guards
      // login/OTP/registration endpoints that already have independent
      // backstops (account lockout after 5 failed logins, OTP attempt caps) —
      // blocking every request because Redis is briefly unreachable would turn
      // a cache outage into a full authentication outage, which is worse than
      // temporarily losing rate-limit coverage. Never expose the underlying
      // error to the caller/response; it's logged server-side only.
      this.onError(err, { key });
      return { allowed: true, retryAfterSeconds: 0 };
    }
  }

  /** Test/shutdown only. */
  async destroy() {
    await this.redis.quit().catch(() => this.redis.disconnect());
  }
}

/* ─── Backend selection ──────────────────────────────────────────────────── */
function createDefaultLimiter(): RateLimiter {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL;

  if (redisUrl) {
    return new RedisRateLimiter(redisUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "RATE_LIMIT_REDIS_URL (or REDIS_URL) is not set. Refusing to start in production with an " +
      "in-memory rate limiter — it does not enforce limits across horizontally-scaled instances. " +
      "Set RATE_LIMIT_REDIS_URL to a reachable Redis/Valkey instance."
    );
  }

  logger.warn(
    "No RATE_LIMIT_REDIS_URL/REDIS_URL set; using in-memory rate limiter (single-process only, dev/test use only)."
  );
  return new InMemoryRateLimiter();
}

const globalForRateLimiter = globalThis as unknown as { rateLimiter?: RateLimiter };

export const rateLimiter: RateLimiter = globalForRateLimiter.rateLimiter ?? createDefaultLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

/** Convenience wrapper over the module-level `rateLimiter` singleton — this is what route handlers call. */
export function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  return rateLimiter.check(key, limit, windowSeconds);
}
