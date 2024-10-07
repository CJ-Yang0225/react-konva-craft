import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";

export default ts.config(
  { ignores: ["dist"] },
  {
    extends: [
      // add eslint built-in
      js.configs.recommended,
      // add `typescript-eslint` flat config simply
      // if you would like use more another configuration,
      // see the section: https://typescript-eslint.io/getting-started#details
      ...ts.configs.recommended,
      ...tailwind.configs["flat/recommended"],
    ],
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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "tailwindcss/no-custom-classname": "off",
    },
  },
);
