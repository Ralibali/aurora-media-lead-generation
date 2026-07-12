import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      // Historical visual concepts are kept for reference but are not shipped as maintained product code.
      "src/pages/_versions/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // shadcn-generated component aliases intentionally mirror upstream's empty interfaces.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    // Legacy admin/form boundaries receive untyped JSON from Edge Functions. Keep the
    // exception local until those response contracts are migrated to shared schemas.
    files: [
      "src/components/AuroraContactForm.tsx",
      "src/pages/admin/TextGenerator.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // This Edge Function deliberately parses JSON fences and strips control characters.
    files: ["supabase/functions/generate-text/index.ts"],
    rules: {
      "no-useless-escape": "off",
      "no-control-regex": "off",
    },
  },
  {
    // Tailwind's plugin ecosystem still exposes CommonJS-compatible plugin entry points.
    files: ["tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
