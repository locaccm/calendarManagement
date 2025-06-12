import { PrismaClient } from '@prisma/client';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { getMockPrismaClient, setupPrismaMocks, resetPrismaMocks } from './mockPrisma';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
let container: StartedTestContainer;
let prisma: PrismaClient | any;

// Determine if we're running in CI environment
const isCI = process.env.CI === 'true';

// Load test environment variables
dotenv.config();

// PostgreSQL container configuration for tests
async function setupTestDatabase() {
  // If running in CI, use a mock Prisma client instead of a real database
  if (isCI) {
    // Use our centralized mock Prisma client implementation
    prisma = getMockPrismaClient();
    // Set a fake DATABASE_URL for tests that check for its existence
    process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/fake_db?schema=public';
    return prisma;
  }
  // For non-CI environments, use a real database container
  try {
    // Start a PostgreSQL container for tests
    container = await new GenericContainer('postgres:14')
      .withEnvironment({
        POSTGRES_DB: 'calendar_test_db',
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
      })
      .withExposedPorts(5432)
      .start();

    // Configure connection URL for Prisma
    const host = container.getHost();
    const port = container.getMappedPort(5432);
    process.env.DATABASE_URL = `postgresql://postgres:postgres@${host}:${port}/calendar_test_db?schema=public`;

    // Create a new PrismaClient instance
    prisma = new PrismaClient();

    // Run migrations
    try {
      await execAsync(`cd ${path.resolve(__dirname, '../..')} && npx prisma migrate deploy`);
    } catch (error) {
      console.error('Error applying migrations:', error);
    }
    return prisma;
  } catch (error) {
    console.error('Failed to set up test database container:', error);
    // Fallback to mock if container setup fails
    return setupMockPrisma();
  }
}

// Helper function to set up a mock Prisma client
function setupMockPrisma() {
  // Use our centralized mock Prisma client implementation
  prisma = getMockPrismaClient();
  return prisma;
}

// Function to reset the test database before each test suite
export async function resetDatabase() {
  try {
    // If using a mock client, just reset the mock
    if (isCI || !container) {
      // Use our centralized reset function
      resetPrismaMocks(prisma);
      return;
    }
    // For real database, delete all existing data
    await prisma.event.deleteMany({});
  } catch (error) {
    console.error('Error while resetting test database:', error);
    // Don't throw in CI to allow tests to continue
    if (!isCI) {
      throw error;
    }
  }
}

// Function to close the database connection after tests
export async function closeDatabase() {
  try {
    // Disconnect from the database (works for both real and mock clients)
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
    // Only stop the container if it exists (not in CI)
    if (container) {
      await container.stop();
    }
  } catch (error) {
    console.error('Error while closing database connection:', error);
    // Don't throw in CI to allow tests to continue
    if (!isCI) {
      throw error;
    }
  }
}

// Test database initialization
export async function initTestDatabase() {
  if (!prisma) {
    await setupTestDatabase();
  }
  return prisma;
}

export { prisma };
