import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const events = await eventRepo.find();
    res.json(events);
  } catch (error: unknown) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error while retrieving events.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error: unknown) {
    console.error(`Error fetching event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error while retrieving the event.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = eventRepo.create(req.body);
    const savedEvent = await eventRepo.save(event);
    res.status(201).json(savedEvent);
  } catch (error: unknown) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error while creating the event.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    eventRepo.merge(event, req.body);
    const savedEvent = await eventRepo.save(event);
    res.json(savedEvent);
  } catch (error: unknown) {
    console.error(`Error updating event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error while updating the event.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const result = await eventRepo.delete({ EVEN_ID: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (error: unknown) {
    console.error(`Error deleting event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error while deleting the event.' });
  }
};
