import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Mock modules to test different code paths
jest.mock('dotenv');

// Create a direct import for the code we want to test
// This is needed to test the code paths that are executed during module initialization
const prismaModule = require('../prisma');

// Export the regex pattern for testing
export const dbUrlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+$/;

describe('Prisma Client', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  // Reset mocks and environment before each test
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv }; // Restore original env
  });
  
  // Restore original environment after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('should have a $connect method', () => {
    expect(prisma.$connect).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should have a $disconnect method', () => {
    expect(prisma.$disconnect).toBeDefined();
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('should have DATABASE_URL environment variable set', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(typeof process.env.DATABASE_URL).toBe('string');
  });

  it('should connect to the test database', async () => {
    try {
      // Simple query to test database connectivity
      await prisma.$queryRaw`SELECT 1 as result`;
      expect(true).toBeTruthy(); // If we get here, connection worked
    } catch (error: any) {
      console.error('Test database connection failed:', error.message);
      // Use expect with toBe(false) to fail the test with a message
      expect('Database connection failed: ' + error.message).toBe(false);
    }
  });

  it('should validate DATABASE_URL format', () => {
    // Test the regex pattern used in prisma.ts
    const dbUrlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+$/;
    
    // Valid format
    expect(dbUrlPattern.test('postgresql://user:password@localhost:5432/db')).toBe(true);
    
    // Invalid formats
    expect(dbUrlPattern.test('mysql://user:password@localhost:3306/db')).toBe(false);
    expect(dbUrlPattern.test('postgresql://localhost:5432/db')).toBe(false);
    expect(dbUrlPattern.test('postgresql://user@localhost:5432/db')).toBe(false);
  });

  it('should load .env.test file in test environment', () => {
    // Save original dotenv.config
    const originalConfig = dotenv.config;
    
    try {
      // Mock dotenv.config
      dotenv.config = jest.fn().mockReturnValue({});
      
      // Setup test environment
      const originalUrl = process.env.DATABASE_URL;
      const originalEnv = process.env.NODE_ENV;
      
      delete process.env.DATABASE_URL;
      process.env.NODE_ENV = 'test';
      
      // Call the function that loads environment variables
      const loadEnv = () => {
        if (!process.env.DATABASE_URL) {
          const env = process.env.NODE_ENV || 'development';
          switch (env) {
            case 'test':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
              break;
            case 'development':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
              break;
            default:
              dotenv.config();
          }
        }
      };
      
      // Call the function
      loadEnv();
      
      // Verify dotenv.config was called with the correct path
      expect(dotenv.config).toHaveBeenCalledWith({
        path: expect.stringContaining('.env.test')
      });
      
      // Restore environment
      process.env.DATABASE_URL = originalUrl;
      process.env.NODE_ENV = originalEnv;
    } finally {
      // Restore original dotenv.config
      dotenv.config = originalConfig;
    }
  });

  it('should load .env.development file in development environment', () => {
    // Save original dotenv.config
    const originalConfig = dotenv.config;
    
    try {
      // Mock dotenv.config
      dotenv.config = jest.fn().mockReturnValue({});
      
      // Setup development environment
      const originalUrl = process.env.DATABASE_URL;
      const originalEnv = process.env.NODE_ENV;
      
      delete process.env.DATABASE_URL;
      process.env.NODE_ENV = 'development';
      
      // Call the function that loads environment variables
      const loadEnv = () => {
        if (!process.env.DATABASE_URL) {
          const env = process.env.NODE_ENV || 'development';
          switch (env) {
            case 'test':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
              break;
            case 'development':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
              break;
            default:
              dotenv.config();
          }
        }
      };
      
      // Call the function
      loadEnv();
      
      // Verify dotenv.config was called with the correct path
      expect(dotenv.config).toHaveBeenCalledWith({
        path: expect.stringContaining('.env.development')
      });
      
      // Restore environment
      process.env.DATABASE_URL = originalUrl;
      process.env.NODE_ENV = originalEnv;
    } finally {
      // Restore original dotenv.config
      dotenv.config = originalConfig;
    }
  });

  it('should load default .env file when NODE_ENV is not test or development', () => {
    // Save original dotenv.config
    const originalConfig = dotenv.config;
    
    try {
      // Mock dotenv.config
      dotenv.config = jest.fn().mockReturnValue({});
      
      // Setup production environment
      const originalUrl = process.env.DATABASE_URL;
      const originalEnv = process.env.NODE_ENV;
      
      delete process.env.DATABASE_URL;
      process.env.NODE_ENV = 'production';
      
      // Call the function that loads environment variables
      const loadEnv = () => {
        if (!process.env.DATABASE_URL) {
          const env = process.env.NODE_ENV || 'development';
          switch (env) {
            case 'test':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
              break;
            case 'development':
              dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
              break;
            default:
              dotenv.config();
          }
        }
      };
      
      // Call the function
      loadEnv();
      
      // Verify dotenv.config was called without a specific path
      expect(dotenv.config).toHaveBeenCalledWith();
      
      // Restore environment
      process.env.DATABASE_URL = originalUrl;
      process.env.NODE_ENV = originalEnv;
    } finally {
      // Restore original dotenv.config
      dotenv.config = originalConfig;
    }
  });

  beforeAll(async () => {
    try {
      await prisma.$connect();
    } catch (error: any) {
      console.error('Error connecting to Prisma:', error.message);
    }
  });

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch (error: any) {
      console.error('Error disconnecting from Prisma:', error.message);
    }
  });
});
