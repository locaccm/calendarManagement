import { Request, Response } from 'express';
import { authorize, UserRole } from '../middleware/authorization';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  test('should authorize user with valid role', () => {
    // Arrange
    mockRequest.user = {
      id: 1,
      role: 'Owner' as UserRole,
    };
    const middleware = authorize(['Owner']);

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should return 401 when user is not authenticated', () => {
    // Arrange
    mockRequest.user = undefined;
    const middleware = authorize(['Owner']);

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 403 when user has invalid role', () => {
    // Arrange
    mockRequest.user = {
      id: 1,
      role: 'Tenant' as UserRole,
    };
    const middleware = authorize(['Owner']);

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied (role)' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should authorize when no roles are specified', () => {
    // Arrange
    mockRequest.user = {
      id: 1,
      role: 'Tenant' as UserRole,
    };
    const middleware = authorize();

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should authorize owner of resource when ownOnly is true', () => {
    // Arrange
    mockRequest.user = {
      id: 1,
      role: 'Tenant' as UserRole,
    };
    mockRequest.event = {
      USEN_ID: 1,
    };
    const middleware = authorize([], true);

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should return 403 when user is not owner and ownOnly is true', () => {
    // Arrange
    mockRequest.user = {
      id: 1,
      role: 'Tenant' as UserRole,
    };
    mockRequest.event = {
      USEN_ID: 2,
    };
    const middleware = authorize([], true);

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied (owner)' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
