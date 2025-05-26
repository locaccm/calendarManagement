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
    eventController = require('../../dist/controllers/eventController');
  });
  
  describe('getEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [{ EVEN_ID: 1, EVEC_LIB: 'Test Event' }];
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
    });
  });
  
  describe('getEventById', () => {
    it('should return an event by id', async () => {
      mockRequest.params = { id: '1' };
      const mockEvent = { EVEN_ID: 1, EVEC_LIB: 'Test Event' };
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
    });
  });
  
  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = { EVEC_LIB: 'New Event' };
      mockRequest.body = eventData;
      const createdEvent = { EVEN_ID: 1, ...eventData };
      
      mockEventRepository.create.mockReturnValue(eventData);
      mockEventRepository.save.mockResolvedValue(createdEvent);
      
      await eventController.createEvent(mockRequest, mockResponse);
      
      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(eventData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdEvent);
    });
    
    it('should handle errors', async () => {
      mockRequest.body = { EVEC_LIB: 'New Event' };
      const error = new Error('Database error');
      mockEventRepository.save.mockRejectedValue(error);
      
      await eventController.createEvent(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
  
  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      mockRequest.params = { id: '1' };
      const updateData = { EVEC_LIB: 'Updated Event' };
      mockRequest.body = updateData;
      
      const existingEvent = { EVEN_ID: 1, EVEC_LIB: 'Original Event' };
      const updatedEvent = { ...existingEvent, ...updateData };
      
      mockEventRepository.findOneBy.mockResolvedValue(existingEvent);
      mockEventRepository.save.mockResolvedValue(updatedEvent);
      
      await eventController.updateEvent(mockRequest, mockResponse);
      
      expect(mockEventRepository.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockEventRepository.merge).toHaveBeenCalledWith(existingEvent, updateData);
      expect(mockEventRepository.save).toHaveBeenCalled();
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
    });
    
    it('should handle errors during save', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { EVEC_LIB: 'Updated Event' };
      
      mockEventRepository.findOneBy.mockResolvedValue({ EVEN_ID: 1 });
      const error = new Error('Database error');
      mockEventRepository.save.mockRejectedValue(error);
      
      await eventController.updateEvent(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
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
    });
  });
});
