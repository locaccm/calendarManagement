module.exports = [
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      camelcase: ['error', { properties: 'always' }],
      'prettier/prettier': 'error',
    },
  },
];
