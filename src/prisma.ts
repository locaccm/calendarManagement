import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if not already set
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

// Throw a clear error if DATABASE_URL is still not set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Please check your .env file or environment settings.');
  throw new Error(
    'DATABASE_URL is not defined. Ensure it is set properly in the environment variables.',
  );
}

// Validate that the DATABASE_URL has the correct format
// Allow for query parameters at the end of the URL
const dbUrlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+(\?.*)?$/;
if (!dbUrlPattern.test(process.env.DATABASE_URL)) {
  console.error(
    `DATABASE_URL has an invalid format: ${process.env.DATABASE_URL.substring(0, 10)}... Expected format: postgresql://user:password@host:port/database`,
  );
  throw new Error('Invalid DATABASE_URL format. Please check your environment configuration.');
}

// Validate NODE_ENV and fallback to 'development' if undefined
const environment = process.env.NODE_ENV || 'development';

// Configure Prisma client with logging in development only
let prisma: PrismaClient;
try {
  prisma = new PrismaClient({
    log: environment === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} catch (error: any) {
  console.error('Failed to initialize Prisma Client:', error.message);
  console.error('Current environment:', environment);
  console.error('Database URL pattern valid:', dbUrlPattern.test(process.env.DATABASE_URL || ''));
  throw new Error(
    `Prisma Client initialization failed: ${error.message}. Check your environment variables and database configuration.`,
  );
}

export default prisma;
