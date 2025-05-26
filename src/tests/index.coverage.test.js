// Tests pour améliorer la couverture de code de index.js

// Mock des dépendances
jest.mock('../app', () => ({
  default: {
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return { on: jest.fn() };
    }),
  },
}));

jest.mock('../data-source', () => ({
  AppDataSource: {
    initialize: jest.fn(),
  },
}));

describe('Server Initialization', () => {
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    // Mock des fonctions console
    console.log = jest.fn();
    console.error = jest.fn();

    // Réinitialiser les mocks
    const { AppDataSource } = require('../data-source');
    AppDataSource.initialize.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should initialize the database successfully', () => {
    // Configurer le mock pour simuler une initialisation réussie
    const { AppDataSource } = require('../data-source');
    AppDataSource.initialize.mockResolvedValue({});

    // Définir le port
    process.env.PORT = '3000';

    // Importer le module index en utilisant require au lieu de import
    jest.isolateModules(() => {
      require('../index');
    });

    // Vérifier que la base de données a été initialisée
    expect(AppDataSource.initialize).toHaveBeenCalled();
  });

  it('should handle database initialization errors', () => {
    // Configurer le mock pour simuler une erreur d'initialisation
    const { AppDataSource } = require('../data-source');
    const error = new Error('Database connection error');
    AppDataSource.initialize.mockRejectedValue(error);

    // Importer le module index en utilisant require au lieu de import
    jest.isolateModules(() => {
      require('../index');
    });

    // Vérifier que l'erreur a été journalisée
    expect(console.error).toHaveBeenCalled();
  });
});
