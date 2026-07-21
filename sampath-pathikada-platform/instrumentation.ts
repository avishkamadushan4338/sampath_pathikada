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
}
