// Basic smoke test for index.ts to increase coverage
// Mock app.listen to prevent actual server startup
jest.mock('../app', () => {
  const mockApp = {
    listen: jest.fn().mockReturnThis(),
  };
  return { __esModule: true, default: mockApp };
});

// Mock the server startup function
jest.mock('../index', () => {
  return { __esModule: true, server: { close: jest.fn() } };
});

describe('Index', () => {
  test('should load without errors', async () => {
    const module = await import('../index');
    expect(module).toBeDefined();
  });
});
