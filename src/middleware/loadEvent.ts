import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

/**
 * Middleware pour charger un événement par son ID et le placer dans req.event
 * Utilisé pour les routes qui manipulent un événement spécifique
 */
export async function loadEvent(req: Request, res: Response, next: NextFunction) {
  const eventId = Number(req.params.id);
  if (!eventId) {
    return res.status(400).json({ error: "ID d'événement invalide" });
  }
  try {
    const event = await prisma.event.findUnique({ where: { EVEN_ID: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    req.event = event;
    next();
  } catch (err) {
    next(err);
  }
}
