import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Chargement des variables d'environnement en fonction de NODE_ENV
const env = process.env.NODE_ENV || 'development';

switch (env) {
  case 'test':
    dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
    break;
  case 'development':
    dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
    break;
  default:
    // Production ou autre
    dotenv.config();
}

// Configuration du client Prisma avec logging en développement uniquement
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
