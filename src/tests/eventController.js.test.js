// Test pour améliorer la couverture de dist/controllers/eventController.js

// Mock des dépendances
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('Event Controller (JS version)', () => {
  let mockRequest;
  let mockResponse;
  let mockEventRepository;
  let eventController;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurer les mocks pour Request et Response
    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Configurer le mock pour le repository
    mockEventRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    // Configurer le mock pour AppDataSource.getRepository
    const { AppDataSource } = require('../data-source');
    AppDataSource.getRepository.mockReturnValue(mockEventRepository);

    // Importer le contrôleur d'événements compilé
    eventController = require('../controllers/eventController');
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [{ EVEN_ID: 1, evecLib: 'Test Event' }];
      mockEventRepository.find.mockResolvedValue(mockEvents);

      await eventController.getEvents(mockRequest, mockResponse);

      expect(mockEventRepository.find).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockEventRepository.find.mockRejectedValue(error);

      await eventController.getEvents(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des événements.',
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      mockRequest.params = { id: '1' };
      const mockEvent = { EVEN_ID: 1, evecLib: 'Test Event' };
      mockEventRepository.findOneBy.mockResolvedValue(mockEvent);

      await eventController.getEventById(mockRequest, mockResponse);

      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findOneBy.mockResolvedValue(null);

      await eventController.getEventById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      await eventController.getEventById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la récupération de l'événement.",
      });
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = {
        EVEC_LIB: 'New Event',
        EVED_START: '2025-01-01',
        EVED_END: '2025-01-02',
        USEN_ID: 1,
        ACCN_ID: 1,
      };
      mockRequest.body = eventData;
      const createdEvent = { EVEN_ID: 1, ...eventData };

      mockEventRepository.create.mockReturnValue({ ...eventData });
      mockEventRepository.save.mockImplementation((obj) => {
        return { ...obj, EVEN_ID: 1 };
      });

      await eventController.createEvent(mockRequest, mockResponse);

      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(eventData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ ...eventData, EVEN_ID: 1 });
    });

    it('should handle errors', async () => {
      mockRequest.body = { evecLib: 'New Event' };
      const error = new Error('Database error');
      mockEventRepository.save.mockRejectedValue(error);

      await eventController.createEvent(mockRequest, mockResponse);

      expect([400, 404, 500]).toContain(mockResponse.status.mock.calls[0][0]);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      mockRequest.params = { id: '1' };
      const updateData = { EVEC_LIB: 'Updated Event' };
      mockRequest.body = updateData;

      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: '2025-01-01',
        EVED_END: '2025-01-02',
        USEN_ID: 1,
        ACCN_ID: 1,
      };
      const updatedEvent = { ...existingEvent, ...updateData };

      mockEventRepository.findOneBy.mockResolvedValue(existingEvent);
      mockEventRepository.merge.mockImplementation((obj, update) => {
        Object.assign(obj, update);
      });
      mockEventRepository.save.mockImplementation((obj) => ({ ...obj }));

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockEventRepository.merge).toHaveBeenCalledWith(existingEvent, updateData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(existingEvent);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedEvent);
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findOneBy.mockResolvedValue(null);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors during find', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la mise à jour de l'événement.",
      });
    });

    it('should handle errors during save', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { EVEC_LIB: 'Updated Event' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockResolvedValue({ EVEN_ID: 1 });
      mockEventRepository.save.mockRejectedValue(error);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la mise à jour de l'événement.",
      });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockRequest.params = { id: '1' };
      mockEventRepository.delete.mockResolvedValue({ affected: 1 });

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockEventRepository.delete).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Événement supprimé.' });
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.delete.mockResolvedValue({ affected: 0 });

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.delete.mockRejectedValue(error);

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la suppression de l'événement.",
      });
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findOneBy.mockResolvedValue(null);

      await eventController.getEventById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      await eventController.getEventById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la récupération de l'événement.",
      });
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = {
        EVEC_LIB: 'New Event',
        EVED_START: '2025-01-01',
        EVED_END: '2025-01-02',
        USEN_ID: 1,
        ACCN_ID: 1,
      };
      mockRequest.body = eventData;
      const createdEvent = { EVEN_ID: 1, ...eventData };

      mockEventRepository.create.mockReturnValue({ ...eventData });
      mockEventRepository.save.mockImplementation((obj) => {
        return { ...obj, EVEN_ID: 1 };
      });

      await eventController.createEvent(mockRequest, mockResponse);

      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(eventData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ ...eventData, EVEN_ID: 1 });
    });

    it('should handle errors', async () => {
      mockRequest.body = { evecLib: 'New Event' };
      const error = new Error('Database error');
      mockEventRepository.save.mockRejectedValue(error);

      await eventController.createEvent(mockRequest, mockResponse);

      expect([400, 404, 500]).toContain(mockResponse.status.mock.calls[0][0]);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      mockRequest.params = { id: '1' };
      const updateData = { EVEC_LIB: 'Updated Event' };
      mockRequest.body = updateData;

      const existingEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'Original Event',
        EVED_START: '2025-01-01',
        EVED_END: '2025-01-02',
        USEN_ID: 1,
        ACCN_ID: 1,
      };
      const updatedEvent = { ...existingEvent, ...updateData };

      mockEventRepository.findOneBy.mockResolvedValue(existingEvent);
      mockEventRepository.merge.mockImplementation((obj, update) => {
        Object.assign(obj, update);
      });
      mockEventRepository.save.mockImplementation((obj) => ({ ...obj }));

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockEventRepository.merge).toHaveBeenCalledWith(existingEvent, updateData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(existingEvent);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedEvent);
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findOneBy.mockResolvedValue(null);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors during find', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la mise à jour de l'événement.",
      });
    });

    it('should handle errors during save', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { EVEC_LIB: 'Updated Event' };
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockResolvedValue({ EVEN_ID: 1 });
      mockEventRepository.save.mockRejectedValue(error);

      await eventController.updateEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la mise à jour de l'événement.",
      });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockRequest.params = { id: '1' };
      mockEventRepository.delete.mockResolvedValue({ affected: 1 });

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockEventRepository.delete).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Événement supprimé.' });
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.delete.mockResolvedValue({ affected: 0 });

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockEventRepository.delete.mockRejectedValue(error);

      await eventController.deleteEvent(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la suppression de l'événement.",
      });
    });
  });
});
