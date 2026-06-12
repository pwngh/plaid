module.exports = {
  targets: 'defaults',
  assumptions: {
    constantReexports: true,
    ignoreFunctionLength: true,
    ignoreToPrimitiveHint: true,
    iterableIsArray: true,
    noDocumentAll: true,
    noIncompleteNsImportDetection: true,
    noNewArrows: true,
    objectRestNoSymbols: true,
    pureGetters: true,
    setComputedProperties: true,
    setSpreadProperties: true,
    skipForOfIteratorClosing: true
  },
  plugins: [
    'pure-annotations',
    ['transform-react-remove-prop-types', {
      mode: 'remove'
    }]
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        loose: true,
        include: [
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator',
          '@babel/plugin-proposal-optional-catch-binding'
        ],
        exclude: ['@babel/plugin-transform-typeof-symbol'],
        modules: false
      }
    ],
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: false,
      importSource: 'react'
    }]
  ]
};
