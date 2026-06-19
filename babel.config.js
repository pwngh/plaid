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
    'pure-annotations'
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        loose: true,
        include: [
          '@babel/plugin-transform-optional-chaining',
          '@babel/plugin-transform-nullish-coalescing-operator',
          '@babel/plugin-transform-optional-catch-binding'
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
