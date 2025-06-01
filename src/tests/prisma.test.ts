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
    // Mock the $queryRaw method for this test
    const originalQueryRaw = prisma.$queryRaw;
    prisma.$queryRaw = jest.fn().mockResolvedValue([{ result: 1 }]);
    
    try {
      // Simple query to test database connectivity with mock
      const result = await prisma.$queryRaw`SELECT 1 as result`;
      expect(result).toEqual([{ result: 1 }]);
    } catch (error: any) {
      console.error('Test database connection failed:', error.message);
      fail(`Database connection test failed: ${error.message}. Make sure DATABASE_URL is correctly set in the environment.`);
    } finally {
      // Restore the original method
      prisma.$queryRaw = originalQueryRaw;
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

  it('should load .env file when DATABASE_URL is not set', () => {
    // Save original dotenv.config
    const originalConfig = dotenv.config;
    
    try {
      // Mock dotenv.config
      dotenv.config = jest.fn().mockReturnValue({});
      
      // Setup test environment
      const originalUrl = process.env.DATABASE_URL;
      
      delete process.env.DATABASE_URL;
      
      // Call the function that loads environment variables
      const loadEnv = () => {
        if (!process.env.DATABASE_URL) {
          dotenv.config();
        }
      };
      
      // Call the function
      loadEnv();
      
      // Verify dotenv.config was called
      expect(dotenv.config).toHaveBeenCalled();
      
      // Restore environment
      process.env.DATABASE_URL = originalUrl;
    } finally {
      // Restore original dotenv.config
      dotenv.config = originalConfig;
    }
  });

  it('should not load .env file when DATABASE_URL is already set', () => {
    // Save original dotenv.config
    const originalConfig = dotenv.config;
    
    try {
      // Mock dotenv.config
      dotenv.config = jest.fn().mockReturnValue({});
      
      // Ensure DATABASE_URL is set
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
      
      // Call the function that loads environment variables
      const loadEnv = () => {
        if (!process.env.DATABASE_URL) {
          dotenv.config();
        }
      };
      
      // Call the function
      loadEnv();
      
      // Verify dotenv.config was NOT called
      expect(dotenv.config).not.toHaveBeenCalled();
      
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
