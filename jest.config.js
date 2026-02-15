module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
