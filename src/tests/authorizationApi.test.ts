import { Request, Response } from 'express';
import { authorizeWithApi } from '../middleware/authorizationApi';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authorization API Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  test('should return 401 when token is missing', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue(null);
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token missing' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should allow access with test-token', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'Authorization') return 'Bearer test-token';
      return null;
    });
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should extract token from Authorization header', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'Authorization') return 'Bearer valid-token';
      return null;
    });
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        token: 'valid-token',
        rightName: 'test-right',
      }),
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should extract token from X-Access-Token header', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'X-Access-Token') return 'valid-token';
      return null;
    });
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        token: 'valid-token',
        rightName: 'test-right',
      }),
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should return 403 when API denies access', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 403 },
    });
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied by central policy' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 when API returns 401', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 401 },
    });
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated (Central API)' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 500 when API call fails with network error', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error during access verification' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  // Test pour la partie mock
  test('should use mockAxiosPost when available', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    const mockPost = jest.fn().mockResolvedValueOnce({ status: 200 });
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockPost).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });

  test('should handle forbidden-token with mockAxiosPost', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer forbidden-token');
    const mockPost = jest.fn();
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied by central policy' });
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });

  test('should handle error-token with mockAxiosPost', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer error-token');
    const mockPost = jest.fn();
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error during access verification' });
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });

  test('should handle mockPost returning 403', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    const mockPost = jest.fn().mockRejectedValueOnce({
      response: { status: 403 },
    });
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied by central policy' });
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });

  test('should handle mockPost throwing API down error', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    const mockPost = jest.fn().mockRejectedValueOnce(new Error('API down'));
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error during access verification' });
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });

  test('should handle mockPost throwing other errors', async () => {
    // Arrange
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid-token');
    const mockPost = jest.fn().mockRejectedValueOnce(new Error('Other error'));
    // @ts-ignore - mockAxiosPost is defined in tests
    global.mockAxiosPost = mockPost;
    const middleware = authorizeWithApi({ rightName: 'test-right' });

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error during access verification' });
    // @ts-ignore - mockAxiosPost is defined in tests
    delete global.mockAxiosPost;
  });
});
