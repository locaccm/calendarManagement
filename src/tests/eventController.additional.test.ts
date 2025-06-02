import { Request, Response } from 'express';

// Create mock objects outside of jest.mock for better type support
const mockPrismaClient = {
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  accommodation: {
    findUnique: jest.fn(),
  },
};

// Mock the Prisma module - needs to be done before importing any module that uses it
jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockPrismaClient,
}));

// Now import the controller functions
import { getFilteredEvents, updateEvent, deleteEvent } from '../controllers/eventController';

describe('Event Controller Additional Coverage Tests', () => {
  // Test setup variables
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup fresh request and response mocks for each test
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  describe('getFilteredEvents', () => {
    it('should handle database errors', async () => {
      mockRequest.query = { usager: '1' };
      
      // Mock a database error
      mockPrismaClient.event.findMany.mockRejectedValue(new Error('Database error'));
      
      await getFilteredEvents(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Error while retrieving filtered events.' 
      });
    });

    it('should return empty array if no events match criteria', async () => {
      mockRequest.query = { usager: '999' };
      
      // Mock no events found
      mockPrismaClient.event.findMany.mockResolvedValue([]);
      
      await getFilteredEvents(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('updateEvent', () => {
    it('should handle event update with required fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event Title',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event Title',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaClient.event.update.mockResolvedValue({
        ...existingEvent,
        EVEC_LIB: 'Updated Event Title',
        EVED_START: new Date('2025-06-01T11:00:00Z'),
        EVED_END: new Date('2025-06-01T13:00:00Z')
      });
      
      await updateEvent(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        EVEC_LIB: 'Updated Event Title',
      }));
    });

    it('should handle database errors during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Title',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event Title',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaClient.event.update.mockRejectedValue(new Error('Database error'));
      
      await updateEvent(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Error while updating the event.',
      }));
    });
  });

  describe('deleteEvent', () => {
    it('should handle successful event deletion', async () => {
      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Event to Delete',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      mockRequest.params = { id: '1' };
      
      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaClient.event.delete.mockResolvedValue(existingEvent);
      
      await deleteEvent(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Event deleted.' });
    });

    it('should handle database errors during deletion', async () => {
      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Event to Delete',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1
      };
      
      mockRequest.params = { id: '1' };
      
      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaClient.event.delete.mockRejectedValue(new Error('Database error'));
      
      await deleteEvent(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Error while deleting the event.',
      }));
    });

    it('should handle non-existent event', async () => {
      mockRequest.params = { id: '999' };
      
      mockPrismaClient.event.findUnique.mockResolvedValue(null);
      
      await deleteEvent(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Event not found.',
      }));
    });
  });
});
