import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import { defineConfig, globalIgnores } from "eslint/config";

/*
 * One config for the whole repo, rather than a copy of the eslint toolchain in
 * each app. The two halves share the type-aware TypeScript rules — including
 * the `prefer-nullish-coalescing` and `no-explicit-any` rules CLAUDE.md relies
 * on — and differ only in the environment they run in and the React rules,
 * which apply to the frontend alone.
 *
 * `projectService` resolves each file against its own tsconfig, so
 * frontend/tsconfig.app.json and backend/tsconfig.json are both honoured.
 */
export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/coverage/**",
    "**/node_modules/**",
    "frontend/.vite/**",
    "frontend/e2e/**",
    "frontend/playwright-report/**",
    "frontend/test-results/**",
    "frontend/src/routeTree.gen.ts",
    "backend/drizzle/**",
  ]),

  // Shared baseline: every TypeScript file in either app.
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Frontend: browser globals, JSX, React rules.
  {
    files: ["frontend/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },

  {
    // TanStack's file-based routes export a `Route` object alongside the page
    // component by design — that is the router's contract, not a refresh bug.
    files: ["frontend/src/routes/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  // Backend: Node globals, no React.
  {
    files: ["backend/**/*.ts"],
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
    },
  },

  // Config files and build scripts in either app run under Node.
  {
    files: [
      "**/vite.config.*",
      "**/vitest.config.*",
      "**/eslint.config.*",
      "**/playwright.config.*",
      "**/drizzle.config.*",
      "**/i18next.config.*",
      "**/scripts/**/*.{ts,js,mjs}",
    ],
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
    },
  },
]);
