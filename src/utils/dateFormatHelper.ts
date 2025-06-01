import { Request } from 'express';

/**
 * Helper function to normalize different date formats in requests
 * Prend en charge les formats suivants :
 * - EVED_START/EVED_END (format ISO)
 * - DATE_START/START_TIME/DATE_END/END_TIME (split format)
 * - date/startTime/endTime (format used in some tests, single day event)
 * - dateStart/startTime/dateEnd/endTime (extended format for multi-day events)
 */
export function normalizeRequestDates(req: Request): {
  EVED_START: string | undefined;
  EVED_END: string | undefined;
} {
  let evedStart = req.body.EVED_START;
  let evedEnd = req.body.EVED_END; // Use camelCase internally

  // Support for extended format with dateStart/dateEnd for multi-day events
  if (req.body.dateStart && req.body.startTime) {
    evedStart = new Date(`${req.body.dateStart}T${req.body.startTime}:00Z`).toISOString();
    req.body.DATE_START = req.body.dateStart;
    req.body.START_TIME = req.body.startTime;
  }
  if (req.body.dateEnd && req.body.endTime) {
    evedEnd = new Date(`${req.body.dateEnd}T${req.body.endTime}:00Z`).toISOString();
    req.body.DATE_END = req.body.dateEnd;
    req.body.END_TIME = req.body.endTime;
  }

  // Support for original format (date, startTime, endTime) - single day event
  // If dateStart/dateEnd are not provided but date is
  if (!req.body.dateStart && req.body.date && req.body.startTime) {
    evedStart = new Date(`${req.body.date}T${req.body.startTime}:00Z`).toISOString();
    // Add fields expected by tests
    req.body.DATE_START = req.body.date;
    req.body.START_TIME = req.body.startTime;
  }
  if (!req.body.dateEnd && req.body.date && req.body.endTime) {
    evedEnd = new Date(`${req.body.date}T${req.body.endTime}:00Z`).toISOString();
    // Add fields expected by tests
    req.body.DATE_END = req.body.date;
    req.body.END_TIME = req.body.endTime;
  }

  // Support pour le format standard (DATE_START, START_TIME, DATE_END, END_TIME)
  if (req.body.DATE_START && req.body.START_TIME && !evedStart) {
    evedStart = new Date(`${req.body.DATE_START}T${req.body.START_TIME}:00Z`).toISOString();
  }
  if (req.body.DATE_END && req.body.END_TIME && !evedEnd) {
    evedEnd = new Date(`${req.body.DATE_END}T${req.body.END_TIME}:00Z`).toISOString();
  }

  // Keep EVED_START/EVED_END for DB/API contract
  return { EVED_START: evedStart, EVED_END: evedEnd };
}
