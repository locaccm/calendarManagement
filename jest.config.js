/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // Specify directory for coverage reports
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', 'src/migrations/', 'src/index.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  // Run all tests without exception
  testPathIgnorePatterns: ['/node_modules/'],
  reporters: ['default'],
};