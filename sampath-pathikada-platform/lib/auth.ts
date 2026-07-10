import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { JWT_SECRET } from "@/lib/jwt-secret";

export const COOKIE_NAME     = "sp_session";
export const SESSION_DURATION = 60 * 60 * 8; // 8 hours

export interface SessionPayload {
  userId:     string;
  email:      string;
  name:       string;
  role:       string;  // matches UserRole enum values
  dsDivision: string | null; // Divisional Secretariat's own DS division, used to scope reviewer access
}

// ─── JWT helpers ──────────────────────────────────────────────────────────────

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Password helpers ─────────────────────────────────────────────────────────

export const hashPassword   = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ─── DB-backed login ──────────────────────────────────────────────────────────

export interface LoginResult {
  ok:         boolean;
  message?:   string;
  token?:     string;
  redirectTo?: string;
  pending?:   boolean;
}

export async function loginWithCredentials(
  email: string,
  password: string,
  ip?: string
): Promise<LoginResult> {
  const emailLower = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailLower } });

  if (!user) {
    // No user account yet — check whether this email belongs to a registration
    // that's still awaiting Super Admin review. Only reveal that state once the
    // submitted password is verified against the registration, so an attacker
    // guessing emails can't use this to enumerate pending applicants.
    const [gnReg, dsReg] = await Promise.all([
      prisma.economicDevelopmentOfficerRegistration.findFirst({
        where: { email: emailLower, status: "PENDING" },
        select: { passwordHash: true },
      }),
      prisma.divisionalSecretariatRegistration.findFirst({
        where: { email: emailLower, status: "PENDING" },
        select: { passwordHash: true },
      }),
    ]);
    const pendingReg = gnReg ?? dsReg;

    if (pendingReg && await verifyPassword(password, pendingReg.passwordHash)) {
      return {
        ok: false,
        pending: true,
        message: "Your registration is still under review by a Super Admin. You'll be able to sign in once it's approved.",
      };
    }

    return { ok: false, message: "Invalid email or password." };
  }

  // Check suspension / lock
  if (user.status === "SUSPENDED") {
    return { ok: false, message: "This account has been suspended. Contact the administrator." };
  }
  if (user.status === "INACTIVE") {
    return { ok: false, message: "This account is inactive." };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, message: `Account is locked. Try again in ${mins} minute(s).` };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  if (!passwordOk) {
    const attempts = user.loginAttempts + 1;
    const MAX = 5;
    const lockedUntil = attempts >= MAX
      ? new Date(Date.now() + 15 * 60 * 1000)
      : null;

    await prisma.user.update({
      where: { id: user.id },
      data:  { loginAttempts: attempts, lockedUntil },
    });

    await prisma.auditLog.create({
      data: {
        action:      "Failed Login",
        description: `Failed login attempt for ${email} (attempt ${attempts}/${MAX})`,
        category:    "AUTH",
        severity:    attempts >= MAX ? "WARNING" : "INFO",
        userId:      null,
        userName:    "Unknown",
        userIp:      ip ?? null,
      },
    });

    return { ok: false, message: "Invalid email or password." };
  }

  // Reset login attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: 0,
      lockedUntil:   null,
      lastLoginAt:   new Date(),
      lastLoginIp:   ip ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action:      "User Login",
      description: `Successful login: ${user.name} (${user.email})`,
      category:    "AUTH",
      severity:    "SUCCESS",
      userId:      user.id,
      userName:    user.name,
      userIp:      ip ?? null,
    },
  });

  const token = await signToken({
    userId:     user.id,
    email:      user.email,
    name:       user.name,
    role:       user.role,
    dsDivision: user.dsDivision,
  });

  const roleRedirects: Record<string, string> = {
    SUPER_ADMIN:                  "/super-admin/dashboard",
    ADMIN:                        "/admin/dashboard",
    ECONOMIC_DEVELOPMENT_OFFICER: "/economic-development-officer/dashboard",
    DIVISIONAL_SECRETARIAT:       "/divisional-secretariat/dashboard",
  };

  return {
    ok:         true,
    token,
    redirectTo: roleRedirects[user.role] ?? "/dashboard",
  };
}
