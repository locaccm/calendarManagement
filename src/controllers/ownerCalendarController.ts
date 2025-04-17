import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { OwnerCalendar } from '../models/OwnerCalendar';

export const getOwnerCalendars = async (_req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(OwnerCalendar);
    const calendars = await repo.find();
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du calendrier propriétaire.' });
  }
};

export const getOwnerCalendarById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(OwnerCalendar);
    const calendar = await repo.findOneBy({ id: Number(req.params.id) });
    if (!calendar) return res.status(404).json({ error: 'Calendrier non trouvé.' });
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du calendrier.' });
  }
};

export const createOwnerCalendar = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(OwnerCalendar);
    const calendar = repo.create(req.body);
    await repo.save(calendar);
    res.status(201).json(calendar);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du calendrier.' });
  }
};

export const updateOwnerCalendar = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(OwnerCalendar);
    const calendar = await repo.findOneBy({ id: Number(req.params.id) });
    if (!calendar) return res.status(404).json({ error: 'Calendrier non trouvé.' });
    repo.merge(calendar, req.body);
    await repo.save(calendar);
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du calendrier.' });
  }
};

export const deleteOwnerCalendar = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(OwnerCalendar);
    const result = await repo.delete({ id: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ error: 'Calendrier non trouvé.' });
    res.json({ message: 'Calendrier supprimé.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du calendrier.' });
  }
};
