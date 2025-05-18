/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // Spécifier un répertoire temporaire pour les rapports de couverture
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
  // Exécuter tous les tests sans exception
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
};
