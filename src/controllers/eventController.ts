import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

function handleError(res: Response, message: string, error?: unknown) {
  // Log the error for debugging purposes
  if (error) {
    console.error(`${message} Details:`, error);
  }
  res.status(500).json({ error: message });
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const events = await eventRepo.find();
    res.json(events);
  } catch (error) {
    handleError(res, 'Error while retrieving events.', error);
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error) {
    handleError(res, 'Error while retrieving the event.', error);
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = eventRepo.create(req.body);
    await eventRepo.save(event);
    res.status(201).json(event);
  } catch (error) {
    handleError(res, 'Error while creating the event.', error);
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    eventRepo.merge(event, req.body);
    await eventRepo.save(event);
    res.json(event);
  } catch (error) {
    handleError(res, 'Error while updating the event.', error);
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const result = await eventRepo.delete({ EVEN_ID: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    handleError(res, 'Error while deleting the event.', error);
  }
};
