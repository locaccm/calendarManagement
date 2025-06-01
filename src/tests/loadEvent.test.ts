import { Request, Response } from 'express';

// Créer un mock pour le module prisma avant d'importer loadEvent
const mockFindUnique = jest.fn();
const mockPrisma = {
  event: {
    findUnique: mockFindUnique,
  },
};

// Mock le module prisma
jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Importer loadEvent après avoir configuré le mock
const { loadEvent } = require('../middleware/loadEvent');

describe('LoadEvent Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  test('should load event and add it to request', async () => {
    // Arrange
    mockRequest.params = { id: '1' };
    const mockEvent = { EVEN_ID: 1, EVEC_LIB: 'Test Event' };
    mockFindUnique.mockResolvedValue(mockEvent);

    // Act
    await loadEvent(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { EVEN_ID: 1 },
    });
    expect(mockRequest.event).toEqual(mockEvent);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should return 400 for invalid event ID', async () => {
    // Arrange
    mockRequest.params = { id: 'invalid' };

    // Act
    await loadEvent(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid event ID',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 404 when event is not found', async () => {
    // Arrange
    mockRequest.params = { id: '999' };
    mockFindUnique.mockResolvedValue(null);

    // Act
    await loadEvent(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { EVEN_ID: 999 },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Event not found',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should call next with error when database query fails', async () => {
    // Arrange
    mockRequest.params = { id: '1' };
    const dbError = new Error('Database error');
    mockFindUnique.mockRejectedValue(dbError);

    // Act
    await loadEvent(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { EVEN_ID: 1 },
    });
    expect(nextFunction).toHaveBeenCalledWith(dbError);
  });
});
