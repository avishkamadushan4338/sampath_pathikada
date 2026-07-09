import type { NextRequest } from "next/server";

// Same-origin check for state-changing requests. Defense-in-depth alongside
// the sameSite=lax session cookie — protects against any future cookie
// downgrade (sameSite=none) or subdomain-based attack that lax alone wouldn't catch.
export function verifyOrigin(req: NextRequest): boolean {
  const source = req.headers.get("origin") ?? req.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!source || !appUrl) return false;

  try {
    return new URL(source).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
