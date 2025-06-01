import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// Mock dotenv
jest.mock('dotenv', () => {
  return {
    config: jest.fn().mockReturnValue({
      parsed: {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      },
    }),
  };
});

// Direct import tests to improve coverage
describe('Direct import of prisma module', () => {
  // Save original environment
  const originalEnv = { ...process.env };
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  // Mock console methods to prevent noise in test output
  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    // Clear module cache to force re-import
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  it('should handle PrismaClient initialization error', async () => {
    // Mock PrismaClient to throw an error when instantiated
    jest.resetModules();
    jest.mock('@prisma/client', () => {
      return {
        PrismaClient: jest.fn().mockImplementation(() => {
          throw new Error('Mocked PrismaClient initialization error');
        }),
      };
    });

    // Setup environment variables
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    delete process.env.SKIP_DB_CONNECTION;
    delete process.env.CI;

    // Import should throw an error
    expect(() => {
      require('../../src/prisma');
    }).toThrow('Prisma Client initialization failed');

    // Verify error logging
    expect(console.error).toHaveBeenCalledWith(
      'Failed to initialize Prisma Client:',
      'Mocked PrismaClient initialization error',
    );
    expect(console.error).toHaveBeenCalledWith('Current environment:', 'production');
  });

  it('should create a mock client when in CI environment', () => {
    // Setup environment for CI
    process.env.CI = 'true';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    process.env.NODE_ENV = 'test';

    // Reset mocks
    jest.resetModules();
    jest.mock('@prisma/client', () => {
      return {
        PrismaClient: jest.fn().mockImplementation(() => {
          return {
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
          };
        }),
      };
    });

    // Import the module
    const prisma = require('../../src/prisma').default;

    // Verify that a mock client was created
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
    expect(console.log).toHaveBeenCalledWith(
      'Skipping real database connection - using mock client',
    );

    // Test the connect and disconnect methods of the mock client
    return prisma.$connect().then(() => {
      // Now test disconnect
      return prisma.$disconnect().then(() => {
        // Both methods should complete successfully
        expect(true).toBe(true);
      });
    });
  });

  it('should validate DATABASE_URL format', () => {
    // Setup environment with invalid DATABASE_URL
    process.env.DATABASE_URL = 'invalid-url-format';
    delete process.env.SKIP_DB_CONNECTION;
    delete process.env.CI;
    process.env.NODE_ENV = 'test';

    // Reset mocks
    jest.resetModules();

    // Import should throw an error
    expect(() => {
      require('../../src/prisma');
    }).toThrow('Invalid DATABASE_URL format');

    // Verify error logging
    expect(console.error).toHaveBeenCalledWith(
      'DATABASE_URL has an invalid format: invalid-ur... Expected format: postgresql://user:password@host:port/database',
    );
  });

  it('should handle missing DATABASE_URL', () => {
    // Setup environment with no DATABASE_URL and no skip flag
    delete process.env.DATABASE_URL;
    delete process.env.SKIP_DB_CONNECTION;
    delete process.env.CI;
    process.env.NODE_ENV = 'test';

    // Mock dotenv.config to return empty object
    jest.resetModules();
    jest.mock('dotenv', () => {
      return {
        config: jest.fn().mockReturnValue({
          parsed: {}, // No DATABASE_URL in .env
        }),
      };
    });

    // Import should throw an error
    expect(() => {
      require('../../src/prisma');
    }).toThrow('DATABASE_URL is not defined');

    // Verify error logging
    expect(console.error).toHaveBeenCalledWith(
      'DATABASE_URL is missing. Please check your .env file or environment settings.',
    );
  });

  it('should test the coverage test detection logic', () => {
    // Setup environment for coverage test detection
    process.env.NODE_ENV = 'test';

    // Create a mock Error object with a stack that includes prisma.coverage.test.ts
    const originalError = Error;
    global.Error = jest.fn(() => ({
      stack:
        'Error\n    at Object.<anonymous> (/home/eno/calendarManagement/src/tests/prisma.coverage.test.ts:10:10)',
    })) as any;

    // Import the module
    jest.resetModules();
    const prisma = require('../../src/prisma').default;

    // Verify that a placeholder client was created for coverage tests
    expect(prisma).toBeDefined();
    expect(Object.keys(prisma).length).toBe(0);

    // Restore the original Error constructor
    global.Error = originalError;
  });

  it('should test the mock client with SKIP_DB_CONNECTION', async () => {
    // Setup environment with SKIP_DB_CONNECTION
    process.env.SKIP_DB_CONNECTION = 'true';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    process.env.NODE_ENV = 'test';
    delete process.env.CI;

    // Reset mocks
    jest.resetModules();

    // Import the module
    const prisma = require('../../src/prisma').default;

    // Verify that a mock client was created
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
    expect(console.log).toHaveBeenCalledWith(
      'Skipping real database connection - using mock client',
    );

    // Test both connect and disconnect methods to ensure full coverage
    await prisma.$connect();
    await prisma.$disconnect();
  });
});
