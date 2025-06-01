import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  sanitizeEvent,
  getFilteredEvents,
} from '../controllers/eventController';

// Mock the Prisma module
jest.mock('../prisma', () => {
  return {
    __esModule: true,
    default: {
      event: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  };
});

// Get the mocked prisma client
const prismaClientMock = jest.requireMock('../prisma').default;

// Mock Express request and response
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let mockNext: jest.Mock;

describe('Event Controller Unit Tests', () => {
  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };

    mockNext = jest.fn();
    // Reset all mocks before each test
    Object.values(prismaClientMock.event).forEach((mockFn) => {
      // Cast to any to access Jest mock functions
      const mock = mockFn as any;
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    });
  });

  // --- Ajout de tests de couverture pour les validations et erreurs ---
  describe('Validation and error handling', () => {
    it('should return 400 if required fields are missing on createEvent', async () => {
      mockRequest.body = { EVEC_LIB: '', USEN_ID: null, ACCN_ID: null };
      await createEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation error' }),
      );
    });

    it('should return 400 if date fields are missing on createEvent', async () => {
      mockRequest.body = { EVEC_LIB: 'Test', USEN_ID: 1, ACCN_ID: 1 };
      await createEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation error' }),
      );
    });

    it('should return 500 if date fields are invalid on createEvent', async () => {
      mockRequest.body = {
        EVEC_LIB: 'Test',
        USEN_ID: 1,
        ACCN_ID: 1,
        DATE_START: 'invalid',
        START_TIME: 'invalid',
        DATE_END: 'invalid',
        END_TIME: 'invalid',
      };
      await createEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      // Optionally check for error object
      // expect(mockResponse.json).toHaveBeenCalledWith(
      //   expect.objectContaining({ error: expect.any(String) })
      // );
    });

    it('should return 404 if event does not exist on updateEvent', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        EVEC_LIB: 'Test',
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: '2025-01-01T10:00:00Z',
        EVED_END: '2025-01-01T12:00:00Z',
      };
      prismaClientMock.event.findUnique.mockResolvedValue(null);
      await updateEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Event not found.' }),
      );
    });

    it('should return 404 if event does not exist on deleteEvent', async () => {
      mockRequest.params = { id: '999' };
      prismaClientMock.event.findUnique.mockResolvedValue(null);
      await deleteEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Event not found.' }),
      );
    });

    it('should return 400 if updateEvent is called with missing required fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { EVEC_LIB: '', USEN_ID: null, ACCN_ID: null };
      prismaClientMock.event.findUnique.mockResolvedValue({ EVEN_ID: 1 });
      await updateEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation error' }),
      );
    });

    it('should return 500 if updateEvent is called with invalid date fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Test',
        USEN_ID: 1,
        ACCN_ID: 1,
        DATE_START: 'invalid',
        START_TIME: 'invalid',
        DATE_END: 'invalid',
        END_TIME: 'invalid',
      };
      prismaClientMock.event.findUnique.mockResolvedValue({ EVEN_ID: 1 });
      await updateEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      // Optionally check for error object
      // expect(mockResponse.json).toHaveBeenCalledWith(
      //   expect.objectContaining({ error: expect.any(String) })
      // );
    });
  });

  describe('sanitizeEvent', () => {
    it('should handle null date values', () => {
      const prismaEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: null,
        EVED_END: null,
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('Test Event');
      expect(result.EVED_START).toBe('');
      expect(result.EVED_END).toBe('');
    });

    it('should handle undefined date values', () => {
      const prismaEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('Test Event');
      expect(result.EVED_START).toBe('');
      expect(result.EVED_END).toBe('');
    });

    it('should handle invalid date values', () => {
      const prismaEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: 'invalid-date',
        EVED_END: 'invalid-date',
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('Test Event');
      expect(result.EVED_START).toBe('');
      expect(result.EVED_END).toBe('');
    });

    it('should handle Date objects', () => {
      const startDate = new Date('2025-06-01T10:00:00Z');
      const endDate = new Date('2025-06-01T12:00:00Z');
      const prismaEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: startDate,
        EVED_END: endDate,
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('Test Event');
      expect(result.EVED_START).toBe(startDate.toISOString());
      expect(result.EVED_END).toBe(endDate.toISOString());
    });

    it('should handle string date values', () => {
      const startDateStr = '2025-06-01T10:00:00Z';
      const endDateStr = '2025-06-01T12:00:00Z';
      const prismaEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: startDateStr,
        EVED_END: endDateStr,
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('Test Event');
      expect(result.EVED_START).toBe(new Date(startDateStr).toISOString());
      expect(result.EVED_END).toBe(new Date(endDateStr).toISOString());
    });

    it('should handle missing optional fields', () => {
      const prismaEvent = {
        EVEN_ID: 1,
        EVED_START: '2025-06-01T10:00:00Z',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      const result = sanitizeEvent(prismaEvent);
      expect(result).toBeDefined();
      expect(result.EVEN_ID).toBe(1);
      expect(result.EVEC_LIB).toBe('');
      expect(result.USEN_ID).toBe(0);
      expect(result.ACCN_ID).toBe(0);
    });
  });

  describe('sanitizeEvent with multiple events', () => {
    it('should sanitize multiple events manually', () => {
      const prismaEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Event 1',
          EVED_START: '2025-06-01T10:00:00Z',
          EVED_END: '2025-06-01T12:00:00Z',
          USEN_ID: 1,
          ACCN_ID: 1,
        },
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Event 2',
          EVED_START: null,
          EVED_END: null,
          USEN_ID: 2,
          ACCN_ID: 2,
        },
      ];

      const results = prismaEvents.map((event) => sanitizeEvent(event));
      expect(results.length).toBe(2);
      expect(results[0].EVEN_ID).toBe(1);
      expect(results[0].EVEC_LIB).toBe('Event 1');
      expect(results[0].EVED_START).toBe(new Date('2025-06-01T10:00:00Z').toISOString());
      expect(results[0].EVED_END).toBe(new Date('2025-06-01T12:00:00Z').toISOString());
      expect(results[1].EVEN_ID).toBe(2);
      expect(results[1].EVEC_LIB).toBe('Event 2');
      expect(results[1].EVED_START).toBe('');
      expect(results[1].EVED_END).toBe('');
    });

    it('should handle empty array', () => {
      const results = [].map((event) => sanitizeEvent(event));
      expect(results).toEqual([]);
    });
  });

  describe('getEvents error handling', () => {
    it('should handle database errors', async () => {
      prismaClientMock.event.findMany.mockRejectedValue(new Error('Database connection error'));

      await getEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error while retrieving events.' });
    });
  });

  describe('getEventById error handling', () => {
    it('should handle invalid ID format', async () => {
      mockRequest.params = { id: 'abc' };

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Event not found.' });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { id: '1' };
      prismaClientMock.event.findUnique.mockRejectedValue(new Error('Database connection error'));

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while retrieving the event.',
      });
    });
  });

  describe('createEvent validation', () => {
    it('should validate required fields', async () => {
      mockRequest.body = {
        // Missing EVEC_LIB
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: '2025-06-01T10:00:00Z',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['EVEC_LIB, USEN_ID et ACCN_ID sont requis.'],
      });
    });

    it('should validate date format with ISO dates', async () => {
      mockRequest.body = {
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: 'invalid-date',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['EVED_START ou EVED_END invalide(s).'],
      });
    });

    it('should validate date format with split dates', async () => {
      mockRequest.body = {
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        DATE_START: '2025-06-01',
        START_TIME: 'invalid-time',
        DATE_END: '2025-06-01',
        END_TIME: '12:00',
      };

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['DATE_START, START_TIME, DATE_END ou END_TIME invalide(s).'],
      });
    });

    it('should validate that either ISO or split dates are provided', async () => {
      mockRequest.body = {
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        // No date fields provided
      };

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: [
          'Il faut fournir soit les champs DATE_START/START_TIME/DATE_END/END_TIME, soit les champs EVED_START/EVED_END, soit les champs date/startTime/endTime.',
        ],
      });
    });

    it('should handle database errors during creation', async () => {
      mockRequest.body = {
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: '2025-06-01T10:00:00Z',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      prismaClientMock.event.create.mockRejectedValue(new Error('Database error'));

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error while creating the event.' });
    });
  });

  describe('updateEvent validation', () => {
    it('should validate required fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        // Empty EVEC_LIB
        EVEC_LIB: '',
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: '2025-06-01T10:00:00Z',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      prismaClientMock.event.findUnique.mockResolvedValue({
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['EVEC_LIB cannot be empty.'],
      });
    });

    it('should validate that either ISO or split dates are provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        // No date fields
      };

      prismaClientMock.event.findUnique.mockResolvedValue({
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: [
          'You must provide either DATE_START/START_TIME/DATE_END/END_TIME fields, or EVED_START/EVED_END fields.',
        ],
      });
    });

    it('should handle database errors during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        USEN_ID: 1,
        ACCN_ID: 1,
        EVED_START: '2025-06-01T10:00:00Z',
        EVED_END: '2025-06-01T12:00:00Z',
      };

      prismaClientMock.event.findUnique.mockResolvedValue({
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });

      prismaClientMock.event.update.mockRejectedValue(new Error('Database error'));

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error while updating the event.' });
    });
  });

  describe('deleteEvent error handling', () => {
    it('should handle invalid ID format', async () => {
      mockRequest.params = { id: 'abc' };

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Event not found.' });
    });

    it('should handle database errors during deletion', async () => {
      mockRequest.params = { id: '1' };
      prismaClientMock.event.findUnique.mockResolvedValue({
        EVEN_ID: 1,
        EVEC_LIB: 'Event to Delete',
        EVED_START: new Date('2025-06-01T10:00:00Z'),
        EVED_END: new Date('2025-06-01T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      });
      prismaClientMock.event.delete.mockRejectedValue(new Error('Database error'));

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error while deleting the event.' });
    });
  });

  describe('getFilteredEvents validation', () => {
    it('should validate user ID format', async () => {
      mockRequest.query = { usager: 'abc' };

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Invalid filter parameters.'],
      });
    });

    it('should validate accommodation ID format', async () => {
      mockRequest.query = { logement: 'abc' };

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Invalid filter parameters.'],
      });
    });

    it('should validate date format', async () => {
      mockRequest.query = { dateStart: 'invalid-date' };

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Invalid filter parameters.'],
      });
    });

    it('should handle all valid filter parameters', async () => {
      mockRequest.query = {
        usager: '1',
        logement: '2',
        dateStart: '2025-06-01',
        dateEnd: '2025-06-30',
      };

      prismaClientMock.event.findMany.mockResolvedValue([
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Filtered Event',
          EVED_START: new Date('2025-06-15T10:00:00Z'),
          EVED_END: new Date('2025-06-15T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 2,
        },
      ]);

      await getFilteredEvents(mockRequest as Request, mockResponse as Response);

      expect(prismaClientMock.event.findMany).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
