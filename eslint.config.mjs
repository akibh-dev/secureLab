import { builtinModules } from "node:module";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "test-results/**",
      ".aws/**",
      ".agents/**",
      ".codex/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: [
      "packages/**/*.{ts,tsx,js,jsx}",
      "apps/web/src/**/*.{ts,tsx,js,jsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: builtinModules,
          patterns: [
            "node:*",
            "bun",
            "bun:*",
            ...builtinModules.map((name) => name + "/*"),
          ],
        },
      ],
      "@typescript-eslint/no-require-imports": "error",
    },
  },
);
