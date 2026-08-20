export async function register() {
  // Next.js runs this before any page module loads.
  // The Claude Code extension injects --localstorage-file which leaves
  // localStorage as a broken object (not undefined) in the Node process.
  // Patch it to a safe no-op so SSR doesn't crash.
  if (typeof globalThis.localStorage !== "undefined") {
    const store: Record<string, string> = {};
    (globalThis as Record<string, unknown>).localStorage = {
      getItem:    (k: string) => store[k] ?? null,
      setItem:    (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
      key:        (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  }

  // NOTE on graceful shutdown: no SIGTERM/SIGINT handling is added here
  // deliberately. Next.js's own standalone server.js already registers both
  // (see next/dist/server/lib/start-server.js) and does the correct thing:
  // stop accepting new connections, let in-flight requests finish, close the
  // HTTP server, then exit. There is no supported production hook to run
  // application cleanup (e.g. prisma.$disconnect()) sequenced after that —
  // the dev-server-only `cleanupListeners` hook Next exposes internally does
  // not exist in standalone/production mode. A second independent
  // process.on("SIGTERM", ...) listener would race Next's own process.exit(0)
  // rather than reliably run before it. This is an accepted gap: TCP
  // connections are torn down by the OS on process exit regardless, so the
  // practical impact of skipping an explicit disconnect is negligible for a
  // single-instance deployment that's normally shut down via SIGTERM.
}
