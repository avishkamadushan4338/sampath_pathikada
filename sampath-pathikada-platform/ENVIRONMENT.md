# Environment Variables

All variables below are read directly from `process.env` in application code
(confirmed by repo-wide search — this list is exhaustive, not aspirational).
Copy `.env.example` to `.env.local` for local development. **Never commit a
real `.env`/`.env.local`** — both are gitignored (see the note in Git Security
below about why this matters more than usual for this repo).

| Variable | Classification | Required | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Secret (contains DB credentials) | Yes | MySQL connection string. Format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=N&pool_timeout=S`. See [DATABASE.md](./DATABASE.md) for the `connection_limit`/`pool_timeout` sizing rationale. |
| `JWT_SECRET` | Secret | Yes | Signs/verifies session JWTs (`lib/jwt-secret.ts`). Must be ≥32 characters — **the app refuses to start otherwise** (fails closed, no insecure default exists). Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. |
| `SUPER_ADMIN_EMAIL` | Private | Yes (for `db:seed`) | Bootstrapped as the first Super Admin account when `npm run db:seed` runs. Only used at seed time, not read at request time. |
| `SUPER_ADMIN_PASSWORD` | Secret | Yes (for `db:seed`) | Initial password for the seeded Super Admin. **Change this immediately after first login in any real deployment** — it is not force-rotated automatically. |
| `NEXT_PUBLIC_APP_URL` | Public (ships to the browser) | Yes | Used for CSRF origin verification (`lib/csrf.ts`) and baked into the client bundle at Docker build time — see the note in `Dockerfile`. Must be the real production domain in production; a mismatch here makes every state-changing request fail CSRF checks. |
| `NODE_ENV` | Infrastructure | Yes | Standard Node convention. Controls cookie `Secure` flag (`app/api/auth/login/route.ts` — cookies are only marked `Secure` when this is `"production"`), Prisma query logging verbosity, and the logger's JSON-vs-readable output format (`lib/logger.ts`). |
| `RESEND_API_KEY` | Secret | Only for forgot-password emails | Resend API key for sending OTP emails (`lib/email.ts`). Without it, `/api/auth/forgot-password` will fail when it tries to send — see the TODO comment in `.env` for local dev. |
| `RESEND_FROM_EMAIL` | Private | Only for forgot-password emails | Must be an address on a domain verified in Resend (or `resend.dev` for testing). |
| `VERIFICATION_DOC_RETENTION_DAYS` | Public-safe | No (defaults to 14) | Days a `PENDING` registration's uploaded NIC/license/passport image is kept before the stale-doc cleanup job purges it (`app/api/registrations/route.ts`). |
| `RATE_LIMIT_REDIS_URL` (or `REDIS_URL`) | Secret (may contain credentials) | Yes in production | Redis/Valkey connection string backing the distributed rate limiter (`lib/rate-limit.ts`). **The app refuses to start in production without it** (fails closed, same pattern as `JWT_SECRET`) — an in-memory limiter would silently stop enforcing limits across horizontally-scaled instances. Outside production, falls back to an in-memory limiter with a logged warning if unset. `RATE_LIMIT_REDIS_URL` takes precedence if both are set, letting you point rate-limit keys at a different logical DB/instance than other Redis usage. |

## Everything shipped to the browser is public

Only `NEXT_PUBLIC_APP_URL` uses the `NEXT_PUBLIC_` prefix in this codebase — confirmed by repo-wide search, nothing else is exposed to client bundles. If you ever add a new `NEXT_PUBLIC_*` variable, treat its value as visible to anyone who opens DevTools, same as this one.

## Environment separation

This repo does not itself define separate `.env.staging`/`.env.production` files — Next.js's own convention (`.env`, `.env.local`, `.env.production`, etc.) applies if you choose to use it, but nothing in this codebase currently branches on more than `NODE_ENV === "production"` vs. everything else. **There is no dedicated staging environment defined anywhere in this repo** — if you need one, it means a second full deployment (separate `DATABASE_URL`, separate `JWT_SECRET`, separate domain) using the same Docker image, not a config toggle within this app.

## Git security — why `.env.local` being gitignored matters here specifically

`.env.local` was, at one point in this repo's history, committed to git despite
being gitignored (added before the ignore rule existed, or via a forced add) —
this has been fixed (`git rm --cached`), but the historical commit still exists
in git history containing a `JWT_SECRET` and `SUPER_ADMIN_PASSWORD`. **If either
of those values was ever used in a real deployment, rotate both before
considering this repo's history "safe."** Removing a file from the current tree
does not remove it from history — if this repository is ever made public or
shared outside its current trusted contributors, a full history scrub
(`git filter-repo` or BFG) would be needed in addition to the rotation, which
is a destructive git-history operation this remediation deliberately did not
perform automatically (see the Safe Modification Policy this work followed).

## NOT VERIFIED

- Whether any of these variables are additionally set via a hosting platform's own secrets manager (Vercel env vars, AWS Secrets Manager, etc.) outside this repo — this document only covers what the application code itself reads.
