import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

/**
 * Middleware to load an event by its ID and place it in req.event
 * Used for routes that manipulate a specific event
 */
export async function loadEvent(req: Request, res: Response, next: NextFunction) {
  const eventId = Number(req.params.id);
  if (!eventId) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }
  try {
    const event = await prisma.event.findUnique({ where: { EVEN_ID: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    req.event = event;
    next();
  } catch (err) {
    next(err);
  }
}
