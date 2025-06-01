import { PrismaClient } from '@prisma/client';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import dotenv from 'dotenv';

const execPromise = promisify(exec);
let container: StartedTestContainer;
let prisma: PrismaClient;

// Load test environment variables
dotenv.config();

// PostgreSQL container configuration for tests
async function setupTestDatabase() {
  // Start a PostgreSQL container for tests
  container = await new GenericContainer('postgres:14')
    .withEnvironment({
      POSTGRES_DB: 'calendar_test_db',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
    })
    .withExposedPorts(5432)
    .start();

  // Configurer l'URL de connexion pour Prisma
  const host = container.getHost();
  const port = container.getMappedPort(5432);
  process.env.DATABASE_URL = `postgresql://postgres:postgres@${host}:${port}/calendar_test_db?schema=public`;

  // Create a new PrismaClient instance
  prisma = new PrismaClient();

  // Run Prisma migrations
  try {
    await execPromise('npx prisma migrate deploy');
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error("Erreur lors de l'application des migrations:", error);
  }

  return prisma;
}

// Function to reset the test database before each test suite
export async function resetDatabase() {
  try {
    // Delete all existing data
    await prisma.event.deleteMany({});
    console.log('Test database reset successfully');
  } catch (error) {
    console.error('Error while resetting test database:', error);
    throw error;
  }
}

// Function to close the database connection after tests
export async function closeDatabase() {
  await prisma.$disconnect();
  if (container) {
    await container.stop();
    console.log('Test container stopped');
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
