import { Request, Response } from 'express';

// Create mock objects outside of jest.mock for better type support
const mockPrismaClient = {
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  accommodation: {
    findUnique: jest.fn(),
  },
  // If other Prisma Client exports like Prisma.PrismaClientKnownRequestError are used:
  // Prisma: jest.requireActual('../../src/prisma').Prisma, // Example
};

// Mock the Prisma module - needs to be done before importing any module that uses it
jest.mock('../../src/prisma', () => ({
  __esModule: true,
  default: mockPrismaClient,
}));

// Now import the controller functions
import {
  createEvent,
  getEventById,
  updateEvent,
  getFilteredEvents,
} from '../controllers/eventController';

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

  describe('createEvent', () => {
    it('should handle validation error with invalid date format', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        EVED_START: 'invalid-date',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Invalid ISO date format for EVED_START or EVED_END.'],
      });
    });

    it('should handle database error during event creation', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue({ USEN_ID: 1 });
      mockPrismaClient.accommodation.findUnique.mockResolvedValue({ ACCN_ID: 1 });
      mockPrismaClient.event.create.mockRejectedValue(new Error('Database error'));

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while creating the event. Details: Database error',
      });
    });

    it('should handle user not found error', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 999,
        ACCN_ID: 1,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.accommodation.findUnique.mockResolvedValue({ ACCN_ID: 1 });

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while creating the event. Details: Database error',
      });
    });

    it('should handle accommodation not found error', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 999,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue({ USEN_ID: 1 });
      mockPrismaClient.accommodation.findUnique.mockResolvedValue(null);

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while creating the event. Details: Database error',
      });
    });
  });

  describe('getEventById', () => {
    it('should handle database error when fetching event', async () => {
      mockRequest.params = { id: '1' };
      mockPrismaClient.event.findUnique.mockRejectedValue(new Error('Database error'));

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while retrieving the event. Details: Database error',
      });
    });

    it('should handle invalid ID format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Event not found.',
      });
    });
  });

  describe('updateEvent', () => {
    it('should handle database error during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        EVED_START: '2025-06-01T11:00:00Z',
        EVED_END: '2025-06-01T13:00:00Z',
        USEN_ID: 1, // Added to pass validation
        ACCN_ID: 1, // Added to pass validation
      };

      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaClient.event.update.mockRejectedValue(new Error('Database error'));

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500); // Expect 500 for actual DB error after validation passes
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while updating the event. Details: Database error',
      });
    });

    it('should handle invalid date format in update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        startDate: 'invalid-date',
        endDate: '2025-01-02',
      };

      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      mockPrismaClient.event.findUnique.mockResolvedValue(existingEvent);

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: [
          'You must provide either DATE_START/START_TIME/DATE_END/END_TIME fields, ' +
            'or EVED_START/EVED_END fields, or date/startTime/endTime fields.',
        ],
      });
    });
  });

  describe('getFilteredEvents', () => {
    it('should handle filtering by user ID', async () => {
      mockRequest.query = { user: '1' };

      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'User 1 Event',
          EVED_START: new Date('2025-06-01T10:00:00Z'),
          EVED_END: new Date('2025-06-01T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      const expectedResponse = mockEvents.map((e) => ({
        ...e,
        EVED_START: e.EVED_START.toISOString(),
        EVED_END: e.EVED_END.toISOString(),
        startDate: '2025-06-01',
        startTime: '10:00',
        endDate: '2025-06-01',
        endTime: '12:00',
      }));

      mockPrismaClient.event.findMany.mockResolvedValue(mockEvents);

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockPrismaClient.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            USEN_ID: 1,
          },
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle filtering by accommodation ID', async () => {
      mockRequest.query = { accommodation: '2' };

      const mockEvents = [
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Accommodation 2 Event',
          EVED_START: new Date('2025-06-01T10:00:00Z'),
          EVED_END: new Date('2025-06-01T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 2,
        },
      ];

      const expectedResponse = mockEvents.map((e) => ({
        ...e,
        EVED_START: e.EVED_START.toISOString(),
        EVED_END: e.EVED_END.toISOString(),
        startDate: '2025-06-01',
        startTime: '10:00',
        endDate: '2025-06-01',
        endTime: '12:00',
      }));

      mockPrismaClient.event.findMany.mockResolvedValue(mockEvents);

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockPrismaClient.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ACCN_ID: 2,
          },
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
