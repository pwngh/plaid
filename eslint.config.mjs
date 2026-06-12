// @ts-check

import eslint from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactHooksAddons from 'eslint-plugin-react-hooks-addons';

export default [
  eslint.configs.recommended,
  prettier,
  react.configs.flat.recommended,
  {
    ignores: ['**/dist/', '**/types/', '**/coverage/', '**/example/']
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Intl: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    plugins: {
      react,
      // @ts-ignore
      ['react-hooks']: fixupPluginRules(reactHooks),
      ['react-hooks-addons']: fixupPluginRules(reactHooksAddons)
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_\\d?$'
        }
      ],
      'react/react-in-jsx-scope': 0,
      'react/prop-types': 0,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks-addons/no-unused-deps': 'error'
    }
  }
];
