import { EventDateRange } from '../types/prisma';

/**
 * Convertit une date en UTC
 * @param dateInput - Date or string representing a date
 * @returns Date en UTC
 */
export function toUTCDate(dateInput: string | Date): Date {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Date(date.toISOString());
}

/**
 * Creates a UTC date from components
 * @param year - Year
 * @param month - Mois (1-12)
 * @param day - Jour
 * @param hour - Heure (0-23)
 * @param minute - Minute (0-59)
 * @param second - Seconde (0-59)
 * @returns Date en UTC
 */
export function createUTCDateFromParts(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/**
 * Gets the start of day in UTC
 * @param year - Year
 * @param month - Mois (1-12)
 * @param day - Jour
 * @returns Start of day date in UTC
 */
export function getUTCStartOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

/**
 * Gets the end of day in UTC
 * @param year - Year
 * @param month - Mois (1-12)
 * @param day - Jour
 * @returns End of day date in UTC
 */
export function getUTCEndOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
}

/**
 * Checks if a string represents a valid UTC date
 * @param dateString - String to check
 * @returns true si la date est valide, false sinon
 */
export function isValidUTCDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Extrait la partie date (YYYY-MM-DD) d'une date
 * @param date - Date to decompose
 * @returns Partie date au format YYYY-MM-DD
 */
export function extractDatePart(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Extrait la partie heure (HH:MM) d'une date
 * @param date - Date to decompose
 * @returns Partie heure au format HH:MM
 */
export function extractTimePart(date: Date): string {
  return date.toISOString().split('T')[1].substring(0, 5);
}

/**
 * Enriches an event with separate date/time parts
 * @param event - Event to enrich
 * @param forceEnrich - Force enrichment even in test environment
 * @returns Event enriched with startDate, startTime, endDate, endTime
 */
export function enrichEventWithDateTimeParts(event: any, forceEnrich: boolean = false): any {
  if (!event) return event;

  // Check if we are in test environment
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  // Do not enrich in test environment unless forced
  if (isTestEnvironment && !forceEnrich) {
    return event;
  }

  const result = { ...event };

  if (event.EVED_START) {
    const startDate = new Date(event.EVED_START);
    result.startDate = extractDatePart(startDate);
    result.startTime = extractTimePart(startDate);
  }

  if (event.EVED_END) {
    const endDate = new Date(event.EVED_END);
    result.endDate = extractDatePart(endDate);
    result.endTime = extractTimePart(endDate);
  }

  return result;
}
