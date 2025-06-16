import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT ?? 3000;

async function startServer() {
  try {
    // Prisma is automatically connected upon import
    app.listen(PORT);
  } catch (error: unknown) {
    const errorMessage = `Error during server startup: ${error instanceof Error ? error.message : String(error)}`;
    process.stderr.write(errorMessage + '\n');
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
