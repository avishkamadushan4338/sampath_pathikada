import { NextRequest } from "next/server";

/** Reuses an incoming x-request-id if a reverse proxy already set one (Nginx/ALB/etc
 *  commonly do), otherwise mints a fresh one. Kept as a single source of truth so a
 *  log line and the response it corresponds to can always be correlated. */
export function getRequestId(req: NextRequest): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}
