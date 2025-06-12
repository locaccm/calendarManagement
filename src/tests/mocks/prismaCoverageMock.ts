/**
 * Mock spécifique pour les tests de couverture de prisma.ts
 * Ce fichier est utilisé pour simuler le comportement du module prisma.ts
 * sans réellement exécuter son code, ce qui permet de tester différents scénarios.
 */
import { PrismaClient } from '@prisma/client';

// Exporter les mêmes éléments que le fichier prisma.ts réel
export const prisma = {} as PrismaClient;

// Fonction pour réinitialiser l'état des mocks entre les tests
export const resetPrismaMock = () => {
  // Rien à faire ici, car le mock est vide
};
