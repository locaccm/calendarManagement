import { getFilteredEvents, getEvents, getEventById, createEvent, updateEvent, deleteEvent } from './eventController';
import { AppDataSource } from '../data-source';

jest.mock('../data-source');

describe('eventController', () => {
  let req: any;
  let res: any;
  let mockRepo: any;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);
    jest.clearAllMocks();
  });

  // --- getFilteredEvents ---
  describe('getFilteredEvents', () => {
    it('should return all events if no filter', async () => {
      const events = [{ EVEN_ID: 1 }, { EVEN_ID: 2 }];
      mockRepo.find.mockResolvedValue(events);
      await getFilteredEvents(req, res);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: {} });
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should filter by usager', async () => {
      req.query.usager = '5';
      const events = [{ EVEN_ID: 1, USEN_ID: 5 }];
      mockRepo.find.mockResolvedValue(events);
      await getFilteredEvents(req, res);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { USEN_ID: 5 } });
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should filter by logement', async () => {
      req.query.logement = '2';
      const events = [{ EVEN_ID: 1, ACCN_ID: 2 }];
      mockRepo.find.mockResolvedValue(events);
      await getFilteredEvents(req, res);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { ACCN_ID: 2 } });
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should filter by dateStart and dateEnd', async () => {
      req.query.dateStart = '2025-05-01';
      req.query.dateEnd = '2025-05-31';
      const events = [{ EVEN_ID: 1, EVED_START: '2025-05-10' }];
      mockRepo.find.mockResolvedValue(events);
      await getFilteredEvents(req, res);
      expect(mockRepo.find.mock.calls[0][0].where.EVED_START).toBeDefined();
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should filter by multiple fields', async () => {
      req.query = { usager: '5', logement: '2', dateStart: '2025-05-01', dateEnd: '2025-05-31' };
      const events = [{ EVEN_ID: 1, USEN_ID: 5, ACCN_ID: 2, EVED_START: '2025-05-10' }];
      mockRepo.find.mockResolvedValue(events);
      await getFilteredEvents(req, res);
      expect(mockRepo.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should handle error', async () => {
      mockRepo.find.mockRejectedValue(new Error('fail'));
      await getFilteredEvents(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // --- getEvents ---
  describe('getEvents', () => {
    it('should return all events', async () => {
      const events = [{ EVEN_ID: 1 }, { EVEN_ID: 2 }];
      mockRepo.find.mockResolvedValue(events);
      await getEvents(req, res);
      expect(mockRepo.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(events);
    });
    it('should handle error', async () => {
      mockRepo.find.mockRejectedValue(new Error('fail'));
      await getEvents(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // --- getEventById ---
  describe('getEventById', () => {
    it('should return event by id', async () => {
      req.params.id = '1';
      const event = { EVEN_ID: 1 };
      mockRepo.findOneBy.mockResolvedValue(event);
      await getEventById(req, res);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(res.json).toHaveBeenCalledWith(event);
    });
    it('should return 404 if event not found', async () => {
      req.params.id = '1';
      mockRepo.findOneBy.mockResolvedValue(undefined);
      await getEventById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
    it('should handle error', async () => {
      req.params.id = '1';
      mockRepo.findOneBy.mockRejectedValue(new Error('fail'));
      await getEventById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // --- createEvent ---
  describe('createEvent', () => {
    it('should create event', async () => {
      const event = { EVEN_ID: 1 };
      mockRepo.create.mockReturnValue(event);
      mockRepo.save.mockResolvedValue(event);
      req.body = { EVEC_LIB: 'Test', EVED_START: '2025-05-01', EVED_END: '2025-05-02', USEN_ID: 1, ACCN_ID: 2 };
      await createEvent(req, res);
      expect(mockRepo.create).toHaveBeenCalledWith(req.body);
      expect(mockRepo.save).toHaveBeenCalledWith(event);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(event);
    });
    it('should handle error', async () => {
      mockRepo.create.mockImplementation(() => { throw new Error('fail'); });
      await createEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // --- updateEvent ---
  describe('updateEvent', () => {
    it('should update event', async () => {
      req.params.id = '1';
      const event = { EVEN_ID: 1 };
      mockRepo.findOneBy.mockResolvedValue(event);
      mockRepo.merge.mockReturnValue(undefined);
      mockRepo.save.mockResolvedValue(event);
      req.body = { EVEC_LIB: 'Updated' };
      await updateEvent(req, res);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(mockRepo.merge).toHaveBeenCalledWith(event, req.body);
      expect(mockRepo.save).toHaveBeenCalledWith(event);
      expect(res.json).toHaveBeenCalledWith(event);
    });
    it('should return 404 if event not found', async () => {
      req.params.id = '1';
      mockRepo.findOneBy.mockResolvedValue(undefined);
      await updateEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
    it('should handle error', async () => {
      req.params.id = '1';
      mockRepo.findOneBy.mockRejectedValue(new Error('fail'));
      await updateEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // --- deleteEvent ---
  describe('deleteEvent', () => {
    it('should delete event', async () => {
      req.params.id = '1';
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      await deleteEvent(req, res);
      expect(mockRepo.delete).toHaveBeenCalledWith({ EVEN_ID: 1 });
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    it('should return 404 if event not found', async () => {
      req.params.id = '1';
      mockRepo.delete.mockResolvedValue({ affected: 0 });
      await deleteEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
    it('should handle error', async () => {
      req.params.id = '1';
      mockRepo.delete.mockRejectedValue(new Error('fail'));
      await deleteEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});
