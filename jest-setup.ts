// Configuration globale pour Jest
import { PrismaClient } from '@prisma/client';

// Create a global PrismaClient instance for tests
const prisma = new PrismaClient();

// Increase timeout for integration tests
jest.setTimeout(60000);

// Exporter l'instance de PrismaClient
export { prisma };
