import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { verifyOrigin } from "@/lib/csrf";

describe("verifyOrigin", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3004";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  function requestWithOrigin(origin: string | null, referer?: string) {
    const headers = new Headers();
    if (origin) headers.set("origin", origin);
    if (referer) headers.set("referer", referer);
    return new NextRequest("http://localhost:3004/api/whatever", { headers });
  }

  it("accepts a matching origin", () => {
    expect(verifyOrigin(requestWithOrigin("http://localhost:3004"))).toBe(true);
  });

  it("accepts a matching referer when origin is absent", () => {
    expect(verifyOrigin(requestWithOrigin(null, "http://localhost:3004/some/page"))).toBe(true);
  });

  it("rejects a mismatched origin", () => {
    expect(verifyOrigin(requestWithOrigin("http://evil.example.com"))).toBe(false);
  });

  it("rejects a request with no origin or referer", () => {
    expect(verifyOrigin(requestWithOrigin(null))).toBe(false);
  });

  it("rejects a malformed origin header", () => {
    expect(verifyOrigin(requestWithOrigin("not-a-url"))).toBe(false);
  });
});
