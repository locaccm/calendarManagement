import { Request, Response } from 'express';
import { authenticate } from '../middleware/authentication';

describe('Authentication Middleware', () => {
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
  });

  test('should authenticate user with valid headers', () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'X-User-Id') return '1';
      if (header === 'X-User-Role') return 'Owner';
      return null;
    });

    // Act
    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.id).toBe(1);
    expect(mockRequest.user?.role).toBe('Owner');
  });

  test('should return 401 when userId is missing', () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'X-User-Role') return 'Owner';
      return null;
    });

    // Act
    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated (missing headers)' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 when userRole is missing', () => {
    // Arrange
    mockRequest.header = jest.fn().mockImplementation((header) => {
      if (header === 'X-User-Id') return '1';
      return null;
    });

    // Act
    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated (missing headers)' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
