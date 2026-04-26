module.exports = {
  env: {
    node: true,
    es2021: true,
  },

  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint", "prettier", "import", "vitest"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],

  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
      },
    ],
    "@typescript-eslint/no-unused-vars": "warn",
  },

  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
