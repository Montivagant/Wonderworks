module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@next/next/no-img-element': 'warn',
    'react/no-unescaped-entities': 'warn',
  },
}; 