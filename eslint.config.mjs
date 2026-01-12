import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

const eslintConfig = defineConfig([
  globalIgnores([
    "dist/**",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs["recommended"],
  {
    rules: {
      "eqeqeq": "error",
      "@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true }],
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
      "@stylistic/indent": ["warn", 2],
      "@stylistic/brace-style": ["warn", "1tbs"],
      "@stylistic/jsx-indent-props": ["warn", 2],
      "@stylistic/jsx-one-expression-per-line": "off",
      "@stylistic/member-delimiter-style": [
        "warn",
        {
          multiline: {
            delimiter: "semi",
            requireLast: true,
          },
          singleline: {
            delimiter: "semi",
            requireLast: false,
          },
          multilineDetection: "brackets",
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);

export default eslintConfig;
