module.exports = {
  displayName: 'engine',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2022', parser: { syntax: 'typescript' } } }],
  },
  testMatch: ['<rootDir>/test/**/*.test.ts'],
};
