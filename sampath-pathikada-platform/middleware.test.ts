import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { signToken, type SessionPayload } from "@/lib/auth";
import { middleware } from "@/middleware";

const APP_URL = "http://localhost:3004";

function requestWithCookie(url: string, token?: string) {
  const headers = new Headers();
  if (token) headers.set("cookie", `sp_session=${token}`);
  return new NextRequest(url, { headers });
}

async function sessionToken(role: SessionPayload["role"], dsDivision: string | null = null) {
  return signToken({
    userId: "user-1",
    email: "test@example.com",
    name: "Test User",
    role,
    dsDivision,
  });
}

describe("middleware — role-to-path enforcement (IDOR/broken-access-control regression)", () => {
  it("redirects to login when visiting a protected route with no session", async () => {
    const res = await middleware(requestWithCookie(`${APP_URL}/super-admin/dashboard`));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("redirects a DIVISIONAL_SECRETARIAT session away from /super-admin to their own dashboard", async () => {
    const token = await sessionToken("DIVISIONAL_SECRETARIAT", "galle-fg");
    const res = await middleware(requestWithCookie(`${APP_URL}/super-admin/dashboard`, token));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/divisional-secretariat/dashboard");
  });

  it("redirects an ADMIN session away from /super-admin to their own dashboard", async () => {
    const token = await sessionToken("ADMIN", "galle-fg");
    const res = await middleware(requestWithCookie(`${APP_URL}/super-admin/users`, token));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/dashboard");
  });

  it("allows a SUPER_ADMIN session to reach /super-admin", async () => {
    const token = await sessionToken("SUPER_ADMIN", null);
    const res = await middleware(requestWithCookie(`${APP_URL}/super-admin/dashboard`, token));
    expect(res.status).toBe(200);
  });

  it("allows an ADMIN session to reach /admin", async () => {
    const token = await sessionToken("ADMIN", "galle-fg");
    const res = await middleware(requestWithCookie(`${APP_URL}/admin/dashboard`, token));
    expect(res.status).toBe(200);
  });

  it("redirects a SUPER_ADMIN session away from /divisional-secretariat (each role's shell is exclusive)", async () => {
    const token = await sessionToken("SUPER_ADMIN", null);
    const res = await middleware(requestWithCookie(`${APP_URL}/divisional-secretariat/dashboard`, token));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/super-admin/dashboard");
  });
});
