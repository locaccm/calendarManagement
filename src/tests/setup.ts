import { PrismaClient } from '@prisma/client';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import dotenv from 'dotenv';

const execPromise = promisify(exec);
let container: StartedTestContainer;
let prisma: PrismaClient;

// Charger les variables d'environnement de test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Configuration du conteneur PostgreSQL pour les tests
async function setupTestDatabase() {
  // Démarrer un conteneur PostgreSQL pour les tests
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

  // Créer une nouvelle instance de PrismaClient
  prisma = new PrismaClient();

  // Exécuter les migrations Prisma
  try {
    await execPromise('npx prisma migrate deploy');
    console.log('Migrations appliquées avec succès');
  } catch (error) {
    console.error("Erreur lors de l'application des migrations:", error);
  }

  return prisma;
}

// Fonction pour réinitialiser la base de données de test avant chaque suite de tests
export async function resetDatabase() {
  try {
    // Supprimer toutes les données existantes
    await prisma.event.deleteMany({});
    console.log('Base de données de test réinitialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base de données de test:', error);
    throw error;
  }
}

// Fonction pour fermer la connexion à la base de données après les tests
export async function closeDatabase() {
  await prisma.$disconnect();
  if (container) {
    await container.stop();
    console.log('Conteneur de test arrêté');
  }
}

// Initialisation de la base de données de test
export async function initTestDatabase() {
  if (!prisma) {
    await setupTestDatabase();
  }
  return prisma;
}

export { prisma };
