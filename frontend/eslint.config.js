import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // ── Ignore patterns ────────────────────────────────────────────────────────
  {
    ignores: [
      "**/dist/**",
      "node_modules/**",
      "scripts/**",
      "*.py",
      "vite.config.ts",
      "postcss.config.mjs",
    ],
  },

  // ── Base JS recommended ────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript + React source files ───────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // ── TypeScript ─────────────────────────────────────────────────────
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // ── React ──────────────────────────────────────────────────────────
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",  // Not needed in React 17+
      "react/prop-types": "off",          // TypeScript handles this
      "react/display-name": "warn",

      // ── React Hooks ────────────────────────────────────────────────────
      "react-hooks/rules-of-hooks": "error",   // Catch invalid hook calls
      "react-hooks/exhaustive-deps": "warn",   // Catch missing useEffect deps
      // Note: new strict rules in react-hooks v7 are disabled below
      // because they flag valid patterns in shadcn/ui components
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",

      // ── React Refresh (Vite HMR) ───────────────────────────────────────
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ── General ────────────────────────────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // TypeScript's compiler handles undefined variable checks better than
      // ESLint's no-undef rule, which causes false positives in .tsx files
      "no-undef": "off",
    },
  },

  // ── Prettier (must be last — disables conflicting formatting rules) ────────
  prettierConfig,
];
