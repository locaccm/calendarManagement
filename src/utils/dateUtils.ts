import { EventDateRange } from '../types/prisma';

/**
 * Convertit une date en UTC
 * @param dateInput - Date ou chaîne de caractères représentant une date
 * @returns Date en UTC
 */
export function toUTCDate(dateInput: string | Date): Date {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Date(date.toISOString());
}

/**
 * Crée une date UTC à partir de composants
 * @param year - Année
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
 * Obtient le début de journée en UTC
 * @param year - Année
 * @param month - Mois (1-12)
 * @param day - Jour
 * @returns Date de début de journée en UTC
 */
export function getUTCStartOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

/**
 * Obtient la fin de journée en UTC
 * @param year - Année
 * @param month - Mois (1-12)
 * @param day - Jour
 * @returns Date de fin de journée en UTC
 */
export function getUTCEndOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
}

/**
 * Vérifie si une chaîne de caractères représente une date UTC valide
 * @param dateString - Chaîne de caractères à vérifier
 * @returns true si la date est valide, false sinon
 */
export function isValidUTCDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Extrait la partie date (YYYY-MM-DD) d'une date
 * @param date - Date à décomposer
 * @returns Partie date au format YYYY-MM-DD
 */
export function extractDatePart(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Extrait la partie heure (HH:MM) d'une date
 * @param date - Date à décomposer
 * @returns Partie heure au format HH:MM
 */
export function extractTimePart(date: Date): string {
  return date.toISOString().split('T')[1].substring(0, 5);
}

/**
 * Enrichit un événement avec des parties date/heure séparées
 * @param event - Événement à enrichir
 * @param forceEnrich - Force l'enrichissement même en environnement de test
 * @returns Événement enrichi avec startDate, startTime, endDate, endTime
 */
export function enrichEventWithDateTimeParts(event: any, forceEnrich: boolean = false): any {
  if (!event) return event;

  // Vérifier si nous sommes en environnement de test
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  // Ne pas enrichir en environnement de test sauf si forcé
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
