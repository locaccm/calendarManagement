/**
 * Test file specifically for improving code coverage of prisma.ts
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Mock modules to test different code paths
jest.mock('dotenv');
jest.mock('@prisma/client');

describe('Prisma Module Coverage Tests', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  // Reset mocks and environment before each test
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv }; // Restore original env
    
    // Mock PrismaClient constructor
    (PrismaClient as jest.Mock).mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn()
    }));
  });
  
  // Restore original environment after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load .env.test file in test environment', () => {
    // Setup test environment
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'test';
    
    // Mock dotenv.config to set DATABASE_URL
    (dotenv.config as jest.Mock).mockImplementation(() => {
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
      return {};
    });
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify dotenv.config was called with the correct path
      expect(dotenv.config).toHaveBeenCalledWith({
        path: expect.stringContaining('.env.test')
      });
    });
  });

  it('should load .env.development file in development environment', () => {
    // Setup development environment
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'development';
    
    // Mock dotenv.config to set DATABASE_URL
    (dotenv.config as jest.Mock).mockImplementation(() => {
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
      return {};
    });
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify dotenv.config was called with the correct path
      expect(dotenv.config).toHaveBeenCalledWith({
        path: expect.stringContaining('.env.development')
      });
    });
  });

  it('should load default .env file when NODE_ENV is not test or development', () => {
    // Setup production environment
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'production';
    
    // Mock dotenv.config to set DATABASE_URL
    (dotenv.config as jest.Mock).mockImplementation(() => {
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
      return {};
    });
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify dotenv.config was called without a specific path
      expect(dotenv.config).toHaveBeenCalledWith();
    });
  });

  it('should validate DATABASE_URL format', () => {
    // Create a spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create a spy on Error constructor
    const errorSpy = jest.spyOn(global, 'Error');
    
    // Set invalid DATABASE_URL
    process.env.DATABASE_URL = 'invalid-url';
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      try {
        require('../prisma');
      } catch (error) {
        // Expected to throw, we'll verify with the spy
      }
      
      // Verify console.error was called with the right message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'DATABASE_URL has an invalid format. Expected format: postgresql://user:password@host:port/database'
      );
      
      // Verify Error was constructed with the right message
      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid DATABASE_URL format. Please check your environment configuration.'
      );
    });
    
    // Restore the spies
    consoleErrorSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should throw error if DATABASE_URL is not defined', () => {
    // Create a spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create a spy on Error constructor
    const errorSpy = jest.spyOn(global, 'Error');
    
    // Remove DATABASE_URL
    delete process.env.DATABASE_URL;
    
    // Mock dotenv.config to return empty object (no DATABASE_URL)
    (dotenv.config as jest.Mock).mockReturnValue({});
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      try {
        require('../prisma');
      } catch (error) {
        // Expected to throw, we'll verify with the spy
      }
      
      // Verify console.error was called with the right message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'DATABASE_URL is missing. Please check your .env files or environment settings.'
      );
      
      // Verify Error was constructed with the right message
      expect(errorSpy).toHaveBeenCalledWith(
        'DATABASE_URL is not defined. Ensure it is set properly in the environment variables.'
      );
    });
    
    // Restore the spies
    consoleErrorSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should handle error during Prisma Client initialization', () => {
    // Create a spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create a spy on Error constructor
    const errorSpy = jest.spyOn(global, 'Error');
    
    // Set valid DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    
    // Mock PrismaClient constructor to throw error
    const initError = new Error('Prisma Client initialization error');
    (PrismaClient as jest.Mock).mockImplementation(() => {
      throw initError;
    });
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      try {
        require('../prisma');
      } catch (error) {
        // Expected to throw, we'll verify with the spy
      }
      
      // Verify console.error was called with the right message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize Prisma Client:',
        'Prisma Client initialization error'
      );
      
      // Verify Error was constructed with the right message
      expect(errorSpy).toHaveBeenCalledWith(
        'Prisma Client initialization failed: Prisma Client initialization error. Check your environment variables and database configuration.'
      );
    });
    
    // Restore the spies
    consoleErrorSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should create Prisma Client with development logging when NODE_ENV is development', () => {
    // Setup development environment
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify PrismaClient was called with correct options
      expect(PrismaClient).toHaveBeenCalledWith({
        log: ['query', 'error', 'warn']
      });
    });
  });

  it('should create Prisma Client with error-only logging when NODE_ENV is not development', () => {
    // Setup production environment
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify PrismaClient was called with correct options
      expect(PrismaClient).toHaveBeenCalledWith({
        log: ['error']
      });
    });
  });
});
