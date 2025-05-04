/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
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
};
