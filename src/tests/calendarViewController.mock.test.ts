import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

// Mock du module prisma
jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Importer le mock après la définition du mock
import prismaMock from '../prisma';

// Importer les contrôleurs après avoir configuré les mocks
import {
  getEventsForDay,
  getEventsForWeek,
  getEventsForMonth,
} from '../controllers/calendarViewController';

// Typer correctement le mock pour éviter les erreurs TypeScript
const typedPrismaMock = prismaMock as unknown as DeepMockProxy<PrismaClient>;

describe('Calendar View Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockReset(typedPrismaMock);

    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getEventsForDay', () => {
    it('should return events for a specific day', async () => {
      // Arrange
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-01T10:00:00Z'),
          EVED_END: new Date('2025-05-01T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = { date: '2025-05-01' };
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEventsForDay(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            EVED_START: expect.anything(),
          }),
          orderBy: expect.objectContaining({ EVED_START: 'asc' }),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(String),
          events: expect.arrayContaining(
            mockEvents.map((e) =>
              expect.objectContaining({
                ...e,
                EVED_START:
                  e.EVED_START instanceof Date ? e.EVED_START.toISOString() : e.EVED_START,
                EVED_END: e.EVED_END instanceof Date ? e.EVED_END.toISOString() : e.EVED_END,
              }),
            ),
          ),
        }),
      );
    });

    it('should return 400 if date is missing', async () => {
      // Arrange
      mockRequest.query = {};

      // Act
      await getEventsForDay(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('date is required'),
        }),
      );
      expect(typedPrismaMock.event.findMany).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Arrange
      mockRequest.query = { date: '2025-05-01' };
      typedPrismaMock.event.findMany.mockRejectedValue(new Error('Database error'));

      // Act
      await getEventsForDay(mockRequest as Request, mockResponse as Response);

      // Assert
      // Peut être 400 (validation) ou 500 (erreur technique)
      expect(mockResponse.status as jest.Mock).toHaveBeenCalledTimes(1);
      const callArg = (mockResponse.status as jest.Mock).mock.calls[0][0];
      expect([400, 500]).toContain(callArg);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });
  });

  describe('getEventsForWeek', () => {
    it('should return events for a specific week', async () => {
      // Arrange
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-05T10:00:00Z'),
          EVED_END: new Date('2025-05-05T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Test Event 2',
          EVED_START: new Date('2025-05-07T14:00:00Z'),
          EVED_END: new Date('2025-05-07T16:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = { week: '19', year: '2025' };
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEventsForWeek(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            EVED_START: expect.anything(),
          }),
          orderBy: expect.objectContaining({ EVED_START: 'asc' }),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          week: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          events: expect.arrayContaining(
            mockEvents.map((e) =>
              expect.objectContaining({
                ...e,
                EVED_START:
                  e.EVED_START instanceof Date ? e.EVED_START.toISOString() : e.EVED_START,
                EVED_END: e.EVED_END instanceof Date ? e.EVED_END.toISOString() : e.EVED_END,
              }),
            ),
          ),
        }),
      );
    });

    it('should return 400 if date, week, or year is missing', async () => {
      // Arrange
      mockRequest.query = { year: '2025' }; // week and date are missing

      // Act
      await getEventsForWeek(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Either date'),
        }),
      );
      expect(typedPrismaMock.event.findMany).not.toHaveBeenCalled();
    });

    it('should accept date parameter instead of week/year', async () => {
      // Arrange
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-05T10:00:00Z'),
          EVED_END: new Date('2025-05-05T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = { date: '2025-05-05' }; // Using date instead of week/year
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEventsForWeek(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          week: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          events: expect.any(Array),
        }),
      );
    });

    it('should handle errors', async () => {
      // Arrange
      mockRequest.query = { week: '19', year: '2025' };
      typedPrismaMock.event.findMany.mockRejectedValue(new Error('Database error'));

      // Act
      await getEventsForWeek(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status as jest.Mock).toHaveBeenCalledTimes(1);
      const callArg = (mockResponse.status as jest.Mock).mock.calls[0][0];
      expect([400, 500]).toContain(callArg);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });
  });

  describe('getEventsForMonth', () => {
    it('should return events for a specific month', async () => {
      // Arrange
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-10T10:00:00Z'),
          EVED_END: new Date('2025-05-10T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Test Event 2',
          EVED_START: new Date('2025-05-20T14:00:00Z'),
          EVED_END: new Date('2025-05-20T16:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = { month: '5', year: '2025' };
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEventsForMonth(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            EVED_START: expect.anything(),
          }),
          orderBy: expect.objectContaining({ EVED_START: 'asc' }),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          month: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          daysInMonth: expect.any(Number),
          events: expect.arrayContaining(
            mockEvents.map((e) =>
              expect.objectContaining({
                ...e,
                EVED_START:
                  e.EVED_START instanceof Date ? e.EVED_START.toISOString() : e.EVED_START,
                EVED_END: e.EVED_END instanceof Date ? e.EVED_END.toISOString() : e.EVED_END,
              }),
            ),
          ),
        }),
      );
    });

    it('should return 400 if date, month, or year is missing', async () => {
      // Arrange
      mockRequest.query = { year: '2025' }; // month and date are missing

      // Act
      await getEventsForMonth(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Either date'),
        }),
      );
      expect(typedPrismaMock.event.findMany).not.toHaveBeenCalled();
    });

    it('should accept date parameter instead of month/year', async () => {
      // Arrange
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-10T10:00:00Z'),
          EVED_END: new Date('2025-05-10T12:00:00Z'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = { date: '2025-05-10' }; // Using date instead of month/year
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEventsForMonth(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          month: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          daysInMonth: expect.any(Number),
          events: expect.any(Array),
        }),
      );
    });

    it('should handle errors', async () => {
      // Arrange
      mockRequest.query = { month: '5', year: '2025' };
      typedPrismaMock.event.findMany.mockRejectedValue(new Error('Database error'));

      // Act
      await getEventsForMonth(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status as jest.Mock).toHaveBeenCalledTimes(1);
      const callArg = (mockResponse.status as jest.Mock).mock.calls[0][0];
      expect([400, 500]).toContain(callArg);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });
  });
});
