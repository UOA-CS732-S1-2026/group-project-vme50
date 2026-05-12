import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import vitestPlugin from "eslint-plugin-vitest";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    // dependencies
    "node_modules",

    // build outputs
    "dist",
    "build",
    "coverage",

    // env files
    ".env",
    ".env.*",
    "!.env.example",
    "!.env.test",

    // logs
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",

    // OS files
    ".DS_Store",
    "Thumbs.db",

    // editor files
    ".vscode",
    ".idea",

    // generated / misc
    "*.log",
    "*.tmp",
    "*.cache",

    // lock files (optional — usually NOT ignored in git, but ok for linting)
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ]),

  js.configs.recommended,

  {
    files: ["**/*.{ts,js}"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier,
      import: importPlugin,
      vitest: vitestPlugin,
    },

    rules: {
      // Prettier
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
        },
      ],

      // IMPORTANT: disable base rule completely
      "no-unused-vars": "off",

      // ONLY TS rule (fully controlled)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // optional cleanup
      "import/order": "warn",
      "vitest/no-focused-tests": "warn",
    },
  },
]);
