/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // Specify a temporary directory for coverage reports
  coverageDirectory: './tmp/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/migrations/',
    'src/index.ts',
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  // Run all tests without exception
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
};
