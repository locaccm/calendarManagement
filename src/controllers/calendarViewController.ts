import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

// Helper to get events between two dates
import { Between, Equal } from 'typeorm';

async function getEventsBetween(start: string, end: string) {
  const eventRepo = AppDataSource.getRepository(Event);
  const where = start === end
    ? { EVED_START: Equal(start) }
    : { EVED_START: Between(start, end) };
  return eventRepo.find({
    where,
    order: { EVED_START: 'ASC' },
  });
}

export const getEventsForDay = async (req: Request, res: Response) => {
  console.log('[getEventsForDay] Handler entered');
  if (!req.query || typeof req.query !== 'object') {
    console.log('[getEventsForDay] Invalid req.query:', req.query);
    return res.status(400).json({ error: 'Invalid query object' });
  }
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  console.log('[getEventsForDay] Before validation:', { date, typeofDate: typeof date, reqQuery: req.query });
  if (!date || date.trim() === '') {
    console.log('[getEventsForDay] About to return 400 for missing/invalid date', { date });
    return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  }
  try {
    console.log('[getEventsForDay] About to call getEventsBetween');
    const events = await getEventsBetween(date, date);
    console.log('[getEventsForDay] Events fetched:', events);
    return res.json(events);
  } catch (err) {
    console.error('[getEventsForDay] Exception in getEventsBetween:', err);
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForWeek = async (req: Request, res: Response) => {
  console.log('[getEventsForWeek] Handler entered');
  if (!req.query || typeof req.query !== 'object') {
    console.log('[getEventsForWeek] Invalid req.query:', req.query);
    return res.status(400).json({ error: 'Invalid query object' });
  }
  const week = typeof req.query.week === 'string' ? req.query.week : undefined;
  const year = typeof req.query.year === 'string' ? req.query.year : undefined;
  console.log('[getEventsForWeek] Before validation:', { week, typeofWeek: typeof week, year, typeofYear: typeof year, reqQuery: req.query });
  if (!week || week.trim() === '' || !year || year.trim() === '') {
    console.log('[getEventsForWeek] About to return 400 for missing/invalid week/year', { week, year });
    return res.status(400).json({ error: 'week and year are required' });
  }
  try {
    const firstDay = getDateOfISOWeek(Number(week), Number(year));
    const start = firstDay.toISOString().slice(0, 10);
    const endDate = new Date(firstDay);
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().slice(0, 10);
    console.log('[getEventsForWeek] About to call getEventsBetween', { start, end });
    const events = await getEventsBetween(start, end);
    console.log('[getEventsForWeek] Events fetched:', events);
    return res.json(events);
  } catch (err) {
    console.error('[getEventsForWeek] Exception in getEventsBetween:', err);
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

export const getEventsForMonth = async (req: Request, res: Response) => {
  console.log('[getEventsForMonth] Handler entered');
  if (!req.query || typeof req.query !== 'object') {
    console.log('[getEventsForMonth] Invalid req.query:', req.query);
    return res.status(400).json({ error: 'Invalid query object' });
  }
  const month = typeof req.query.month === 'string' ? req.query.month : undefined;
  const year = typeof req.query.year === 'string' ? req.query.year : undefined;
  console.log('[getEventsForMonth] Before validation:', { month, typeofMonth: typeof month, year, typeofYear: typeof year, reqQuery: req.query });
  if (!month || month.trim() === '' || !year || year.trim() === '') {
    console.log('[getEventsForMonth] About to return 400 for missing/invalid month/year', { month, year });
    return res.status(400).json({ error: 'month and year are required' });
  }
  try {
    const monthNum = Number(month);
    const yearNum = Number(year);
    const start = `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-01`;
    const endDate = new Date(yearNum, monthNum, 0); // last day of month
    const end = endDate.toISOString().slice(0, 10);
    console.log('[getEventsForMonth] About to call getEventsBetween', { start, end });
    const events = await getEventsBetween(start, end);
    console.log('[getEventsForMonth] Events fetched:', events);
    return res.json(events);
  } catch (err) {
    console.error('[getEventsForMonth] Exception in getEventsBetween:', err);
    return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
  }
};

// Helper: get first day of ISO week
function getDateOfISOWeek(week: number, year: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}
