import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/jwt-secret";

const COOKIE_NAME = "sp_session";

/* ── Routes that require a valid session ─────────────────────────────────── */
const PROTECTED_PREFIXES = [
  "/super-admin",
  "/admin",
  "/economic-development-officer",
  "/assistant-director-planning",
  "/divisional-secretariat",
];

/* ── Which role may access which protected prefix ────────────────────────
   Server-side enforcement of the same role gate RoleGuard applies client-side —
   without this, a valid session for ANY role could load another role's page
   shell (data stays protected by each API route's own check regardless, but
   the UI shouldn't be reachable in the first place). */
const PREFIX_ROLES: Record<string, string> = {
  "/super-admin":                  "SUPER_ADMIN",
  "/admin":                        "ADMIN",
  "/economic-development-officer": "ECONOMIC_DEVELOPMENT_OFFICER",
  "/assistant-director-planning":  "ASSISTANT_DIRECTOR_PLANNING",
  "/divisional-secretariat":       "DIVISIONAL_SECRETARIAT",
};

/* ── Routes that logged-in users should NOT revisit ─────────────────────── */
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN:                  "/super-admin/dashboard",
  ADMIN:                        "/admin/dashboard",
  ECONOMIC_DEVELOPMENT_OFFICER: "/economic-development-officer/dashboard",
  ASSISTANT_DIRECTOR_PLANNING:  "/assistant-director-planning/dashboard",
  DIVISIONAL_SECRETARIAT:       "/divisional-secretariat/dashboard",
};

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

  /* ── If authenticated but visiting a prefix that isn't theirs → send them to
     their own dashboard, not just any protected page (e.g. a DS session
     hitting /super-admin/*) ── */
  if (isProtected && authenticated && token) {
    const matchedPrefix = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p));
    const requiredRole = matchedPrefix ? PREFIX_ROLES[matchedPrefix] : undefined;
    if (requiredRole) {
      const role = await getSessionRole(token);
      if (role !== requiredRole) {
        const dest = ROLE_DASHBOARDS[role ?? ""] ?? "/auth/login";
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
  }

  /* ── If visiting login/register while already logged in → redirect home ── */
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && authenticated && token) {
    const role = await getSessionRole(token);
    const dest = ROLE_DASHBOARDS[role ?? ""] ?? "/admin/dashboard";
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
