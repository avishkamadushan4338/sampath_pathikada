import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "sampath-pathikada-super-secret-key-2026-change-in-production"
);
const COOKIE_NAME = "sp_session";

/* ── Routes that require a valid session ─────────────────────────────────── */
const PROTECTED_PREFIXES = [
  "/super-admin",
  "/admin",
  "/economic-development-officer",
  "/regional-secretary",
];

/* ── Routes that logged-in users should NOT revisit ─────────────────────── */
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function getSessionRole(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload as any).role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = await isValidSession(token);

  /* ── If visiting a protected route without a session → redirect to login ── */
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !authenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* ── If visiting login/register while already logged in → redirect home ── */
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && authenticated && token) {
    const role = await getSessionRole(token);
    const dest = role === "super-admin" ? "/super-admin/dashboard" : "/admin/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Match all paths except:
      - _next/static  (Next.js static assets)
      - _next/image   (Next.js image optimization)
      - favicon.ico
      - public files (png, svg, jpg, etc.)
      - API routes (handled by route handlers)
    */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$|api/).*)",
  ],
};
