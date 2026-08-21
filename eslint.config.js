import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/drizzle/**', '**/.vite/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: 'apps/web/tsconfig.app.json' },
      },
      'boundaries/include': ['apps/web/src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/web/src/app/**/*' },
        { type: 'pages', pattern: 'apps/web/src/pages/**/*' },
        { type: 'widgets', pattern: 'apps/web/src/widgets/**/*' },
        { type: 'features', pattern: 'apps/web/src/features/**/*' },
        { type: 'entities', pattern: 'apps/web/src/entities/**/*' },
        { type: 'shared', pattern: 'apps/web/src/shared/**/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] },
            { from: 'pages', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
            { from: 'widgets', allow: ['widgets', 'features', 'entities', 'shared'] },
            { from: 'features', allow: ['features', 'entities', 'shared'] },
            { from: 'entities', allow: ['entities', 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
  },
);
