import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("routes info/debug to console.log and warn/error to console.error", () => {
    logger.info("info message");
    logger.debug("debug message");
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).not.toHaveBeenCalled();

    logger.warn("warn message");
    logger.error("error message");
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it("emits valid single-line JSON in production with timestamp/level/message/context", () => {
    vi.stubEnv("NODE_ENV", "production");
    logger.info("something happened", { requestId: "req-1", route: "/api/test" });

    const line = logSpy.mock.calls[0][0] as string;
    expect(() => JSON.parse(line)).not.toThrow();
    const parsed = JSON.parse(line);
    expect(parsed).toMatchObject({ level: "info", message: "something happened", requestId: "req-1", route: "/api/test" });
    expect(typeof parsed.timestamp).toBe("string");
  });

  it("serializes an Error's name/message/stack under an `error` key, in production JSON output", () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = new Error("boom");
    logger.error("operation failed", { route: "/api/test" }, err);

    const line = errorSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);
    expect(parsed.error).toMatchObject({ name: "Error", message: "boom" });
    expect(typeof parsed.error.stack).toBe("string");
  });

  it("never throws when passed a non-Error rejection value", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => logger.error("failed", {}, "a plain string rejection")).not.toThrow();
    expect(() => logger.error("failed", {}, { some: "object" })).not.toThrow();
    expect(() => logger.error("failed", {}, undefined)).not.toThrow();
  });

  it("does not crash when context is omitted", () => {
    expect(() => logger.info("no context")).not.toThrow();
    expect(() => logger.error("no context, no error")).not.toThrow();
  });
});
