// Edge-safe: no Node-only imports (used by both middleware.ts and lib/auth.ts).
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    "JWT_SECRET environment variable is not set. Refusing to start without a real session signing secret."
  );
}

if (secret.length < 32) {
  throw new Error(
    "JWT_SECRET is too short (must be at least 32 characters) to safely sign sessions."
  );
}

export const JWT_SECRET = new TextEncoder().encode(secret);
