# ─── Deps ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
# Build-time-only values: DATABASE_URL/JWT_SECRET/RATE_LIMIT_REDIS_URL are read
# at module load by lib/db.ts, lib/jwt-secret.ts, and lib/rate-limit.ts — `next
# build` internally forces NODE_ENV=production, which would otherwise trip
# rate-limit.ts's fail-closed "no Redis URL in production" check even though
# no real Redis needs to be reachable at build time (nothing actually connects
# during `next build`, the module just needs a non-empty value to pass the
# guard). The running container gets the real secrets/URLs at deploy time.
# NEXT_PUBLIC_APP_URL, however, is baked into the static metadata
# (app/layout.tsx) and client bundle, so override it with
# --build-arg NEXT_PUBLIC_APP_URL=<real domain> once that's known.
ARG DATABASE_URL="mysql://user:password@localhost:3306/sampath_pathikada"
ARG JWT_SECRET="ci-only-secret-value-not-used-in-production-00000000"
ARG RATE_LIMIT_REDIS_URL="redis://ci-only-placeholder-not-used-in-production:6379"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3004"
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV RATE_LIMIT_REDIS_URL=$RATE_LIMIT_REDIS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p storage/verification-uploads \
  && chown -R nextjs:nodejs storage

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/lib/prisma-client ./lib/prisma-client

USER nextjs
EXPOSE 3000
ENV PORT=3000

# No curl/wget in node:alpine — use Node's own http client so we don't pull in
# extra packages just for the healthcheck. Hits /api/health/ready (not the
# liveness-only /api/health) — Docker's HEALTHCHECK is a single signal used for
# both "is this container serving value" and (in Swarm/some orchestrators)
# restart decisions, so it should reflect real DB connectivity here, unlike a
# Kubernetes liveness probe (which must stay DB-independent — use /api/health
# for that if this ever moves to k8s).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health/ready',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
