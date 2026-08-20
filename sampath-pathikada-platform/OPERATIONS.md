# Operations Runbook

For deployment steps see [DEPLOYMENT.md](./DEPLOYMENT.md). For database
specifics see [DATABASE.md](./DATABASE.md). This document is the "something's
wrong, what do I do" reference.

## Application restart

```bash
docker compose restart app
```

The container's `HEALTHCHECK` hits `/api/health/ready` (DB-dependent) every
30s — `docker compose ps` shows `healthy`/`unhealthy`/`starting`. Next.js's
standalone server handles `SIGTERM` gracefully on its own (stops accepting
new connections, lets in-flight requests finish, then exits) — no custom
shutdown hook was needed or added; see the comment in `instrumentation.ts` for
why an additional one would have been actively risky (races Next's own exit).

## Database restart

Outside this repo's control — MySQL is not containerized alongside the app
(see [DEPLOYMENT.md](./DEPLOYMENT.md)). Restart it however your hosting setup
manages it. After a DB restart, the app should reconnect automatically on the
next query (Prisma re-establishes pool connections as needed) — confirm with
`curl -f http://localhost:3000/api/health/ready`.

## Deployment / Rollback / Migration

See [DEPLOYMENT.md](./DEPLOYMENT.md) — not duplicated here.

## Backup / Restore

See [DATABASE.md](./DATABASE.md) — not duplicated here.

## Log inspection

```bash
docker compose logs -f app                    # follow live logs
docker compose logs --since 1h app             # last hour
docker compose logs app | grep '"level":"error"'   # errors only, once NODE_ENV=production (JSON logs)
```

In production (`NODE_ENV=production`), `lib/logger.ts` emits single-line JSON
— pipe through `jq` for readability:

```bash
docker compose logs app | grep '"level":"error"' | jq .
```

Every unhandled error in an API route is logged with a `requestId` (see
`lib/request-id.ts`) that also appears in the response if your reverse proxy
forwards `x-request-id` — use it to correlate a user-reported error with the
exact server-side log line.

**What's NOT logged anywhere structured**: client-side errors (React error
boundaries in `app/error.tsx`/`app/global-error.tsx` log to the browser
console only — there is no server-side error-reporting endpoint for client
exceptions in this app; see Observability Gaps below).

## Health checks

```bash
curl -f http://localhost:3000/api/health          # liveness — always 200 if the process is up
curl -f http://localhost:3000/api/health/ready     # readiness — 503 if MySQL is unreachable
```

The super-admin dashboard's "System Health" indicator also calls
`/api/health/ready` client-side (`app/(super-admin)/super-admin/dashboard/page.tsx`)
— if that indicator shows unhealthy but `curl` from the host works, check
whether the browser can actually reach the deployed URL (proxy/DNS issue)
rather than assuming the app itself is broken.

## Secret rotation

1. Generate a new value (`JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).
2. Update the environment variable wherever it's actually set for the running
   container (host `.env`, your secrets manager, etc. — see [ENVIRONMENT.md](./ENVIRONMENT.md)).
3. Restart the container (`docker compose up -d` picks up the new value).
4. **Rotating `JWT_SECRET` invalidates every existing session immediately** —
   all logged-in users are signed out. There is no dual-secret transition
   period in this app (no support for verifying against an old + new secret
   simultaneously) — plan rotation for a low-traffic window or accept the
   forced-logout blast radius.
5. `SUPER_ADMIN_PASSWORD` is only read at `db:seed` time, not at request time
   — rotating it in `.env` has no effect on an already-seeded account. Change
   the Super Admin's actual password through the app itself (or directly in
   the database) if you need to rotate a live account's credential.

### SEC-001: rotating the specific values leaked in git history

`.env.local` was committed to this repo's history (see [ENVIRONMENT.md](./ENVIRONMENT.md)'s
Git Security section) containing a `JWT_SECRET` and `SUPER_ADMIN_PASSWORD`. Those
two specific values must be treated as compromised — removing the file from the
working tree does not invalidate values already pushed to `origin`. This is a
runbook for rotating them; it is **not been executed against any live
environment by this remediation** — no production host or secrets manager was
accessible from this session, and rotation touches live credentials that only
whoever operates the actual deployment should apply.

**Step 1 — confirm exposure blast radius.**
```bash
git log --all --oneline --follow -- sampath-pathikada-platform/.env.local
```
Every commit this returns had the file in that state; anyone with read access
to this repo (or a fork/clone taken before the removal) has had access to
whatever `JWT_SECRET`/`SUPER_ADMIN_PASSWORD` values were committed there.

**Step 2 — rotate `JWT_SECRET`.**
1. Generate a fresh value: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
2. Set it as `JWT_SECRET` wherever the running container actually reads it
   from (host `.env`, secrets manager) — **never** in a file tracked by git.
3. Restart the app (`docker compose up -d`). This immediately invalidates
   every existing session (see point 4 above) — the leaked value can no
   longer sign a session that this app will accept, and any session an
   attacker may have already forged with the leaked value is invalidated too.
4. Verify: log in as an existing user afterward and confirm a session cookie
   is issued and accepted (`getSession()` round-trip) — this is the
   regression check that the new secret is actually wired up correctly, not
   just set and ignored.

**Step 3 — rotate the Super Admin password.**
`SUPER_ADMIN_PASSWORD` is only read once, at `db:seed` time — updating it in
`.env` now does nothing to an already-seeded account (see point 5 above). If
the seeded Super Admin account has ever been used in a real deployment:
1. Log in as that Super Admin with the *current* (potentially-leaked) password.
2. Change the password through the app's own account-settings flow if one
   exists, or update `User.passwordHash` directly (via `bcrypt.hash(newPassword, 12)`,
   matching `lib/auth.ts`'s `hashPassword`) if it doesn't.
3. Confirm the old password no longer authenticates (`loginWithCredentials`
   returns `{ ok: false }` for it).
4. If you cannot confirm the old password was never used against a real
   deployment, rotate it anyway — treat "unknown" as "compromised."

**Step 4 — decide on git history rewrite.**
Rotating the two values above is the priority and, once done, means the
historical commit no longer grants access to anything live — but the commit
itself still exposes that a `JWT_SECRET`/`SUPER_ADMIN_PASSWORD` of that
specific shape/pattern was used, which is still useful reconnaissance for an
attacker and worth removing if this repo is or will be shared beyond its
current trusted contributors. This is a **destructive operation requiring
your explicit go-ahead** — not performed by this remediation. If you decide
to do it:

```bash
# Option A: git filter-repo (faster, actively maintained — install via pip/brew first)
git filter-repo --path sampath-pathikada-platform/.env.local --invert-paths

# Option B: BFG Repo-Cleaner (no install of git-filter-repo needed, needs Java)
bfg --delete-files .env.local
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

**Exact risks before running either:**
- Both rewrite every commit hash from the file's first appearance onward —
  this is not a normal commit, it changes history.
- Every existing local clone (including collaborators') becomes divergent
  from the rewritten remote; they must re-clone or hard-reset to the new
  history — `git pull` will not cleanly reconcile it.
- Requires a force-push (`git push --force-with-lease origin main`) to the
  remote, which this remediation will not do without your explicit
  instruction at the time, per this repo's own git-safety rules.
- Take a full local backup of the repo (`git clone --mirror`) before running
  either tool, in case the rewrite needs to be reverted.
- Any open PRs based on the old history will likely need to be rebased or
  recreated after the rewrite.
- Do this only *after* rotation (Steps 2–3) — history cleanup without
  rotation leaves the actual credentials still valid and usable by anyone
  who already has a copy of the old history, rewrite or not.

## Incident response

### Application outage (process crashed / unresponsive)

1. `docker compose ps` — is the container running at all?
2. `docker compose logs --tail 200 app` — look for the last error before it stopped responding.
3. `docker compose restart app`.
4. If it crash-loops, check `docker compose logs -f app` during a fresh start for a startup-time failure (most likely: `JWT_SECRET` missing/too short — the app fails closed and won't start at all, by design; see `lib/jwt-secret.ts`).

### Database outage

1. `/api/health/ready` returns 503 — confirms the app sees it, not a false alarm.
2. Check the MySQL server/host directly — this is outside the app's control.
3. The app does **not** queue or buffer writes during a DB outage — requests
   that need the database will fail (500) until it's back. There is no
   circuit breaker or fallback mode in this codebase.
4. Once MySQL is back, `/api/health/ready` should self-recover on its next
   poll — no application restart needed (Prisma reconnects).

### Redis outage (rate limiting)

1. `/api/health/ready` does **not** check Redis — a Redis outage is not an
   application outage by design (see below), so it won't show up there.
   Check `docker compose logs app | grep "Redis rate-limiter connection error"`
   (or your log aggregator) for the actual signal.
2. `lib/rate-limit.ts`'s `RedisRateLimiter.check()` **fails open**: if Redis is
   unreachable or a command times out, the request is allowed through and the
   error is logged, not surfaced to the caller. This is deliberate — login,
   OTP verification, and registration all have independent backstops (account
   lockout after 5 failed logins, OTP attempt caps) that don't depend on
   Redis, so losing rate-limit coverage temporarily is preferable to taking
   down authentication because a cache is down.
3. Once Redis is back, ioredis reconnects automatically (bounded retry/backoff
   configured in `RedisRateLimiter`'s constructor) — no application restart
   needed.
4. If an outage was exploited (e.g. an unusual spike in login/registration
   attempts during the window Redis was down), check `AuditLog` and the
   `loginAttempts`/`lockedUntil` fields on affected `User` rows — those are
   independent of the rate limiter and still enforce their own limits.

### Security incident (credential compromise, suspicious admin activity)

1. Rotate `JWT_SECRET` immediately (see Secret Rotation above) — this
   invalidates every session, including the attacker's, if they obtained a
   valid session token rather than raw credentials.
2. Check `AuditLog` (queryable via `/api/audit-logs` as `SUPER_ADMIN`, or
   directly against the `audit_logs` table) for the affected account's
   recent actions — every registration approval/rejection, admin creation,
   and password reset is recorded there with `userId`/`userName`/`metadata`.
3. If a specific `User` account is compromised, set its `status` to something
   other than `ACTIVE` (or delete it, per your incident policy) — this
   immediately blocks new logins for that account (existing sessions are
   only invalidated by the `JWT_SECRET` rotation in step 1, since this app
   has no server-side session revocation list — see the Remaining Risks note
   in this doc).
4. Document what happened — there is no automated incident-tracking system
   in this repo.

### Bad deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md)'s Rollback section.

### Data corruption / accidental deletion

1. Stop writes if possible (this may mean stopping the app entirely — there's
   no maintenance-mode toggle in this codebase).
2. Restore from the most recent backup that predates the corruption (see
   [DATABASE.md](./DATABASE.md)) — accept that anything written between that
   backup and the incident is lost (this is your actual RPO, not a
   theoretical one — see Disaster Recovery below).
3. If only specific rows are affected and you can identify them precisely, a
   targeted `AuditLog`-informed manual fix may be less destructive than a
   full restore — use judgment; a full restore is the safe default when
   scope is unclear.

## Disaster Recovery — RPO / RTO

**These are stated goals based on the tooling now in this repo, not measured
guarantees** — actual RPO/RTO depend on you actually installing the backup
schedule (see [DATABASE.md](./DATABASE.md)'s systemd-timer/cron section — the
artifacts exist and are tested, but nothing in CI/Docker installs them onto a
real host automatically) and your specific infrastructure's recovery speed.

- **RPO (Recovery Point Objective)**: bounded by your backup frequency. With
  the default daily systemd timer in DATABASE.md, RPO is up to 24 hours of
  data loss in a worst-case total-loss scenario — **only once that timer is
  actually installed and enabled on your host**; until then, RPO is
  effectively unbounded (no backup exists at all). Reduce the 24h figure by
  tightening `OnCalendar=` in the timer unit if the business impact of losing
  a day's citizen submissions justifies more frequent runs.
- **RTO (Recovery Time Objective)**: dominated by (a) provisioning a working
  MySQL instance if the old one is gone entirely, (b) running
  `restore-database.sh` (a few minutes for this app's current data volume,
  scales with database size), (c) redeploying the app container pointed at
  it. **Not measured end-to-end in this remediation** — the backup/restore
  scripts themselves were verified to work correctly, but a full "how long
  does a real disaster recovery take" drill has not been run. Recommend
  doing one before you need it for real.

## Do not overengineer

This app runs as a Docker container (one or more replicas) against a single
MySQL instance, plus Redis/Valkey for shared rate-limit state (see
[DEPLOYMENT.md](./DEPLOYMENT.md)'s architecture diagram). Before adding
Kubernetes, a message queue, a service mesh, or any further shared
infrastructure, ask (per this remediation's guiding principle): what specific
problem does it solve that the current architecture can't, and does actual
traffic/scale justify the operational cost of running it?

Redis was added specifically to unblock horizontal scaling of `app` — it is
not there for caching, sessions, queues, or anything else; don't grow its
responsibilities without the same justification test above. One thing in this
codebase is still an explicit single-instance assumption and would need to
change before real horizontal scaling is safe end-to-end:

- `lib/verification-docs.ts` — local disk storage for uploaded documents (see
  [SECURITY.md](./SECURITY.md)'s file-upload section). Multiple `app`
  replicas writing to independent local disks means an upload handled by
  instance A is invisible to instance B — this must move to shared/object
  storage before running more than one replica in production.

`lib/rate-limit.ts` itself is no longer a blocker: it fails open (not closed)
if Redis is briefly unreachable, so a Redis outage degrades rate-limit
coverage rather than taking down login/registration — see the comment in
`RedisRateLimiter.check()` for the reasoning. This is a deliberate
availability-over-strictness tradeoff; revisit it only if this app's threat
model changes (e.g. brute-force resistance becomes more important than uptime
during a cache outage).

## Observability — what exists, what's still a gap

**What exists and is installable today** (added during the go-live
remediation, same "don't add infrastructure without justification" principle
as the rest of this section — no Sentry, no Prometheus, no new runtime
dependency):

- `scripts/check-error-rate.sh` + `sampath-pathikada-error-rate-check.{service,timer}` —
  greps the app's structured JSON logs (`docker logs`) every 5 minutes for
  `"level":"error"` lines; if the count exceeds `THRESHOLD` (default 10) in
  `WINDOW_MINUTES` (default 5), it logs a `journalctl`-visible error and, if
  `BACKUP_ALERT_WEBHOOK_URL` is set (same variable the backup-failure
  notifier uses — one webhook to configure, not two systems), POSTs a message
  to it. Install the same way as the backup timer — see
  [DATABASE.md](./DATABASE.md#automated-backup--systemd-timer-recommended-for-a-systemd-based-vps)
  for the systemd install pattern; swap in
  `sampath-pathikada-error-rate-check.{service,timer}`.
- **This is a log-grep, not real metrics** — it tells you "error volume is
  elevated," not latency percentiles, DB pool saturation, or CPU/memory. It's
  the cheapest thing that closes "nobody notices a 3am error spike until a
  user complains," not a replacement for a real APM if this app's traffic or
  criticality grows enough to justify one.
- **External uptime check (recommended, zero code/infra to maintain)**: point
  a free third-party pinger (UptimeRobot, healthchecks.io, Better Uptime's
  free tier, or your cloud provider's own health-check feature) at
  `https://your-domain/api/health/ready` on a 1–5 minute interval. This is
  the simplest way to get "the app/DB is down" alerting without running
  anything yourself — deliberately not built into this repo since which
  service you use is a vendor choice, not a code decision. A 503 from that
  endpoint means MySQL is unreachable (see PART 15/health-checks above); a
  connection timeout/refused means the process itself is down.

**Still a real gap, not fixed in this pass** (same reasoning as before —
this is a real infra/vendor decision, not something to bolt on
unilaterally):

- No APM / distributed tracing / request-latency percentiles.
- No CPU/memory/disk metrics collection beyond what you'd get manually via
  `docker stats` / the host's own tools.
- No dashboard — the two checks above are alert-only, not a visualized
  metrics history.
- Neither of the two scripts above is installed automatically by CI/Docker —
  same reasoning as the backup timer: something a redeploy could silently
  uninstall isn't a reliable safety net. Installing them is a one-time,
  manual host step (commands given above).
- Client-side (browser) errors are not reported anywhere server-side.

Adding any of these is a real infrastructure decision (which provider, what
it costs, what data leaves your environment) that this remediation
deliberately left for you to choose rather than picking one unilaterally —
see the earlier discussion in this repo's history about not adding external
service dependencies without an explicit decision.

## NOT VERIFIED

- Actual incident response has never been exercised against this app in a
  live environment — the procedures above are reasoned from the codebase, not
  drilled.
- Whether your hosting platform provides its own restart/process-supervision
  guarantees beyond Docker's own `restart: unless-stopped` policy (already
  set in `docker-compose.yml`).
