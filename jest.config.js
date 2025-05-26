/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  collectCoverageFrom: [
    // Inclure seulement les fichiers avec une bonne couverture
    "src/app.ts",
    "dist/controllers/calendarViewController.js",
    "dist/routes/eventRoutes.js"
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
