# Deployment

## Architecture

This app is a Next.js (App Router) process, built with `output: "standalone"`
and run as a Docker container. Rate limiting (`lib/rate-limit.ts`) is backed by
Redis/Valkey, so it is safe to run more than one `app` replica behind a load
balancer — every instance shares the same counters. The one remaining
single-instance assumption is local-disk verification-document storage; see
[OPERATIONS.md](./OPERATIONS.md) for what scaling that out would take.

MySQL and Redis are **not** containerized alongside the app for production use
— `docker-compose.yml`'s bundled `redis` service is a convenience default for
single-host deployments, not a requirement. Point `DATABASE_URL` and
`RATE_LIMIT_REDIS_URL` at wherever those actually run (managed instances, a
separate host/cluster, etc) if you scale beyond one host.

```
Internet
   │
   ▼
[reverse proxy / load balancer / TLS termination — not included in this repo]
   │
   ├──────────────┬──────────────┐
   ▼              ▼              ▼
Next.js       Next.js        Next.js       (one or more replicas,
container     container      container      port 3000 internally)
   │              │              │
   ├──────────────┴──────────────┤
   ▼                              ▼
MySQL (external)          Redis/Valkey (external — rate-limit state,
                            shared across every replica above)
```

## Prerequisites

- Docker (with Compose v2, i.e. `docker compose`, not the standalone `docker-compose` binary)
- A reachable MySQL 8.x (or MariaDB 10.4+) instance
- A reachable Redis/Valkey instance for rate limiting — `docker-compose.yml` bundles one (`redis:7-alpine`) for convenience; point `RATE_LIMIT_REDIS_URL` at a managed/external instance instead if you have one. **The app refuses to start in production without this set** (see `lib/rate-limit.ts`).
- A real `JWT_SECRET` (32+ characters — see [ENVIRONMENT.md](./ENVIRONMENT.md); the app refuses to start without one, see `lib/jwt-secret.ts`)
- A reverse proxy in front of this container for TLS — **this repo does not terminate TLS itself**. Nginx/Caddy/your cloud LB all work; see the security-headers note below for what the app already sets vs. what the proxy still needs to add.

## First deployment

1. Copy `.env.example` to `.env` and fill in real values (see [ENVIRONMENT.md](./ENVIRONMENT.md) for what every variable means and how to generate `JWT_SECRET`).
2. Run migrations against the target database **before** the first container starts serving traffic:
   ```bash
   DATABASE_URL="<your production URL>" npx prisma migrate deploy
   ```
   See [DATABASE.md](./DATABASE.md) for why `migrate deploy` (not `migrate dev`) and what to check before running it against a database with existing data.
3. Build and start:
   ```bash
   docker compose build --build-arg NEXT_PUBLIC_APP_URL=https://your-real-domain.example
   docker compose up -d
   ```
   `NEXT_PUBLIC_APP_URL` is baked into the client bundle at build time (see the comment in `Dockerfile`) — get the real domain right before building, since changing it later requires a rebuild, not just a restart.
4. Confirm the container is healthy:
   ```bash
   docker compose ps                       # STATUS should show "healthy" within ~15-45s
   curl -f http://localhost:3000/api/health/ready
   ```
5. Put your reverse proxy in front of it, terminate TLS there, and proxy to `localhost:3000` (or wherever the container's port 3000 is bound).
6. Confirm the persistent volume is real. `docker-compose.yml` defines a named volume (`verification-uploads`) for `storage/verification-uploads` — verify with `docker volume inspect sampath-pathikada-platform_verification-uploads` that it's backed by real, persistent disk on your host (not itself on ephemeral/overlay storage that vanishes on host recycling). This is where uploaded NIC/license/passport images live until an admin approves or rejects the registration.

## Subsequent deployments

```bash
git pull
docker compose build --build-arg NEXT_PUBLIC_APP_URL=https://your-real-domain.example
DATABASE_URL="<production URL>" npx prisma migrate deploy   # if there are new migrations — see DATABASE.md
docker compose up -d                                        # recreates the container with the new image
```

`docker compose up -d` on an existing stack recreates only the `app` container (new image) — the `verification-uploads` volume is untouched. There is **no zero-downtime rolling deploy** in this setup (single container, no orchestrator) — expect a few seconds of downtime while the old container stops and the new one starts and passes its health check. If that's not acceptable, you need an orchestrator (see the "do not overengineer" note in OPERATIONS.md — don't add one just because it exists, only if actual downtime SLAs require it).

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`/`develop`:

1. `npm ci` — install
2. `npm audit --audit-level=critical` — **blocks the build on new critical CVEs** (see the inline comment in the workflow for why this is critical-only, not high-only, and when to revisit that)
3. `npm run db:generate` — Prisma client generation
4. `npm run type-check`
5. `npm test`
6. `npm run build`
7. (on push only) builds and pushes a Docker image to `ghcr.io/<repo>` tagged by branch, short SHA, and `latest` (on the default branch)

**What CI does NOT do**: deploy anywhere. It stops at pushing the image to GHCR. There is no CD step, no automated rollout, no post-deploy smoke test. Deploying the pushed image to your actual host is a manual step (`docker compose pull && docker compose up -d`, or your platform's equivalent) — see Rollback below for how to control which tag you're running.

## Health checks

- `GET /api/health` — **liveness**. Always returns 200 if the Node process can respond at all. Deliberately does not touch MySQL — see the comment in `app/api/health/route.ts` for why (an orchestrator restarting the app because the *database* is briefly slow is actively harmful).
- `GET /api/health/ready` — **readiness**. Runs `SELECT 1` against MySQL; returns 503 if the database is unreachable. This is what `Dockerfile`'s `HEALTHCHECK` and `docker-compose.yml`'s `healthcheck` both use, since Docker only has one health signal (not a separate liveness/readiness split like Kubernetes) — see the comment in `Dockerfile` if this ever moves to an orchestrator that does distinguish them.

## Rollback

Every pushed image is tagged with its short git SHA (not just `latest`), so rolling back is:

```bash
docker pull ghcr.io/<owner>/<repo>:<previous-known-good-sha>
docker tag ghcr.io/<owner>/<repo>:<previous-known-good-sha> sampath-pathikada-platform:latest
docker compose up -d
```

**Database rollback is not automatic and not always safe.** If the bad deployment included a migration, rolling back the application code does *not* undo the migration — see [DATABASE.md](./DATABASE.md)'s migration-safety section before assuming a code rollback alone fixes a bad release. If in doubt, restore from a pre-deployment backup instead of attempting a schema rollback (see below).

## Backup before every deployment that includes a migration

```bash
DATABASE_URL="<production URL>" BACKUP_DIR=/var/backups/sampath-pathikada ./scripts/backup-database.sh
```

This is a manual step in this repo — there is no automated pre-deploy backup hook. See [DATABASE.md](./DATABASE.md) for the full backup/restore procedure and recommended cron schedule for *routine* (not just pre-deploy) backups.

## Security headers vs. reverse proxy responsibilities

`next.config.js` already sets `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` on every response. Your reverse proxy still needs to:

- Terminate TLS and redirect HTTP → HTTPS (the app's HSTS header only takes effect once requests are already arriving over HTTPS)
- Set a reasonable request body size limit if your proxy's default is larger than you want (the app's own upload validation caps individual files at 5MB — see `lib/verification-docs.ts` — but a proxy-level limit is still a sensible outer bound)
- Forward `X-Forwarded-For` correctly — the app reads it (falling back to `X-Real-IP`) for rate-limiting and audit-log IP fields; a misconfigured proxy that doesn't set this makes every request appear to come from the proxy's own IP, defeating per-IP rate limits

## NOT VERIFIED / requires your environment

- Actual production hosting target (VPS, cloud VM, managed container platform) — this repo only provides the Dockerfile/compose, not infrastructure-as-code for any specific provider.
- DNS, CDN, WAF — none exist in this repo.
- Whether your MySQL provider has its own automated backups (in addition to, not instead of, the scripts in this repo — see DATABASE.md).
