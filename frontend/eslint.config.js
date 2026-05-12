import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    // Dependencies (never lint external packages)
    "node_modules",

    // Build outputs (generated files)
    "dist",
    "build",
    "coverage",

    // Environment variables (avoid leaking secrets)
    ".env",
    ".env.*",
    "!.env.example", // allow example env file in repo
    "!.env.test",

    // Logs (noise files)
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",

    // OS-generated files
    ".DS_Store",
    "Thumbs.db",

    // Editor config files (personal settings)
    ".vscode",
    ".idea",

    // Temporary/cache files
    "*.tmp",
    "*.cache",

    // Lock files (optional for linting — usually safe to ignore)
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ]),

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      // ONLY TS rule (fully controlled)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  js.configs.recommended,
]);
