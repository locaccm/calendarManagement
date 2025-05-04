import { AppDataSource } from '../data-source';

describe('Database connection', () => {
  it('should connect to the PostgreSQL database', async () => {
    await expect(AppDataSource.initialize()).resolves.not.toThrow();
    await AppDataSource.destroy();
  });
});
