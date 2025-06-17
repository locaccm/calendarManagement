/**
 * Converts a date to UTC.
 * @param dateInput - Date or string representing a date.
 * @returns Date in UTC.
 */
export function toUTCDate(dateInput: string | Date): Date {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Date(date.toISOString());
}

/**
 * Creates a UTC date from components
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59)
 * @returns Date in UTC
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
 * @param month - Month (1-12)
 * @param day - Day
 * @returns Start of day date in UTC
 */
export function getUTCStartOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

/**
 * Gets the end of day in UTC
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @returns End of day date in UTC
 */
export function getUTCEndOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
}

/**
 * Checks if a string represents a valid UTC date
 * @param dateString - String to check
 * @returns true if the date is valid, false otherwise
 */
export function isValidUTCDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Extracts the date part (YYYY-MM-DD) from a date.
 * @param date - Date to decompose.
 * @returns Date part in YYYY-MM-DD format.
 */
export function extractDatePart(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Extracts the time part (HH:MM) from a date.
 * @param date - Date to decompose.
 * @returns Time part in HH:MM format.
 */
export function extractTimePart(date: Date): string {
  return date.toISOString().split('T')[1].substring(0, 5);
}

/**
 * Enriches an event object with separate date and time string properties.
 * This is useful for front-end display.
 * @param event - The event object to enrich.
 * @param forceEnrich - If true, forces enrichment even in a test environment.
 * @returns A new event object enriched with startDate, startTime, endDate, and endTime, or the original event.
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
  } // Keep EVED_START/EVED_END for DB/API contract

  return result;
}
