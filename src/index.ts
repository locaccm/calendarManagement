import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Prisma est automatiquement connecté lors de l'importation
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error('Erreur lors du démarrage du serveur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
