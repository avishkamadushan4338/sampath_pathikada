import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken, signResetToken, verifyResetToken, type SessionPayload } from "@/lib/auth";

describe("hashPassword / verifyPassword", () => {
  it("round-trips a correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("signToken / verifyToken", () => {
  const payload: SessionPayload = {
    userId: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "ADMIN",
    dsDivision: "galle-fg",
  };

  it("round-trips a signed token", async () => {
    const token = await signToken(payload);
    const verified = await verifyToken(token);
    expect(verified).toMatchObject(payload);
  });

  it("rejects a tampered token", async () => {
    const token = await signToken(payload);
    const tampered = token.slice(0, -4) + "abcd";
    expect(await verifyToken(tampered)).toBeNull();
  });

  it("rejects garbage input", async () => {
    expect(await verifyToken("not-a-real-token")).toBeNull();
  });
});

describe("signResetToken / verifyResetToken", () => {
  it("round-trips a signed reset token, exposing email and jti", async () => {
    const { token, jti } = await signResetToken("reset-me@example.com");
    const payload = await verifyResetToken(token);
    expect(payload).toEqual({ email: "reset-me@example.com", jti });
  });

  it("mints a unique jti per call, even for the same email", async () => {
    const first = await signResetToken("reset-me@example.com");
    const second = await signResetToken("reset-me@example.com");
    expect(first.jti).not.toBe(second.jti);
    expect(first.token).not.toBe(second.token);
  });

  it("rejects a tampered reset token", async () => {
    const { token } = await signResetToken("reset-me@example.com");
    const tampered = token.slice(0, -4) + "abcd";
    expect(await verifyResetToken(tampered)).toBeNull();
  });

  it("rejects garbage input", async () => {
    expect(await verifyResetToken("not-a-real-token")).toBeNull();
  });

  it("rejects a session token presented as a reset token (wrong purpose)", async () => {
    const sessionToken = await signToken({
      userId: "user-1",
      email: "reset-me@example.com",
      name: "Test User",
      role: "ADMIN",
      dsDivision: null,
    });
    expect(await verifyResetToken(sessionToken)).toBeNull();
  });

  it("rejects a reset-purpose token missing the jti claim", async () => {
    const { SignJWT } = await import("jose");
    const { JWT_SECRET } = await import("@/lib/jwt-secret");
    const noJti = await new SignJWT({ email: "reset-me@example.com", purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(JWT_SECRET);
    expect(await verifyResetToken(noJti)).toBeNull();
  });
});
