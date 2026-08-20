import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  // Vite's `import.meta.env` doesn't populate Node's `process.env`. Tests that import
  // real (unmocked) modules reading process.env directly — e.g. lib/jwt-secret.ts —
  // need .env loaded into process.env the same way `next dev`/`next build` already do.
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
