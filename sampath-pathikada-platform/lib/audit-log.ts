import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";

/** Fire-and-forget audit logging. Every mutation in this app writes an audit-log row as a
 *  best-effort side record — it must never add latency to (or fail) the user-facing action it's
 *  logging. Call this instead of `await prisma.auditLog.create({ data })`; errors are caught and
 *  logged server-side rather than surfaced, since losing an audit-log row is an acceptable
 *  tradeoff for not blocking every button click on a second database round trip.
 *
 *  Safe to fire-and-forget specifically because this app runs as a long-lived Node.js process
 *  (Docker), not a serverless/edge function that could be frozen the instant the response is
 *  sent — the promise is guaranteed to run to completion. Never use this inside a
 *  `prisma.$transaction` callback — write `tx.auditLog.create(...)` and await it there instead,
 *  since detaching would break the transaction's atomicity. */
export function logAudit(data: Prisma.AuditLogUncheckedCreateInput): void {
  try {
    // Wrapped in Promise.resolve() so this tolerates a synchronous throw, a rejected promise, or
    // (in tests with an under-specified mock) a non-promise return — none of those may ever
    // propagate out of this function, since nothing calling it should have to handle a logging
    // failure.
    Promise.resolve(prisma.auditLog.create({ data })).catch((err: unknown) => {
      console.error("Failed to write audit log:", err);
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
