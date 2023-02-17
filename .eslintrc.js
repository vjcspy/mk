module.exports = {
  // Configuration for JavaScript files
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
      extends: ['airbnb-typescript/base', 'plugin:prettier/recommended'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
          },
        ],
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
            '': 'never',
          },
        ], // Avoid missing file extension errors when using '@/' alias
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'class-methods-use-this': 'off',
        '@typescript-eslint/dot-notation': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'consistent-return': 'off',
        'no-await-in-loop': 'off',
        'no-plusplus': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    // Configuration for testing
    {
      files: ['**/*.test.ts'],
      plugins: ['jest', 'jest-formatting'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest-formatting/recommended',
      ],
      rules: {
        'jest/no-mocks-import': 'off',
      },
    },
  ],
};
