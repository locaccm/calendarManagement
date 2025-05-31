import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Prefer DATABASE_URL from environment (CI), otherwise load from .env files for local dev
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

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please set it in your environment variables or .env files.',
  );
}

// Configure Prisma client with logging in development only
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
