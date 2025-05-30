import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Prisma is automatically connected upon import
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error('Error during server startup:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
