// Tests pour améliorer la couverture de code de eventController.js

// Mock des dépendances
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('Event Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockEventRepository;
  let eventController;

  beforeEach(() => {
    // Réinitialiser les mocks
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

    // Mock de console.error pour éviter les logs pendant les tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Importer le contrôleur d'événements
    eventController = require('../controllers/eventController');
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      // Configurer le mock pour retourner des événements
      const mockEvents = [{ evenId: 1, evecLib: 'Test Event' }];
      mockEventRepository.find.mockResolvedValue(mockEvents);

      // Appeler la fonction getEvents
      await eventController.getEvents(mockRequest, mockResponse);

      // Vérifier que la fonction find a été appelée
      expect(mockEventRepository.find).toHaveBeenCalled();

      // Vérifier que la réponse est correcte
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle errors', async () => {
      // Configurer le mock pour simuler une erreur
      const error = new Error('Database error');
      mockEventRepository.find.mockRejectedValue(error);

      // Appeler la fonction getEvents
      await eventController.getEvents(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des événements.',
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '1' };

      // Configurer le mock pour retourner un événement
      const mockEvent = { evenId: 1, evecLib: 'Test Event' };
      mockEventRepository.findOneBy.mockResolvedValue(mockEvent);

      // Appeler la fonction getEventById
      await eventController.getEventById(mockRequest, mockResponse);

      // Vérifier que la fonction findOneBy a été appelée avec le bon ID
      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ evenId: 1 });

      // Vérifier que la réponse est correcte
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event not found', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '999' };

      // Configurer le mock pour retourner null (événement non trouvé)
      mockEventRepository.findOneBy.mockResolvedValue(null);

      // Appeler la fonction getEventById
      await eventController.getEventById(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Événement non trouvé.' });
    });

    it('should handle errors', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '1' };

      // Configurer le mock pour simuler une erreur
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      // Appeler la fonction getEventById
      await eventController.getEventById(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      // Configurer le corps de la requête
      const eventData = { evecLib: 'New Event' };
      mockRequest.body = eventData;

      // Configurer les mocks pour create et save
      const createdEvent = { evenId: 1, ...eventData };
      mockEventRepository.create.mockReturnValue(eventData);
      mockEventRepository.save.mockResolvedValue(createdEvent);

      // Appeler la fonction createEvent
      await eventController.createEvent(mockRequest, mockResponse);

      // Vérifier que les fonctions create et save ont été appelées
      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(eventData);

      // Vérifier que la réponse est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdEvent);
    });

    it('should handle errors', async () => {
      // Configurer le corps de la requête
      mockRequest.body = { evecLib: 'New Event' };

      // Configurer le mock pour simuler une erreur
      const error = new Error('Database error');
      mockEventRepository.save.mockRejectedValue(error);

      // Appeler la fonction createEvent
      await eventController.createEvent(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      // Configurer les paramètres et le corps de la requête
      mockRequest.params = { id: '1' };
      const updateData = { evecLib: 'Updated Event' };
      mockRequest.body = updateData;

      // Configurer les mocks pour findOneBy, merge et save
      const existingEvent = { evenId: 1, evecLib: 'Original Event' };
      const updatedEvent = { ...existingEvent, ...updateData };
      mockEventRepository.findOneBy.mockResolvedValue(existingEvent);
      mockEventRepository.save.mockResolvedValue(updatedEvent);

      // Appeler la fonction updateEvent
      await eventController.updateEvent(mockRequest, mockResponse);

      // Vérifier que les fonctions findOneBy, merge et save ont été appelées
      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ evenId: 1 });
      expect(mockEventRepository.merge).toHaveBeenCalledWith(existingEvent, updateData);
      expect(mockEventRepository.save).toHaveBeenCalled();

      // Vérifier que la réponse est correcte
      expect(mockResponse.json).toHaveBeenCalledWith(updatedEvent);
    });

    it('should return 404 if event not found', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '999' };

      // Configurer le mock pour retourner null (événement non trouvé)
      mockEventRepository.findOneBy.mockResolvedValue(null);

      // Appeler la fonction updateEvent
      await eventController.updateEvent(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Événement non trouvé.' });
    });

    it('should handle errors', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '1' };

      // Configurer le mock pour simuler une erreur
      const error = new Error('Database error');
      mockEventRepository.findOneBy.mockRejectedValue(error);

      // Appeler la fonction updateEvent
      await eventController.updateEvent(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '1' };

      // Configurer le mock pour retourner un résultat de suppression
      mockEventRepository.delete.mockResolvedValue({ affected: 1 });

      // Appeler la fonction deleteEvent
      await eventController.deleteEvent(mockRequest, mockResponse);

      // Vérifier que la fonction delete a été appelée avec le bon ID
      expect(mockEventRepository.delete).toHaveBeenCalledWith({ evenId: 1 });

      // Vérifier que la réponse est correcte
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Événement supprimé.' });
    });

    it('should return 404 if event not found', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '999' };

      // Configurer le mock pour retourner un résultat sans ligne affectée
      mockEventRepository.delete.mockResolvedValue({ affected: 0 });

      // Appeler la fonction deleteEvent
      await eventController.deleteEvent(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Événement non trouvé.' });
    });

    it('should handle errors', async () => {
      // Configurer les paramètres de la requête
      mockRequest.params = { id: '1' };

      // Configurer le mock pour simuler une erreur
      const error = new Error('Database error');
      mockEventRepository.delete.mockRejectedValue(error);

      // Appeler la fonction deleteEvent
      await eventController.deleteEvent(mockRequest, mockResponse);

      // Vérifier que la réponse d'erreur est correcte
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
