import { Request, Response } from 'express';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      age: z.number().min(18, 'Must be at least 18 years old'),
    });

    test('should pass validation with valid data', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        age: 25,
      };
      const middleware = validateBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 400 with validation errors for invalid data', () => {
      // Arrange
      mockRequest.body = {
        name: '',
        age: 15,
      };
      const middleware = validateBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          details: expect.any(Array),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should handle missing required fields', () => {
      // Arrange
      mockRequest.body = {};
      const middleware = validateBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    });

    test('should pass validation with valid query params', () => {
      // Arrange
      mockRequest.query = {
        page: '1',
        limit: '10',
      };
      const middleware = validateQuery(querySchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({
        page: 1,
        limit: 10,
      });
    });

    test('should return 400 with validation errors for invalid query params', () => {
      // Arrange
      mockRequest.query = {
        page: 'abc',
        limit: '10',
      };
      const middleware = validateQuery(querySchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should handle empty query params', () => {
      // Arrange
      mockRequest.query = {};
      const middleware = validateQuery(querySchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({});
    });
  });
});
