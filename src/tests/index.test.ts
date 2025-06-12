// Define mocks at the top, so they are available when jest.mock is hoisted and executed.
const mockAppListen = jest.fn();
const mockPrismaDisconnect = jest.fn();

// Mock '../app' before it's imported by '../index'
// This mock factory now has access to mockAppListen defined above.
jest.mock('../app', () => ({
  __esModule: true,
  default: {
    listen: mockAppListen,
  },
}));

// Mock '../prisma' before it's imported by '../index'
jest.mock('../prisma', () => ({
  __esModule: true,
  default: {
    $disconnect: mockPrismaDisconnect,
  },
}));

// Spy on process.stderr.write and process.exit
const mockProcessStderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('Server Startup (index.ts)', () => {
  let originalEnvPort: string | undefined;

  beforeEach(() => {
    // Reset mocks and environment variables before each test
    jest.resetModules(); // Important to re-import index.ts with fresh mocks/env
    mockAppListen.mockReset();
    mockPrismaDisconnect.mockReset();
    mockProcessStderrWrite.mockReset();
    mockProcessExit.mockReset();

    // Store original PORT and clear it for tests
    originalEnvPort = process.env.PORT;
    delete process.env.PORT; // Default to 3000 unless overridden by a test
  });

  afterEach(() => {
    // Restore original PORT
    if (originalEnvPort !== undefined) {
      process.env.PORT = originalEnvPort;
    } else {
      delete process.env.PORT;
    }
  });

  afterAll(() => {
    // Restore all spied functions
    mockProcessStderrWrite.mockRestore();
    mockProcessExit.mockRestore();
  });

  test('should start the server on default port 3000 if PORT env is not set', async () => {
    await require('../index'); // Execute the index.ts script
    expect(mockAppListen).toHaveBeenCalledTimes(1);
    expect(mockAppListen).toHaveBeenCalledWith(3000);
    expect(mockProcessStderrWrite).not.toHaveBeenCalled();
    expect(mockPrismaDisconnect).not.toHaveBeenCalled();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  test('should start the server on the port specified by PORT environment variable', async () => {
    process.env.PORT = '5000';
    await require('../index');
    expect(mockAppListen).toHaveBeenCalledTimes(1);
    expect(mockAppListen).toHaveBeenCalledWith('5000');
    expect(mockProcessStderrWrite).not.toHaveBeenCalled();
    expect(mockPrismaDisconnect).not.toHaveBeenCalled();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  test('should handle server startup error, log to stderr, disconnect prisma, and exit', async () => {
    const startupError = new Error('Failed to bind port');
    mockAppListen.mockImplementationOnce(() => {
      throw startupError;
    });

    await require('../index');

    expect(mockAppListen).toHaveBeenCalledTimes(1);
    expect(mockProcessStderrWrite).toHaveBeenCalledTimes(1);
    expect(mockProcessStderrWrite).toHaveBeenCalledWith(
      `Error during server startup: ${startupError.message}\n`,
    );
    expect(mockPrismaDisconnect).toHaveBeenCalledTimes(1);
    expect(mockProcessExit).toHaveBeenCalledTimes(1);
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  test('should handle server startup error when error is not an Error instance', async () => {
    const startupError = 'Port already in use';
    mockAppListen.mockImplementationOnce(() => {
      throw startupError;
    });

    await require('../index');

    expect(mockAppListen).toHaveBeenCalledTimes(1);
    expect(mockProcessStderrWrite).toHaveBeenCalledTimes(1);
    expect(mockProcessStderrWrite).toHaveBeenCalledWith(
      `Error during server startup: ${String(startupError)}\n`,
    );
    expect(mockPrismaDisconnect).toHaveBeenCalledTimes(1);
    expect(mockProcessExit).toHaveBeenCalledTimes(1);
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
