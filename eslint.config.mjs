import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },
  {
    files: ["*.config.mjs", "*.config.js"],
    languageOptions: { globals: { process: "readonly" } },
  },
  {
    ignores: ["**/node_modules/", ".next/", "out/", "prisma/migrations/", "next-env.d.ts"],
  },
);
