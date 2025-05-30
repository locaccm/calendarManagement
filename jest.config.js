/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.test.{js,ts}",
    "!src/**/__tests__/**",
    "!src/**/index.{js,ts}",
    "!src/app.ts",
    "!src/routes/eventRoutes.ts"
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 50,
      lines: 75
    }
  }
};
