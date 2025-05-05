import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
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

// GET /events/filter?usager=1&logement=2&dateStart=2025-05-01&dateEnd=2025-05-31
export const getFilteredEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const { usager, logement, dateStart, dateEnd } = req.query;
    const where: any = {};
    if (usager) where.USEN_ID = Number(usager);
    if (logement) where.ACCN_ID = Number(logement);
    if (dateStart && dateEnd) {
      where.EVED_START = Between(dateStart, dateEnd);
    } else if (dateStart) {
      where.EVED_START = MoreThanOrEqual(dateStart);
    } else if (dateEnd) {
      where.EVED_START = LessThanOrEqual(dateEnd);
    }
    const events = await eventRepo.find({ where });
    res.json(events);
  } catch (error) {
    handleError(res, 'Erreur lors du filtrage des événements.');
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
