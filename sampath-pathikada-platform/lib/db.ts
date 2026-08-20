import { PrismaClient } from "@/lib/prisma-client";

// Connection pool size/timeout are configured via DATABASE_URL query params
// (connection_limit, pool_timeout) — see .env.example and DATABASE.md for the
// sizing rationale. Without them, Prisma silently defaults to (num_cpus * 2 + 1)
// connections, which isn't checked against MySQL's max_connections and changes
// if the container's CPU allocation changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
