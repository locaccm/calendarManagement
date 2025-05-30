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

// Helpers to transform Prisma results into strict Events (all fields non-null)
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

    // Add metadata to facilitate front-end implementation
    const result = {
      date: date,
      events: events,
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForWeek = async (req: Request, res: Response) => {
  // Accepter soit week/year, soit une date dans la semaine
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  let week = typeof req.query.week === 'string' ? req.query.week : undefined;
  let year = typeof req.query.year === 'string' ? req.query.year : undefined;

  let firstDay: Date;

  // If date is provided, calculate week and year from the date
  if (isValidDateString(date)) {
    const dateObj = new Date(date!);
    const weekInfo = getISOWeekAndYear(dateObj);
    week = String(weekInfo.week);
    year = String(weekInfo.year);
    firstDay = getDateOfISOWeek(weekInfo.week, weekInfo.year);
  } else if (!week || !year || isNaN(Number(week)) || isNaN(Number(year))) {
    return res
      .status(400)
      .json({ error: 'Either date (YYYY-MM-DD) or week and year are required' });
  } else {
    firstDay = getDateOfISOWeek(Number(week), Number(year));
  }

  const start = firstDay.toISOString().slice(0, 10);
  const endDate = new Date(firstDay);
  endDate.setDate(endDate.getDate() + 6);
  const end = endDate.toISOString().slice(0, 10);

  try {
    const events: Event[] = await getEventsBetween(start, end);

    // Generate an array of week days to facilitate display
    const days = [];
    const currentDate = new Date(firstDay);
    for (let i = 0; i < 7; i++) {
      days.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add metadata to facilitate front-end implementation
    const result = {
      week: Number(week),
      year: Number(year),
      startDate: start,
      endDate: end,
      days: days,
      events: events,
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForMonth = async (req: Request, res: Response) => {
  // Accepter soit month/year, soit une date dans le mois
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  let month = typeof req.query.month === 'string' ? req.query.month : undefined;
  let year = typeof req.query.year === 'string' ? req.query.year : undefined;

  let monthNum: number;
  let yearNum: number;

  // If date is provided, extract month and year
  if (isValidDateString(date)) {
    const dateObj = new Date(date!);
    monthNum = dateObj.getMonth() + 1; // getMonth() retourne 0-11
    yearNum = dateObj.getFullYear();
    month = String(monthNum);
    year = String(yearNum);
  } else if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
    return res
      .status(400)
      .json({ error: 'Either date (YYYY-MM-DD) or month and year are required' });
  } else {
    monthNum = Number(month);
    yearNum = Number(year);
  }

  try {
    const start = `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-01`;

    // Dernier jour du mois
    const endDate = new Date(yearNum, monthNum, 0);
    const end = endDate.toISOString().slice(0, 10);

    const events: Event[] = await getEventsBetween(start, end);

    // Generate an array of month days to facilitate display
    const days = [];
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
      );
    }

    // Add metadata to facilitate front-end implementation
    const result = {
      month: monthNum,
      year: yearNum,
      startDate: start,
      endDate: end,
      daysInMonth: daysInMonth,
      days: days,
      events: events,
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

// Helper: get first day of ISO week
function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

function getISOWeekAndYear(date: Date): { week: number; year: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  // Return array of year and week number
  return { week: weekNo, year: d.getFullYear() };
}
