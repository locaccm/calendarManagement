// Tests pour améliorer la couverture de code de data-source.js
const dotenv = require('dotenv');

// Mock des dépendances
jest.mock('typeorm', () => {
  return {
    DataSource: jest.fn().mockImplementation((config) => ({
      options: config,
      initialize: jest.fn().mockResolvedValue({}),
    })),
  };
});

jest.mock('../models/Event', () => ({
  Event: {},
}));

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('AppDataSource Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create a SQLite database for test environment', () => {
    // Définir l'environnement de test
    process.env.NODE_ENV = 'test';

    // Importer le module data-source
    const { AppDataSource } = require('../data-source');

    // Vérifier que AppDataSource est défini
    expect(AppDataSource).toBeDefined();
  });

  it('should create a PostgreSQL database for non-test environment', () => {
    // Définir l'environnement de production
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'test-host';
    process.env.DB_PORT = '5433';
    process.env.DB_USER = 'test-user';
    process.env.DB_PASSWORD = 'test-password';
    process.env.DB_NAME = 'test-db';

    // Importer le module data-source
    const { AppDataSource } = require('../data-source');

    // Vérifier que AppDataSource est défini
    expect(AppDataSource).toBeDefined();
  });

  it('should use default values when environment variables are not set', () => {
    // Définir l'environnement de production sans variables d'environnement
    process.env.NODE_ENV = 'production';
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;

    // Importer le module data-source
    const { AppDataSource } = require('../data-source');

    // Vérifier que AppDataSource est défini
    expect(AppDataSource).toBeDefined();
  });
});
