# Sampath Pathikada Platform

A divisional-secretariat data-collection and review portal: officers submit a
15-section census/socioeconomic form for their GN division, which moves
through a two-stage review pipeline (Assistant Director Planning →
Divisional Secretariat) before being published as an official division
profile. Also handles account self-registration/approval for four field
roles, and a Super Admin console for user/system management.

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript (strict-ish) ·
Prisma 6 · MySQL · Tailwind CSS v4 · Vitest.

## Documentation

| Doc | Covers |
|---|---|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Docker/Compose deployment, CI/CD pipeline, rollback |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Every environment variable, what it does, how to generate secrets |
| [DATABASE.md](./DATABASE.md) | Schema, migrations, connection pooling, backup/restore |
| [SECURITY.md](./SECURITY.md) | Auth/authz model, IDOR-prevention pattern, CSP, file upload hardening |
| [OPERATIONS.md](./OPERATIONS.md) | Runbook: restart, incident response, disaster recovery, known observability gaps |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Symptom → cause → fix reference |

## Local development

```bash
npm install
cp .env.example .env.local          # fill in real values — see ENVIRONMENT.md
npm run db:generate                  # generate the Prisma client
npm run db:migrate                   # apply migrations to your local MySQL
npm run db:seed                      # bootstraps the Super Admin account (SUPER_ADMIN_EMAIL/PASSWORD from .env)
npm run dev                          # http://localhost:3004
```

Requires Node ≥20, npm ≥10, and a reachable MySQL (8.x) or MariaDB (10.4+)
instance — see `.env.example` for the `DATABASE_URL` format.

### Common scripts

```bash
npm run type-check    # tsc --noEmit
npm run lint           # ESLint (Next.js core-web-vitals + TypeScript + Tailwind rules)
npm test               # vitest run — 569 tests as of this writing
npm run build           # production build
npm run db:studio      # Prisma Studio — browse the local database
```

## Testing

`npm test` runs the full Vitest suite — API route handlers, auth/session
logic, CSRF, rate limiting, review-scope authorization, section validators,
and the structured logger, all with mocked Prisma (no live database
required to run tests). Every security fix made during the most recent
production-readiness remediation has a dedicated regression test — see
[SECURITY.md](./SECURITY.md#regression-tests-for-every-fixed-vulnerability).

There are no end-to-end/browser tests currently wired up (Playwright is a
listed devDependency but has no config or spec files in this repo — either
adopt it properly or remove the unused dependency; not resolved as part of
this remediation).

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full procedure. Short version:

```bash
docker compose build --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.example
DATABASE_URL="<prod url>" npx prisma migrate deploy
docker compose up -d
curl -f http://localhost:3000/api/health/ready
```

## Known limitations (by design, documented — not oversights)

- **Verification-document storage is single-instance only.**
  `lib/verification-docs.ts` writes to local container disk, so multiple `app`
  replicas would each see a different, incomplete set of uploads. The rate
  limiter (`lib/rate-limit.ts`) is Redis-backed in production and does *not*
  have this limitation — see
  [OPERATIONS.md](./OPERATIONS.md#do-not-overengineer) for what would need to
  change (object storage) before running more than one replica.
- **No APM/error-tracking service.** Structured JSON logs go to stdout; a
  lightweight error-rate log check (`scripts/check-error-rate.sh`) and the
  option of a free external uptime pinger against `/api/health/ready` cover
  the "did something break" signal without a new vendor dependency — no
  latency/metrics dashboard exists. See [OPERATIONS.md](./OPERATIONS.md#observability--what-exists-what-still-a-gap).
- **Backup/error-rate checks are installable, not auto-installed.**
  `scripts/backup-database.sh` and `scripts/check-error-rate.sh` are tested
  and ship with ready-to-use systemd timer units
  (`scripts/sampath-pathikada-*.{service,timer}`), but nothing in CI/Docker
  installs them onto a real host automatically — that's a deliberate
  one-time manual step (a redeploy silently uninstalling your backup
  schedule would be worse than requiring an explicit install). See
  [DATABASE.md](./DATABASE.md#automated-backup--systemd-timer-recommended-for-a-systemd-based-vps)
  for install steps.
