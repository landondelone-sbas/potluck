const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

// Formatting is Prettier's job (`npm run format:check`); eslint-config-prettier switches off the
// ESLint rules that would fight it.
module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // Lint runs from the repo root, so tell the import resolver where the app's `@/` alias lives.
    files: ['apps/mobile/**/*.{ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: { project: 'apps/mobile/tsconfig.json' },
      },
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.expo/**', 'coverage/**', 'prototype/**'],
  },
]);
