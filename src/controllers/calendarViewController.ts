import { Request, Response } from 'express';
import prisma from '../prisma';
import { Event } from '../models/Event';

// Helper de validation de date (YYYY-MM-DD)
function isValidDateString(date: string | undefined): boolean {
  return !!date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

async function getEventsBetween(start: string, end: string): Promise<Event[]> {
  const where =
    start === end
      ? { EVED_START: new Date(start) }
      : {
          EVED_START: {
            gte: new Date(start),
            lte: new Date(end),
          },
        };
  const prismaEvents = await prisma.event.findMany({
    where,
    orderBy: { EVED_START: 'asc' },
  });
  return sanitizeEvents(prismaEvents);
}

// Helpers pour transformer les résultats Prisma en Event stricts (tous les champs non-nuls)
function sanitizeEvent(prismaEvent: any): Event {
  return {
    EVEN_ID: prismaEvent.EVEN_ID!,
    EVEC_LIB: prismaEvent.EVEC_LIB ?? '',
    EVED_START: prismaEvent.EVED_START ? new Date(prismaEvent.EVED_START).toISOString() : '',
    EVED_END: prismaEvent.EVED_END ? new Date(prismaEvent.EVED_END).toISOString() : '',
    USEN_ID: prismaEvent.USEN_ID ?? 0,
    ACCN_ID: prismaEvent.ACCN_ID ?? 0,
  };
}
function sanitizeEvents(events: any[]): Event[] {
  return events.map(sanitizeEvent);
}

export const getEventsForDay = async (req: Request, res: Response) => {
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  if (!isValidDateString(date)) {
    return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  }
  try {
    const events: Event[] = await getEventsBetween(date!, date!);
    return res.json(events);
  } catch (err: any) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message || 'Validation error' });
    }
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForWeek = async (req: Request, res: Response) => {
  const week = typeof req.query.week === 'string' ? req.query.week : undefined;
  const year = typeof req.query.year === 'string' ? req.query.year : undefined;
  if (!week || !year || isNaN(Number(week)) || isNaN(Number(year))) {
    return res.status(400).json({ error: 'week and year are required as numbers' });
  }
  try {
    const firstDay = getDateOfISOWeek(Number(week), Number(year));
    const start = firstDay.toISOString().slice(0, 10);
    const endDate = new Date(firstDay);
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().slice(0, 10);
    const events: Event[] = await getEventsBetween(start, end);
    return res.json(events);
  } catch (err: any) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message || 'Validation error' });
    }
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForMonth = async (req: Request, res: Response) => {
  const month = typeof req.query.month === 'string' ? req.query.month : undefined;
  const year = typeof req.query.year === 'string' ? req.query.year : undefined;
  if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
    return res.status(400).json({ error: 'month and year are required as numbers' });
  }
  try {
    const monthNum = Number(month);
    const yearNum = Number(year);
    const start = `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-01`;
    const endDate = new Date(yearNum, monthNum, 0); // last day of month
    const end = endDate.toISOString().slice(0, 10);
    const events: Event[] = await getEventsBetween(start, end);
    return res.json(events);
  } catch (err: any) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message || 'Validation error' });
    }
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

// Helper: get first day of ISO week
function getDateOfISOWeek(week: number, year: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}
