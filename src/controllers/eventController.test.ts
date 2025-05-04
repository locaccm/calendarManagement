import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from './eventController';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

jest.mock('../data-source');

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('eventController', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = {};
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      const events = [{ EVEN_ID: 1 }];
      (AppDataSource.getRepository as any).mockReturnValue({
        find: jest.fn().mockResolvedValue(events),
      });
      await getEvents(req, res);
      expect(res.json).toHaveBeenCalledWith(events);
    });

    it('should handle error', async () => {
      (AppDataSource.getRepository as any).mockReturnValue({
        find: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await getEvents(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      req.params = { id: '1' };
      const event = { EVEN_ID: 1 };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockResolvedValue(event),
      });
      await getEventById(req, res);
      expect(res.json).toHaveBeenCalledWith(event);
    });

    it('should return 404 if event not found', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockResolvedValue(undefined),
      });
      await getEventById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle error', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await getEventById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      req.body = { EVEN_ID: 1 };
      (AppDataSource.getRepository as any).mockReturnValue({
        create: jest.fn().mockReturnValue(req.body),
        save: jest.fn().mockResolvedValue(req.body),
      });
      await createEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it('should handle error', async () => {
      req.body = { EVEN_ID: 1 };
      (AppDataSource.getRepository as any).mockReturnValue({
        create: jest.fn().mockReturnValue(req.body),
        save: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await createEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      req.params = { id: '1' };
      req.body = { EVEN_ID: 1, EVEC_LIB: 'test' };
      const event = { EVEN_ID: 1 };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockResolvedValue(event),
        merge: jest.fn(),
        save: jest.fn().mockResolvedValue(event),
      });
      await updateEvent(req, res);
      expect(res.json).toHaveBeenCalledWith(event);
    });

    it('should return 404 if event not found', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockResolvedValue(undefined),
      });
      await updateEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle error', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        findOneBy: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await updateEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      });
      await deleteEvent(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Événement supprimé.' });
    });

    it('should return 404 if event not found', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        delete: jest.fn().mockResolvedValue({ affected: 0 }),
      });
      await deleteEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle error', async () => {
      req.params = { id: '1' };
      (AppDataSource.getRepository as any).mockReturnValue({
        delete: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await deleteEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
