module.exports = {
  ignorePatterns: ['**/*.ts'],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'arrow-body-style': [0],
    'consistent-return': 0,
  },
};
