module.exports = {
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  globals: {
    before: true,
    after: true
  },
  extends: [
    'standard',
    'prettier',
    'eslint:recommended',
    'plugin:wdio/recommended'
  ],
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  plugins: ['prettier', 'wdio', 'no-only-tests'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-undef': 'off'
  }
}
