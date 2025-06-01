import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables if DATABASE_URL is not set
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

// Throw a clear error if DATABASE_URL is still not set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please set it in your environment variables or .env files.',
  );
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
  throw new Error(
    'Prisma Client initialization failed. Check your environment variables and database configuration.',
  );
}

export default prisma;
