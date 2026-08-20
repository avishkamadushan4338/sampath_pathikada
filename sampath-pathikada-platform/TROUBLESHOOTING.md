# Troubleshooting

Symptom-driven reference. For incident *procedures* (what to do during an
active outage), see [OPERATIONS.md](./OPERATIONS.md) instead.

## App won't start / crashes immediately

**Most likely cause: `JWT_SECRET` missing or under 32 characters.** This app
fails closed by design (`lib/jwt-secret.ts`) — check the logs for:

```
Error: JWT_SECRET environment variable is not set. Refusing to start without a real session signing secret.
```

or

```
Error: JWT_SECRET is too short (must be at least 32 characters) to safely sign sessions.
```

Fix: set a real `JWT_SECRET` (see [ENVIRONMENT.md](./ENVIRONMENT.md)) and restart.

## `npm run dev` / `npm run build` fails with `EPERM: operation not permitted, scandir '...\Application Data'` or `...\Cookies` (Windows only)

**Root cause confirmed**: webpack's build-time filesystem walk resolves
`os.homedir()` (which follows `USERPROFILE` on Windows) and, on some Windows
accounts, that walk hits legacy junction folders under `C:\Users\<you>`
(`Application Data`, `Cookies`, `Local Settings`, etc.) that a normal user
account cannot enumerate — the OS returns `EPERM`, not `ENOENT`, so it can't
be treated as "doesn't exist." It is **not caused by application code** —
reproduced identically on a clean checkout before any of this remediation's
changes, and unrelated to `sharp`/native modules specifically.

- It does not occur in CI (Ubuntu) or inside the Docker build (Linux base
  image) — those are the real build gates; a local Windows dev build failure
  here does not indicate a broken production build.
- `next.config.js`'s `outputFileTracingRoot` fixes the *related* "wrong
  workspace root inferred" warning (caused by a stray sibling
  `package-lock.json`), but does not by itself stop the homedir walk.
- **Verified workaround**: run the build (or `npm run dev`) with `HOME` and
  `USERPROFILE` temporarily pointed at a directory outside `C:\Users\<you>`,
  e.g. from Git Bash:
  ```bash
  HOME="D:/tmp" USERPROFILE="D:/tmp" npm run build
  ```
  This was confirmed to take the build from failing immediately to compiling
  successfully on an affected machine. Alternatively, run the build inside
  Docker (`docker compose build` uses the Linux base image and is unaffected)
  or inside WSL2 — either sidesteps Windows junctions entirely.
- Separately, confirm your local Node version matches `.nvmrc` (Node 20, same
  as CI) — a newer/unpinned global Node install is a plausible contributor to
  this kind of platform-specific fs-walk difference and is worth ruling out
  first since it's a one-line check (`node --version`).

## CSRF errors ("Invalid request origin") on legitimate requests

Check `NEXT_PUBLIC_APP_URL` matches the domain you're actually accessing the
app from, exactly (including protocol and port). `lib/csrf.ts`'s
`verifyOrigin()` compares the request's `Origin`/`Referer` header against this
value — a mismatch (e.g. `NEXT_PUBLIC_APP_URL=http://localhost:3004` while
accessing via a different port, or via a reverse-proxied domain that doesn't
match) fails every mutating request. This value is baked in at Docker build
time (see [DEPLOYMENT.md](./DEPLOYMENT.md)) — changing it requires a rebuild,
not just an env var change on an already-built image.

## "Too many requests" (429) unexpectedly

`lib/rate-limit.ts` keys on client IP (production: Redis-backed, shared
across every replica — see [SECURITY.md](./SECURITY.md)) — if you're behind a
reverse proxy or load balancer that doesn't forward `X-Forwarded-For`
correctly, every request may appear to come from the same IP (the proxy's),
hitting rate limits far sooner than intended for legitimate traffic. Confirm
your proxy sets `X-Forwarded-For` (or `X-Real-IP`) to the real client IP.

Separately: in local dev/test (no `RATE_LIMIT_REDIS_URL`/`REDIS_URL` set),
rate limiting falls back to an in-memory, per-process `Map` that resets on
every restart — if you're debugging "why did the limit reset" locally, that's
why. In production the Redis-backed limiter persists across app restarts and
redeploys, since state lives in Redis, not the app process.

## Registration approval fails with "Another [role] was approved for this division at the same time"

This is the TOCTOU-race fix working as intended, not a bug — see
[SECURITY.md](./SECURITY.md) / the transaction in
`app/api/registrations/[id]/route.ts`. It means two approvals for the same
division's AD/DS role were attempted concurrently and one lost the race
safely (rolled back, no partial state). Retry the approval — it will succeed
once the other one has committed and the "existing active holder" check
reflects the current state.

## Verification document images disappeared after a redeploy

If you're running via plain `docker run`/`docker compose up` **without** the
named volume defined in `docker-compose.yml` (e.g. you built a custom
deployment that doesn't mount `verification-uploads`), uploaded NIC/license/
passport images live on the container's writable layer and are lost on
recreation. See [DEPLOYMENT.md](./DEPLOYMENT.md)'s step on verifying the
volume is real, persistent disk — this is the single most consequential
infrastructure gap this remediation flagged and provided tooling for
(`docker-compose.yml`'s `verification-uploads` volume), but it only helps if
you're actually using that compose file (or an equivalent volume mount) in
your real deployment.

## `/api/health` says healthy but the app seems broken

Remember `/api/health` is **liveness only** — it does not check the database
(deliberately, see [DEPLOYMENT.md](./DEPLOYMENT.md)). Check
`/api/health/ready` instead, which does verify MySQL connectivity. A "healthy"
liveness response only means the Node process itself can respond to an HTTP
request, nothing about whether it can actually serve real functionality.

## Lint warnings about Tailwind classnames that "aren't valid"

Several shadcn/ui-generated components (`components/ui/dropdown-menu.tsx`,
`popover.tsx`, `select.tsx`, `tooltip.tsx`) reference Tailwind animation
utility classes (`animate-in`, `fade-in-0`, `zoom-in-95`,
`data-[state=open]:...`, etc.) that are **not actually defined anywhere in
this project** — no `tailwindcss-animate`/`tw-animate-css` plugin is
installed, and `app/globals.css` defines a different set of custom
`@keyframes`. This is a pre-existing gap in the app (these classes currently
render as no-ops, not broken, just inert), surfaced — not introduced — by
adding the ESLint Tailwind plugin during this remediation. Fixing the actual
missing-animation-library gap is a UI/functionality decision outside this
remediation's security/production-readiness scope; the warnings are safe to
leave as-is (they don't fail `npm run lint`, which exits 0) until someone
decides whether to install the animation plugin or remove the dead classes.

## `npm audit` shows vulnerabilities I don't recognize

Check severity first — CI only blocks on `critical` (see
[SECURITY.md](./SECURITY.md) for why, and the current known-accepted `high`
findings). Run `npm audit` locally for the up-to-date list; this document and
SECURITY.md will drift from the actual current state over time.

## NOT VERIFIED

This document is derived from source-code review and the fixes made during
this remediation pass, not from a corpus of real production incidents (this
app has no production incident history available to this remediation).
Symptoms not listed here haven't necessarily been ruled out — they simply
haven't been encountered/reasoned through yet.
