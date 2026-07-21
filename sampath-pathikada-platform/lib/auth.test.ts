import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken, type SessionPayload } from "@/lib/auth";

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
