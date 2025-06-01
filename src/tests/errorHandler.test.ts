import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  test('should handle error with status and message', () => {
    // Arrange
    const error = {
      status: 400,
      message: 'Bad Request',
      details: { field: 'name', issue: 'required' }
    };

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Bad Request',
      details: { field: 'name', issue: 'required' }
    });
  });

  test('should use default status 500 when not provided', () => {
    // Arrange
    const error = {
      message: 'Some error occurred'
    };

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Some error occurred',
      details: undefined
    });
  });

  test('should use default message when not provided', () => {
    // Arrange
    const error = {
      status: 500
    };

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      details: undefined
    });
  });

  test('should call next with error if headers already sent', () => {
    // Arrange
    const error = new Error('Some error');
    mockResponse.headersSent = true;

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledWith(error);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
