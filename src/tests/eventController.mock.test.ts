import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

// Mock du module prisma
jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));
// Correction : forcer le reset des mocks entre chaque test pour éviter les pollutions d'état.

// Importer le mock après la définition du mock
import prismaMock from '../prisma';

// Importer les contrôleurs après avoir configuré les mocks
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getFilteredEvents,
} from '../controllers/eventController';

// Typer correctement le mock pour éviter les erreurs TypeScript
const typedPrismaMock = prismaMock as unknown as DeepMockProxy<PrismaClient>;

describe('Event Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockReset(typedPrismaMock);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'Test Event 1',
          EVED_START: new Date('2025-05-01'),
          EVED_END: new Date('2025-05-02'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      typedPrismaMock.event.count.mockResolvedValue(1);
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getEvents(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findMany).toHaveBeenCalled();
      // Vérifier que la réponse contient les données paginées avec les événements
      expect(mockResponse.json).toHaveBeenCalledWith(
        mockEvents.map((e) => expect.objectContaining({
          ...e,
          EVED_START: e.EVED_START.toISOString(),
          EVED_END: e.EVED_END.toISOString(),
        })),
      );
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';

      mockRequest.query = {
        page: '1',
        limit: '10',
      };
      typedPrismaMock.event.findMany.mockRejectedValue(new Error(errorMessage));

      // Act
      await getEvents(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des événements.',
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event when it exists', async () => {
      const mockEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: new Date('2025-05-01'),
        EVED_END: new Date('2025-05-02'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      mockRequest.params = { id: '1' };
      typedPrismaMock.event.findUnique.mockResolvedValue(mockEvent);

      // Act
      await getEventById(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findUnique).toHaveBeenCalledWith({
        where: { EVEN_ID: 1 },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...mockEvent,
        EVED_START: mockEvent.EVED_START.toISOString(),
        EVED_END: mockEvent.EVED_END.toISOString(),
      }));
    });

    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };
      typedPrismaMock.event.findUnique.mockResolvedValue(null);

      // Act
      await getEventById(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Événement non trouvé.',
      });
    });
  });

  describe('createEvent', () => {
    it('should create an event when there are no conflicts', async () => {
      const mockEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'New Event',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      mockRequest.body = {
        EVEC_LIB: 'New Event',
        startDate: '2025-06-01',
        startTime: '00:00',
        endDate: '2025-06-02',
        endTime: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Mock pour hasEventConflict (pas de conflit)
      typedPrismaMock.event.count.mockResolvedValue(0);

      // Mock pour la création d'événement
      typedPrismaMock.event.create.mockResolvedValue(mockEvent);

      // Act
      await createEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...mockEvent,
        EVED_START: mockEvent.EVED_START.toISOString(),
        EVED_END: mockEvent.EVED_END.toISOString(),
      }));
    });

    it('should return 409 when there is a conflict', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        startDate: '2025-06-01',
        startTime: '00:00',
        endDate: '2025-06-02',
        endTime: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Mock pour hasEventConflict (conflit détecté)
      typedPrismaMock.event.count.mockResolvedValue(1);
      // Mock findFirst pour simuler un conflit
      typedPrismaMock.event.findFirst.mockResolvedValue({
        EVEN_ID: 123,
        EVEC_LIB: 'Conflit',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });

      // Mock pour les événements existants (pour suggestAlternativeSlots)
      typedPrismaMock.event.findMany.mockResolvedValue([
        {
          EVEN_ID: 3,
          EVEC_LIB: 'Existing Event',
          EVED_START: new Date('2025-06-01'),
          EVED_END: new Date('2025-06-02'),
          USEN_ID: 2,
          ACCN_ID: 2,
        },
      ]);

      // Act
      await createEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error:
            'Conflit: un événement existe déjà pour ce logement ou cet utilisateur sur ce créneau.',
          alternatives: expect.any(Array),
        }),
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event when there are no conflicts', async () => {
      const eventId = 1;
      const mockEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Existing Event',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      const updatedMockEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03'),
        EVED_END: new Date('2025-06-04'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      mockRequest.params = { id: eventId.toString() };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03'),
        EVED_END: new Date('2025-06-04'),
        USEN_ID: 2,
        ACCN_ID: 2,
        startDate: '2025-06-03',
        startTime: '00:00',
        endDate: '2025-06-04',
        endTime: '00:00',
      };

      // Mock pour la récupération de l'événement existant
      typedPrismaMock.event.findUnique.mockResolvedValue(mockEvent);
      // Mock pour hasEventConflict (pas de conflit)
      typedPrismaMock.event.count.mockResolvedValue(0);
      // Mock findFirst pour simuler aucun conflit
      typedPrismaMock.event.findFirst.mockResolvedValue(null);
      // Mock pour la mise à jour de l'événement
      typedPrismaMock.event.update.mockResolvedValue(updatedMockEvent);

      // Act
      await updateEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findUnique).toHaveBeenCalledWith({
        where: { EVEN_ID: eventId },
      });

      expect(typedPrismaMock.event.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...updatedMockEvent,
        EVED_START: updatedMockEvent.EVED_START.toISOString(),
        EVED_END: updatedMockEvent.EVED_END.toISOString(),
      }));
    });

    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03'),
        EVED_END: new Date('2025-06-04'),
        USEN_ID: 2,
        ACCN_ID: 2,
        startDate: '2025-06-03',
        startTime: '00:00',
        endDate: '2025-06-04',
        endTime: '00:00',
      };

      // Mock pour la récupération de l'événement existant (non trouvé)
      typedPrismaMock.event.findUnique.mockResolvedValue(null);

      // Act
      await updateEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findUnique).toHaveBeenCalled();
      expect(typedPrismaMock.event.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Événement non trouvé.',
      });
    });

    it('should return 409 when there is a conflict', async () => {
      const eventId = 1;
      const mockEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Existing Event',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      mockRequest.params = { id: eventId.toString() };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03'),
        EVED_END: new Date('2025-06-04'),
        USEN_ID: 2,
        ACCN_ID: 2,
        startDate: '2025-06-03',
        startTime: '00:00',
        endDate: '2025-06-04',
        endTime: '00:00',
      };

      // Mock pour la récupération de l'événement existant
      typedPrismaMock.event.findUnique.mockResolvedValue(mockEvent);
      // Mock pour hasEventConflict (conflit détecté)
      typedPrismaMock.event.count.mockResolvedValue(1);
      // Mock findFirst pour simuler un conflit
      typedPrismaMock.event.findFirst.mockResolvedValue({
        EVEN_ID: 123,
        EVEC_LIB: 'Conflit',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });
      // Mock pour les événements existants (pour suggestAlternativeSlots)
      typedPrismaMock.event.findMany.mockResolvedValue([
        {
          EVEN_ID: 3,
          EVEC_LIB: 'Conflicting Event',
          EVED_START: new Date('2025-06-03'),
          EVED_END: new Date('2025-06-04'),
          USEN_ID: 2,
          ACCN_ID: 2,
        },
      ]);

      // Act
      await updateEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findUnique).toHaveBeenCalled();

      expect(typedPrismaMock.event.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Conflit'),
          alternatives: expect.any(Array),
        }),
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an existing event', async () => {
      const eventId = 1;
      mockRequest.params = { id: eventId.toString() };

      // Mock pour vérifier l'existence de l'événement
      typedPrismaMock.event.count.mockResolvedValue(1);
      // Mock findUnique pour simuler un événement existant
      typedPrismaMock.event.findUnique.mockResolvedValue({
        EVEN_ID: eventId,
        EVEC_LIB: 'Deleted Event',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });
      // Mock pour la suppression de l'événement
      typedPrismaMock.event.delete.mockResolvedValue({
        EVEN_ID: eventId,
        EVEC_LIB: 'Deleted Event',
        EVED_START: new Date('2025-06-01'),
        EVED_END: new Date('2025-06-02'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });

      // Act
      await deleteEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.delete).toHaveBeenCalledWith({
        where: { EVEN_ID: eventId },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Événement supprimé.',
      });
    });

    it('should return 404 when event does not exist', async () => {
      mockRequest.params = { id: '999' };

      // Mock pour vérifier l'existence de l'événement (non trouvé)
      typedPrismaMock.event.count.mockResolvedValue(0);

      // Act
      await deleteEvent(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(typedPrismaMock.event.findUnique).toHaveBeenCalledWith({ where: { EVEN_ID: 999 } });
      expect(typedPrismaMock.event.delete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Événement non trouvé.',
      });
    });
  });

  describe('getFilteredEvents', () => {
    it('should return filtered events by user', async () => {
      const mockEvents = [
        {
          EVEN_ID: 1,
          EVEC_LIB: 'User Event',
          EVED_START: new Date('2025-05-01'),
          EVED_END: new Date('2025-05-02'),
          USEN_ID: 1,
          ACCN_ID: 1,
        },
      ];

      mockRequest.query = {
        usager: '1',
        page: '1',
        limit: '10',
      };

      typedPrismaMock.event.count.mockResolvedValue(1);
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getFilteredEvents(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert

      expect(typedPrismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            USEN_ID: 1,
          }),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        mockEvents.map((e) => expect.objectContaining({
          ...e,
          EVED_START: e.EVED_START.toISOString(),
          EVED_END: e.EVED_END.toISOString(),
        })),
      );
    });

    it('should return filtered events by date range', async () => {
      const mockEvents = [
        {
          EVEN_ID: 2,
          EVEC_LIB: 'Date Range Event',
          EVED_START: new Date('2025-06-15'),
          EVED_END: new Date('2025-06-16'),
          USEN_ID: 2,
          ACCN_ID: 2,
        },
      ];

      mockRequest.query = {
        dateStart: '2025-06-15',
        dateEnd: '2025-06-16',
        page: '1',
        limit: '10',
      };

      typedPrismaMock.event.count.mockResolvedValue(1);
      typedPrismaMock.event.findMany.mockResolvedValue(mockEvents);

      // Act
      await getFilteredEvents(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert

      expect(typedPrismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            EVED_START: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      // Correction : le contrôleur renvoie un tableau simple d'événements, donc on vérifie directement
      expect(mockResponse.json).toHaveBeenCalledWith(
        mockEvents.map((e) => expect.objectContaining({
          ...e,
          EVED_START: e.EVED_START.toISOString(),
          EVED_END: e.EVED_END.toISOString(),
        })),
      );
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      mockRequest.query = {
        usager: '1',
        page: '1',
        limit: '10',
      };
      typedPrismaMock.event.count.mockRejectedValue(new Error(errorMessage));

      // Act
      await getFilteredEvents(mockRequest as Request, mockResponse as Response, jest.fn());

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors du filtrage des événements.',
      });
    });
  });
});
