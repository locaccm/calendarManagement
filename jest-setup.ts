// Configuration globale pour Jest
import { PrismaClient } from '@prisma/client';

// Créer une instance globale de PrismaClient pour les tests
const prisma = new PrismaClient();

// Augmenter le timeout pour les tests d'intégration
jest.setTimeout(60000);

// Exporter l'instance de PrismaClient
export { prisma };
