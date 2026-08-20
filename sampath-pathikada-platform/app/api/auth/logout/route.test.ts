import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

const { POST } = await import("@/app/api/auth/logout/route");

const APP_URL = "http://localhost:3004";

function logoutRequest(origin: string | null = APP_URL, cookie?: string) {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(`${APP_URL}/api/auth/logout`, { method: "POST", headers });
}

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  it("rejects a mismatched origin (CSRF)", async () => {
    const res = await POST(logoutRequest("http://evil.example.com"));
    expect(res.status).toBe(403);
  });

  it("rejects a request with no origin/referer", async () => {
    const res = await POST(logoutRequest(null));
    expect(res.status).toBe(403);
  });

  it("succeeds for an authenticated request and clears the session cookie", async () => {
    const res = await POST(logoutRequest(APP_URL, `${COOKIE_NAME}=some.jwt.token`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${COOKIE_NAME}=`);
    expect(setCookie).toMatch(/max-age=0/i);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("succeeds even when no session cookie was present (idempotent / already logged out)", async () => {
    const res = await POST(logoutRequest(APP_URL));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/max-age=0/i);
  });

  it("does not accept GET (no handler exported for it)", async () => {
    const routeModule: Record<string, unknown> = await import("@/app/api/auth/logout/route");
    expect(routeModule.GET).toBeUndefined();
  });
});
