import prisma from '../prisma';

describe('Prisma Client', () => {
  it('should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('should have a $connect method', () => {
    expect(prisma.$connect).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should have a $disconnect method', () => {
    expect(prisma.$disconnect).toBeDefined();
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('should have DATABASE_URL environment variable set', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(typeof process.env.DATABASE_URL).toBe('string');
  });

  it('should connect to the test database', async () => {
    try {
      // Simple query to test database connectivity
      await prisma.$queryRaw`SELECT 1 as result`;
      expect(true).toBeTruthy(); // If we get here, connection worked
    } catch (error: any) {
      console.error('Test database connection failed:', error.message);
      fail('Database connection test failed: ' + error.message);
    }
  });

  beforeAll(async () => {
    try {
      await prisma.$connect();
    } catch (error: any) {
      console.error('Error connecting to Prisma:', error.message);
    }
  });

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch (error: any) {
      console.error('Error disconnecting from Prisma:', error.message);
    }
  });
});
