import { Request, Response } from 'express';
import { enrichEventWithDateTimeParts } from '../utils/dateUtils';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

// Mock the Prisma module
jest.mock('../../src/prisma', () => ({
  // Corrected path
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Import mock after mock definition
import prismaMock from '../../src/prisma'; // Corrected path

// Import controllers after configuring mocks
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getFilteredEvents,
} from '../controllers/eventController';

// Properly type the mock to avoid TypeScript errors
const typedPrismaMock = prismaMock as unknown as DeepMockProxy<PrismaClient>;

describe('Event Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset all mocks before each test
    mockReset(typedPrismaMock);
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-01T00:00:00.000Z'),
          EVED_END: new Date('2025-05-02T00:00:00.000Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      await getEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('getEventById', () => {
    it('should return an event when it exists', async () => {
      const mockEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      mockRequest.params = { id: '1' };

      typedPrismaMock.event.findUnique.mockResolvedValue(mockEvent);

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };

      typedPrismaMock.event.findUnique.mockResolvedValue(null);

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('createEvent', () => {
    it('should create an event when there are no conflicts', async () => {
      const mockEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'New Event',
        EVED_START: new Date('2025-06-01T00:00:00.000Z'),
        EVED_END: new Date('2025-06-02T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      mockRequest.body = {
        EVEC_LIB: 'New Event',
        DATE_START: '2025-06-01',
        START_TIME: '00:00',
        DATE_END: '2025-06-02',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Mock for hasEventConflict (no conflict)
      typedPrismaMock.event.findFirst.mockResolvedValue(null);

      // Mock for event creation
      typedPrismaMock.event.create.mockResolvedValue(mockEvent);

      // Act
      await createEvent(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      // Use toEqual instead of toHaveBeenCalledWith for a more flexible comparison
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should create an event even when there is a conflict (conflicts allowed)', async () => {
      const originalAllowConflicts = process.env.ALLOW_CONFLICTS;
      process.env.ALLOW_CONFLICTS = 'true';

      try {
        mockRequest.body = {
          EVEC_LIB: 'New Event',
          DATE_START: '2025-06-01',
          START_TIME: '00:00',
          DATE_END: '2025-06-02',
          END_TIME: '00:00',
          USEN_ID: 2,
          ACCN_ID: 2,
        };

        const mockEvent = {
          EVEN_ID: 1,
          EVEC_LIB: 'New Event',
          EVED_START: new Date('2025-06-01T00:00:00.000Z'),
          EVED_END: new Date('2025-06-02T00:00:00.000Z'),
          USEN_ID: 2,
          ACCN_ID: 2,
        };

        // Even with a conflict, the event should be created as conflicts are allowed
        typedPrismaMock.event.findFirst.mockResolvedValue({
          EVEN_ID: 2,
          EVEC_LIB: 'Existing Event',
          EVED_START: new Date('2025-06-01T00:00:00.000Z'),
          EVED_END: new Date('2025-06-02T00:00:00.000Z'),
          USEN_ID: 2,
          ACCN_ID: 2,
        });

        typedPrismaMock.event.create.mockResolvedValue(mockEvent);

        // Act
        await createEvent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(typedPrismaMock.event.create).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalled();
      } finally {
        process.env.ALLOW_CONFLICTS = originalAllowConflicts;
      }
    });
  });

  describe('updateEvent', () => {
    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        DATE_START: '2025-06-03',
        START_TIME: '00:00',
        DATE_END: '2025-06-04',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      typedPrismaMock.event.findUnique.mockResolvedValue(null);

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Event not found.',
      });
    });

    it('should update an event when there are no conflicts', async () => {
      const eventId = 1;
      mockRequest.params = { id: eventId.toString() };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        DATE_START: '2025-06-03',
        START_TIME: '00:00',
        DATE_END: '2025-06-04',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      const existingEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const updatedMockEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03T00:00:00.000Z'),
        EVED_END: new Date('2025-06-04T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      typedPrismaMock.event.findUnique.mockResolvedValue(existingEvent);
      typedPrismaMock.event.findFirst.mockResolvedValue(null); // Pas de conflit
      typedPrismaMock.event.update.mockResolvedValue(updatedMockEvent);

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should update an event even when there is a conflict (conflicts allowed)', async () => {
      const eventId = 1;
      mockRequest.params = { id: eventId.toString() };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        DATE_START: '2025-06-03',
        START_TIME: '00:00',
        DATE_END: '2025-06-04',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      const existingEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Existing Event',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const updatedEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03T00:00:00.000Z'),
        EVED_END: new Date('2025-06-04T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Even with a conflict, the event should be updated as conflicts are allowed
      typedPrismaMock.event.findUnique.mockResolvedValue(existingEvent);
      typedPrismaMock.event.findFirst.mockResolvedValue({
        EVEN_ID: 2,
        EVEC_LIB: 'Conflict Event',
        EVED_START: new Date('2025-06-03T00:00:00.000Z'),
        EVED_END: new Date('2025-06-04T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });
      typedPrismaMock.event.update.mockResolvedValue(updatedEvent);

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event when it exists', async () => {
      const eventId = 1;
      mockRequest.params = { id: eventId.toString() };

      typedPrismaMock.event.findUnique.mockResolvedValue({
        EVEN_ID: eventId,
        EVEC_LIB: 'Event to Delete',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });

      typedPrismaMock.event.delete.mockResolvedValue({
        EVEN_ID: eventId,
        EVEC_LIB: 'Event to Delete',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.delete).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };

      typedPrismaMock.event.findUnique.mockResolvedValue(null);

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Event not found.',
      });
    });
  });

  describe('getFilteredEvents', () => {
    it('should return filtered events by user', async () => {
      mockRequest.query = {
        userId: '1',
      };

      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'User Event',
          EVED_START: new Date('2025-05-01T00:00:00.000Z'),
          EVED_END: new Date('2025-05-02T00:00:00.000Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return filtered events by date range', async () => {
      mockRequest.query = {
        startDate: '2025-06-15',
        endDate: '2025-06-16',
      };

      const mockEvents = [
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Date Range Event',
          EVED_START: new Date('2025-06-15T00:00:00.000Z'),
          EVED_END: new Date('2025-06-16T00:00:00.000Z'),
          USEN_ID: 2,
          ACCN_ID: 2,
        },
      ];

      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockRequest.query = {
        startDate: 'invalid-date',
      };

      typedPrismaMock.event.findMany.mockRejectedValue(new Error('Invalid date format'));

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
