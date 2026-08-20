import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tailwind from "eslint-plugin-tailwindcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

// eslint-config-next still ships an .eslintrc-style config, not a native flat
// config — FlatCompat is the officially documented bridge for ESLint 9.
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "lib/prisma-client/**",
      "storage/**",
      "public/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...tailwind.configs["flat/recommended"] ?? [tailwind.configs.recommended],
  {
    settings: {
      // Tailwind v4 is configured CSS-first (no tailwind.config.js) — point the
      // plugin at the actual @import "tailwindcss" entry file instead of its
      // "src/style.css" default, which doesn't exist in this repo.
      tailwindcss: {
        cssConfigPath: "app/globals.css",
      },
    },
    rules: {
      // This codebase intentionally keeps a small number of `any` escapes at
      // Prisma <-> registration-table boundaries (see lib/registrations.ts) —
      // downgraded to a warning rather than disabled outright, so genuinely
      // new `any` usage is still visible in review without failing CI.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
