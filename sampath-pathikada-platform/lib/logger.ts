/** Structured server-side logging. Writes single-line JSON to stdout/stderr in
 *  production (so any log aggregator — CloudWatch, Loki, `docker logs | jq`, etc. —
 *  can parse it without extra config), and a readable one-liner in development.
 *
 *  This deliberately does NOT add a logging library (pino/winston) or any external
 *  service — the app runs as a single long-lived Node process (see Dockerfile),
 *  and stdout/stderr is already captured by `docker logs` / journald / the
 *  hosting platform. A library becomes worth it only once log volume or
 *  multi-transport routing actually requires it.
 *
 *  Never pass password/token/secret/cookie values into `context` — they are not
 *  redacted automatically. */

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  userId?: string;
  [key: string]: unknown;
}

function serializeError(err: unknown): { message: string; stack?: string; name?: string } {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      // Stack traces are useful server-side (this never reaches an API response
      // body — see lib/api-error.ts) but are still verbose; only keep them for
      // warn/error level output, which the caller controls by log level anyway.
      stack: err.stack,
    };
  }
  return { message: typeof err === "string" ? err : JSON.stringify(err) };
}

function write(level: LogLevel, message: string, context?: LogContext, err?: unknown) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...(err !== undefined ? { error: serializeError(err) } : {}),
  };

  const line = process.env.NODE_ENV === "production"
    ? JSON.stringify(entry)
    : `[${entry.timestamp}] ${level.toUpperCase()} ${message}${context ? " " + JSON.stringify(context) : ""}${err ? "\n" + (err instanceof Error ? err.stack : String(err)) : ""}`;

  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext, err?: unknown) => write("warn", message, context, err),
  error: (message: string, context?: LogContext, err?: unknown) => write("error", message, context, err),
};
