# ─── Deps ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
# Build-time-only values: DATABASE_URL/JWT_SECRET are read at module load by
# lib/db.ts and lib/jwt-secret.ts, but the running container gets the real
# secrets at deploy time. NEXT_PUBLIC_APP_URL, however, is baked into the
# static metadata (app/layout.tsx) and client bundle, so override it with
# --build-arg NEXT_PUBLIC_APP_URL=<real domain> once that's known.
ARG DATABASE_URL="mysql://user:password@localhost:3306/sampath_pathikada"
ARG JWT_SECRET="ci-only-secret-value-not-used-in-production-00000000"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3004"
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
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

CMD ["node", "server.js"]
