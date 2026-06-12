import { createRequire } from 'node:module';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const banner = `/**
 * ${pkg.name} v${pkg.version}
 *
 * Copyright (c) 2026 Preston Neal.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @license MIT
 */
 `;

const sharedConfig = {
  external: [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'prop-types',
    'plaid',
    '@remix-run/node',
    '@remix-run/react',
    'react-plaid-link'
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx']
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx']
    })
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  },
};

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    ...sharedConfig,
    onwarn(warning, warn) {
      // Skip certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;

      // Use default warning for everything else
      warn(warning);
    },
    input: {
      'node/index': 'src/node/index.js',
      'react/index': 'src/react/index.js'
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        interop: 'auto',
        banner,
        exports: 'named'
      },
      {
        dir: 'dist/es',
        format: 'es',
        preserveModules: true,
        banner
      }
    ]
  }
];
