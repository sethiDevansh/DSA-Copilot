module.exports = {
  root: true,
  env:  { browser: true, es2022: true, webextensions: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType:  'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // React
    'react/react-in-jsx-scope':  'off',   // Not needed with React 17+
    'react/prop-types':          'off',   // We use JSDoc for docs, not PropTypes
    'react/display-name':        'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // General
    'no-console':    ['warn', { allow: ['warn', 'error', 'log'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-debugger':   'warn',
    'prefer-const':  'warn',
    'no-var':        'error',

    // Style (non-blocking)
    'eqeqeq':        ['warn', 'always', { null: 'ignore' }],
    'curly':         ['warn', 'multi-line'],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.min.js'],
};
