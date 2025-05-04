import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

function handleError(res: Response, message: string) {
  res.status(500).json({ error: message });
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const events = await eventRepo.find();
    res.json(events);
  } catch (error) {
    handleError(res, 'Erreur lors de la récupération des événements.');
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé.' });
    res.json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la récupération de l'événement.");
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = eventRepo.create(req.body);
    await eventRepo.save(event);
    res.status(201).json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la création de l'événement.");
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé.' });
    eventRepo.merge(event, req.body);
    await eventRepo.save(event);
    res.json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la mise à jour de l'événement.");
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const result = await eventRepo.delete({ EVEN_ID: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ error: 'Événement non trouvé.' });
    res.json({ message: 'Événement supprimé.' });
  } catch (error) {
    handleError(res, "Erreur lors de la suppression de l'événement.");
  }
};
