import prisma from '../prisma';

describe('Prisma Client', () => {
  it('should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('should have event model', () => {
    expect(prisma.event).toBeDefined();
  });

  it('should connect to database', async () => {
    // Test simple query to verify connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      expect(true).toBeTruthy(); // Connection successful
    } catch (error) {
      fail('Database connection failed: ' + error);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
