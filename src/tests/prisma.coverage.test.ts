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

  it('should load .env file when DATABASE_URL is not set', () => {
    // Setup environment
    delete process.env.DATABASE_URL;
    
    // Mock dotenv.config to set DATABASE_URL
    (dotenv.config as jest.Mock).mockImplementation(() => {
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
      return {};
    });
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify dotenv.config was called
      expect(dotenv.config).toHaveBeenCalled();
    });
  });

  it('should not load .env file when DATABASE_URL is already set', () => {
    // Setup environment with DATABASE_URL already set
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      require('../prisma');
      
      // Verify dotenv.config was not called
      expect(dotenv.config).not.toHaveBeenCalled();
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
      
      // Verify console.error was called with a message about invalid format
      expect(consoleErrorSpy).toHaveBeenCalled();
      // We can't check the exact message as it includes the actual DATABASE_URL value
      // But we can check that it mentions 'invalid format'
      const calls = consoleErrorSpy.mock.calls;
      const hasInvalidFormatMessage = calls.some(
        (call) => typeof call[0] === 'string' && call[0].includes('invalid format'),
      );
      expect(hasInvalidFormatMessage).toBe(true);
      
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
        'DATABASE_URL is missing. Please check your .env file or environment settings.'
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
    
    // Mock PrismaClient constructor to throw error with the expected message
    const mockPrismaClient = jest.fn().mockImplementation(() => {
      // Create an error with the specific message we're expecting in the test
      const error = new Error('Prisma Client initialization error');
      throw error;
    });
    (PrismaClient as jest.Mock).mockImplementation(mockPrismaClient);
    
    // Import the module to trigger the code path
    jest.isolateModules(() => {
      try {
        require('../prisma');
      } catch (error) {
        // Expected to throw, we'll verify with the spy
      }
      
      // Verify console.error was called with the right messages
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize Prisma Client:',
        'Prisma Client initialization error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Current environment:', 'test');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database URL pattern valid:', true);
      
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
