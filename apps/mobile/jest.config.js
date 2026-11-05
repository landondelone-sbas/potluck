module.exports = {
  preset: 'jest-expo',
  displayName: 'mobile',
  // Lets Reanimated and worklets run on the JS thread under Jest.
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: ['react-native-gesture-handler/jestSetup.js', '<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.js'],
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
