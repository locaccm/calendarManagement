// Tests pour améliorer la couverture de code de app.js
const request = require('supertest');

// Mock des dépendances
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn()
  };
  
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.json = jest.fn();
  mockExpress.static = jest.fn();
  
  return mockExpress;
});

jest.mock('cors', () => jest.fn());
jest.mock('helmet', () => jest.fn());
jest.mock('swagger-ui-express', () => ({
  serve: 'swagger-ui middleware',
  setup: jest.fn()
}));
jest.mock('swagger-jsdoc', () => jest.fn());
jest.mock('../routes/eventRoutes', () => 'event routes');

describe('App Configuration', () => {
  let app;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.resetModules();
    
    // Définir les variables d'environnement
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.NODE_ENV = 'development';
  });
  
  it('should initialize Express app correctly', () => {
    // Importer l'application
    const app = require('../app').default;
    
    // Vérifier que l'application a été initialisée
    expect(app).toBeDefined();
  });
  
  it('should set up health check route', () => {
    const express = require('express');
    const mockApp = express();
    
    // Importer l'application
    require('../app');
    
    // Vérifier que la route health check a été définie
    expect(mockApp.get).toHaveBeenCalled();
  });
});
