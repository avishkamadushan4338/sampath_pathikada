# Security

## Reporting a vulnerability

This is an internal government-portal application. If you find a security
issue, report it to the project maintainers directly rather than filing a
public issue — this repo does not currently have a dedicated security contact
or disclosure process beyond that.

## Authentication

- Sessions: JWT (HS256, via `jose`) in an `HttpOnly`, `SameSite=Lax` cookie,
  8-hour expiry (`lib/auth.ts`, `COOKIE_NAME = "sp_session"`). `Secure` is set
  whenever `NODE_ENV === "production"`.
- Passwords: bcrypt, cost factor 12.
- Login: 5 failed attempts locks the account for 15 minutes
  (`loginAttempts`/`lockedUntil` on `User`), rate-limited 10 requests/60s per
  IP (`lib/rate-limit.ts`). Generic "Invalid email or password" message — no
  account-existence leak via error text.
- Password reset: 6-digit OTP, SHA-256-hashed at rest (justified — short-lived
  and rate-limited, see the comment in `prisma/schema.prisma` near
  `PasswordResetOtp`), 10-minute TTL, max 5 incorrect attempts before forced
  re-request, always returns a generic `ok:true` regardless of whether the
  email exists (enumeration-resistant).
- Rate limiting (`lib/rate-limit.ts`) is backed by Redis/Valkey: an atomic
  Lua-scripted `INCR`+`PEXPIRE` fixed window, enforced consistently across
  every horizontally-scaled app instance (not per-process). Limits/windows
  are unchanged from the original in-memory implementation — see the table
  below. **Fails open, not closed**, if Redis is unreachable: the request is
  allowed and the failure is logged server-side only (never in the response),
  so a cache outage degrades rate-limit coverage rather than taking down
  authentication — the account-lockout and OTP-attempt caps above are
  independent backstops that still apply during such a window. In production,
  the app refuses to start without `RATE_LIMIT_REDIS_URL`/`REDIS_URL` set
  (fails closed on *configuration*, same as `JWT_SECRET`) — see
  [ENVIRONMENT.md](./ENVIRONMENT.md).

  | Endpoint | Key | Limit | Window |
  |---|---|---|---|
  | `POST /api/auth/login` | IP | 10 | 60s |
  | `POST /api/auth/forgot-password` | IP + email | 5 | 15 min |
  | `POST /api/auth/verify-otp` | IP + email | 10 | 15 min |
  | `POST /api/registrations` | IP | 5 | 15 min |
- `JWT_SECRET` **fails closed** — `lib/jwt-secret.ts` throws at process
  startup if the env var is unset or under 32 characters. There is no
  fallback/default secret anywhere in this codebase.

## Authorization / RBAC

Five roles: `SUPER_ADMIN`, `ADMIN`, `ECONOMIC_DEVELOPMENT_OFFICER`,
`ASSISTANT_DIRECTOR_PLANNING`, `DIVISIONAL_SECRETARIAT`. Enforcement happens
at two independent layers:

1. **`middleware.ts`** — verifies the session JWT's signature (not just
   decodes it) for every request under a protected path prefix, **and**
   verifies the session's role matches the prefix being accessed (e.g. a
   `DIVISIONAL_SECRETARIAT` session hitting `/super-admin/*` is redirected to
   its own dashboard, not silently let through). This second check was added
   during this remediation — previously only session *validity* was checked,
   not role-to-path matching.
2. **`components/layout/RoleGuard.tsx`** — client-side UI gate, explicitly
   documented as defense-in-depth on top of #1, not a substitute for it.
   Applied to all five role-scoped layouts (including `(super-admin)`, which
   was missing this guard entirely before this remediation).

Every API route under `app/api/**` independently checks
`session.role` server-side — `middleware.ts`'s matcher explicitly excludes
`api/`, so **API authorization is never inherited from the page-level
middleware check**. When adding a new API route, it must do its own
`getSession()` + role check; nothing upstream does it for you.

### Division-scoped access (IDOR prevention)

`ADMIN`, `ASSISTANT_DIRECTOR_PLANNING`, and `DIVISIONAL_SECRETARIAT` accounts
are scoped to a single `dsDivision` and must never read or mutate another
division's data. This is enforced by threading `session.dsDivision` into the
relevant Prisma `where` clause on every scoped route (see `lib/registrations.ts`'s
`findRecord()` for the canonical pattern: `SUPER_ADMIN` passes `null`/unrestricted,
every other role passes their own `dsDivision`).

**If `session.dsDivision` is `null`/unset for a role that should be scoped,
the route must explicitly deny access (403) rather than falling through to an
unscoped query.** This exact bug (an ADMIN with no division assigned silently
getting unrestricted access) was found and fixed during this remediation's own
adversarial self-review — see the three `registrations/[id]*` routes for the
guard pattern (`if (session.role !== "SUPER_ADMIN" && !session.dsDivision) return 403`).

When adding a new division-scoped route, write a regression test asserting
BOTH: (a) an out-of-division request returns 404 (not 403 — see the note
below on why), and (b) an unassigned-division request returns 403 and never
reaches the database query. See `app/api/registrations/[id]/route.test.ts`
for the pattern.

**Why 404, not 403, for "exists but out of scope"**: returning 403 would
confirm to an attacker that a resource with that ID exists in some other
division; 404 makes "doesn't exist" and "exists but not yours" indistinguishable.

## CSRF

`lib/csrf.ts`'s `verifyOrigin()` does a same-origin check (`Origin`/`Referer`
header vs. `NEXT_PUBLIC_APP_URL`) on every mutating route (POST/PATCH/DELETE)
— confirmed applied to 100% of mutating routes as of the last full audit. This
is layered with the `SameSite=Lax` cookie as the primary defense. If
`NEXT_PUBLIC_APP_URL` is unset, `verifyOrigin` returns `false` unconditionally
— fails closed (blocks all mutations) rather than open.

When adding a new mutating route, call `verifyOrigin(req)` first, before any
other logic — see any existing POST/PATCH route for the pattern.

## Security headers

Set globally via `next.config.js`'s `headers()`: `Content-Security-Policy`,
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(camera/microphone/geolocation all denied), `Strict-Transport-Security`.

The CSP uses `'unsafe-inline'` for `script-src`/`style-src` — required because
Next.js injects an inline hydration bootstrap script and this app has no
nonce plumbing. This was verified live against the running dev server before
being added: no page in this codebase references any cross-origin
script/style/image/font source (confirmed via rendered-HTML inspection), so
the CSP's `'self'`-only directives for `img-src`/`font-src`/`connect-src`
don't break anything. **If you ever add a third-party script, font CDN, or
external API call from client code, you must update the CSP in
`next.config.js` to allow that specific origin** — it will otherwise be
silently blocked by the browser, not by this app.

## File uploads

Verification documents (NIC/license/passport images, `lib/verification-docs.ts`):

- 5MB size cap
- Format validated by **content-sniffing via `sharp`** (`meta.format`), not
  filename/extension trust — rejects disguised files
- Re-encoded through `sharp` (rotate/resize/reformat), which strips
  EXIF/GPS metadata and neutralizes most embedded-payload risks by fully
  re-rasterizing the image
- Path-traversal guard: resolved paths are asserted to stay within
  `STORAGE_ROOT` before any filesystem operation
- Not publicly web-accessible — served only through the authenticated
  `/api/registrations/[id]/document/[side]` route, which is itself
  division-scoped (see IDOR section above)
- Hard-deleted immediately after an approve/reject decision (legal-retention
  design — see the comment at the top of `lib/verification-docs.ts`)

**Storage location is local container disk, not object storage.** This is a
deliberate, documented tradeoff for a single-VPS deployment (see
[DEPLOYMENT.md](./DEPLOYMENT.md)'s note on the `verification-uploads` Docker
volume) — if this app ever needs to scale to multiple instances, this must
move to shared/object storage first, or uploads will be invisible across
instances and lost on container recreation without the volume mount.

## SQL injection

**None found.** All database access goes through Prisma's query builder or
tagged-template `$queryRaw` (auto-parameterized). No `$queryRawUnsafe`/
`$executeRawUnsafe` calls exist anywhere in application code (confirmed via
repo-wide search — the only matches are inside Prisma's own generated type
declarations, not application code). If you ever need raw SQL, use the
tagged-template form (`` prisma.$queryRaw`...${value}...` ``) and never
string-concatenate user input into a raw query.

## Dependency security

CI runs `npm audit --audit-level=critical` on every push/PR, blocking the
build on new critical-severity advisories. See the inline comment in
`.github/workflows/ci.yml` for the current known-accepted gaps. Run
`npm audit` locally before relying on this list being current — it will drift.

As of this writing, `npm audit` reports 4 high-severity findings, 0 critical:
`xlsx` (below) plus `next`'s own internal, nested copies of `postcss` and
`sharp` (`node_modules/next/node_modules/{postcss,sharp}` — confirmed via
`npm ls`/`npm audit`'s `nodes` field, distinct from this app's top-level
`postcss@^8.5.4`/`sharp@^0.35.3`, which are not in the vulnerable range).
`npm audit`'s own suggested fix for all three is `next@16.3.1`
(`isSemVerMajor: true`) — a major-version upgrade, not something `npm audit
fix` or a patch bump resolves. Not upgraded automatically during this
remediation, per the "don't blindly upgrade, only with evidence/justification"
principle: a Next.js 15→16 major bump needs its own scoped testing pass, not
a drive-by dependency fix. Revisit when planning a Next 16 migration, or
sooner if either advisory's exploitability against this app's actual usage
changes (`postcss`'s advisories require parsing attacker-controlled
`sourceMappingURL` CSS comments — not something this app's build/runtime does
with user input; `sharp`'s is in `next`'s own internal image-optimization
copy, not the direct `sharp` dependency `lib/verification-docs.ts` uses).

### `xlsx` — accepted risk, with evidence (re-verified during the go-live remediation pass)

`npm audit` reports two high-severity advisories against `xlsx@0.18.5`:
prototype pollution ([GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6),
fixed in `0.19.3`) and a ReDoS in the number-format-string parser
([GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9),
fixed in `0.20.2`). `npm audit` shows `fixAvailable: false` — this is not
because no fix exists, but because SheetJS stopped publishing releases past
`0.18.5` to the public npm registry; newer versions are only distributed via
their own CDN (`cdn.sheetjs.com`), which `npm install` won't reach. Moving to
a CDN-hosted tarball dependency is a real supply-chain tradeoff (no npm
registry integrity checks, a new trust dependency on SheetJS's own hosting)
and was deliberately not done automatically here — see the "do not blindly
upgrade" note this evaluation followed.

**Why exploitation is not currently possible in this app** (confirmed by a
repo-wide search, not assumed):
- `grep`-confirmed exactly one import site: `app/api/export/excel/route.ts`.
- Every call at that site is a **write-path** API: `XLSX.utils.book_new`,
  `XLSX.utils.json_to_sheet`, `XLSX.utils.book_append_sheet`, `XLSX.write`.
- **Zero** calls to any read-path API (`XLSX.read`, `XLSX.readFile`,
  `XLSX.utils.sheet_to_json`) exist anywhere in this codebase — confirmed by
  the same search.
- Both advisories require attacker-controlled input reaching XLSX's *parser*
  (a malicious `.xlsx` file, or a malicious number-format string) — this app
  never parses an uploaded/external `.xlsx` file and never accepts a
  user-controlled `numFmt` string; sheet data comes from Prisma query results
  the server itself constructed.

**If this ever changes** — if a future feature imports/parses an `.xlsx`
file from any external source (user upload, third-party API, etc.) — this
accepted-risk determination no longer holds and `xlsx` must be upgraded
(via the SheetJS CDN tarball) or replaced (e.g. `exceljs`) before that
feature ships, not after.

## Regression tests for every fixed vulnerability

Every security fix made during this remediation has a corresponding test
asserting the specific vulnerability can't silently return — not just that
the happy path works, but that the actual query/check that closes the hole
was exercised. See:

- `app/api/registrations/[id]/route.test.ts` — IDOR + unassigned-division edge case
- `app/api/registrations/[id]/document/[side]/route.test.ts` — same, for document access
- `middleware.test.ts` — role-to-path enforcement, using real signed JWTs (not mocked auth)
- `app/api/export/csv/route.test.ts` — unbounded-query cap

When fixing a future security issue, follow this pattern: the test should
fail against the *old* (vulnerable) code and pass against the fix, not just
assert a status code that happens to be correct for unrelated reasons.

## NOT VERIFIED

- Whether `JWT_SECRET`/`SUPER_ADMIN_PASSWORD` values that were briefly
  committed to this repo's git history (see [ENVIRONMENT.md](./ENVIRONMENT.md))
  were ever used in a real deployment — rotate both if so.
- Network-level TLS/HTTPS configuration — this repo's headers assume HTTPS is
  terminated somewhere upstream (see [DEPLOYMENT.md](./DEPLOYMENT.md)) but
  does not configure or verify it itself.
- Any external penetration test or third-party security audit — the findings
  in this document come from source-code review, not a live attack surface test.
