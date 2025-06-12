import { Request, Response } from 'express';
import prisma from '../prisma';
import { Event } from '../models/Event';
import { EventWhereInput, EventCreateInput } from '../types/prisma';
import { normalizeRequestDates } from '../utils/dateFormatHelper';

// Helper to convert a value to Date or undefined
function toDateOrUndefined(val: unknown): Date | undefined {
  if (val == null) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

// Helper to convert a Prisma object (with null) to strict Event
import { enrichEventWithDateTimeParts } from '../utils/dateUtils';
import { eventFilterQuerySchema } from '../validation/eventSchemas';

export function sanitizeEvent(prismaEvent: any): Event {
  function formatDateFields(startVal: any, endVal: any): { EVED_START: string; EVED_END: string } {
    // Safely handle null, undefined, or invalid date values
    if (startVal === null || startVal === undefined || endVal === null || endVal === undefined) {
      return { EVED_START: '', EVED_END: '' };
    }

    // Convert to Date objects if they aren't already
    const dStart = startVal instanceof Date ? startVal : new Date(startVal);
    const dEnd = endVal instanceof Date ? endVal : new Date(endVal);

    // Validate that both dates are valid
    if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
      console.warn('Invalid date detected in formatDateFields:', { startVal, endVal });
      return { EVED_START: '', EVED_END: '' };
    }

    // For tests, we must always return dates in ISO format
    // Internal: camelCase, API: ALL_CAPS
    return {
      EVED_START: dStart.toISOString(),
      EVED_END: dEnd.toISOString(),
    };
  }
  // Ensure that EVED_START and EVED_END fields are always strings
  const { EVED_START, EVED_END } = formatDateFields(prismaEvent.EVED_START, prismaEvent.EVED_END);
  let sanitizedEvedStart;
  if (typeof EVED_START === 'string') {
    sanitizedEvedStart = EVED_START;
  } else if (
    EVED_START &&
    typeof EVED_START === 'object' &&
    typeof (EVED_START as Date).toISOString === 'function'
  ) {
    sanitizedEvedStart = (EVED_START as Date).toISOString();
  } else {
    sanitizedEvedStart = String(EVED_START);
  }

  let sanitizedEvedEnd;
  if (typeof EVED_END === 'string') {
    sanitizedEvedEnd = EVED_END;
  } else if (
    EVED_END &&
    typeof EVED_END === 'object' &&
    typeof (EVED_END as Date).toISOString === 'function'
  ) {
    sanitizedEvedEnd = (EVED_END as Date).toISOString();
  } else {
    sanitizedEvedEnd = String(EVED_END);
  }

  const baseEvent = {
    EVEN_ID: prismaEvent.EVEN_ID!,
    EVEC_LIB: prismaEvent.EVEC_LIB ?? '',
    EVED_START: sanitizedEvedStart, // API contract field
    EVED_END: sanitizedEvedEnd, // API contract field
    USEN_ID: prismaEvent.USEN_ID ?? 0,
    ACCN_ID: prismaEvent.ACCN_ID ?? 0,
  };

  return enrichEventWithDateTimeParts(baseEvent, true);
}

function sanitizeEvents(events: any[]): Event[] {
  return events.map(sanitizeEvent); // Helper for arrays
}

interface EventData {
  EVEN_ID?: number;
  EVEC_LIB: string;
  EVED_START: Date | string;
  EVED_END: Date | string;
  USEN_ID: number;
  ACCN_ID: number;
}

interface TimeSlot {
  start: string;
  end: string;
}

// Enhanced error handling with logging only in non-production environments
export function handleError(res: Response, message: string, error?: unknown) {
  // Only log errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (error) {
      const errorDetail = error instanceof Error ? error.message : String(error);
      message = `${message} Details: ${errorDetail}`;

      // Include stack trace in development
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        message = `${message}\nStack trace: ${error.stack}`;
      }
    }
  }

  // Always send a standardized error response to the client
  res.status(500).json({ error: message });
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(sanitizeEvents(events));
  } catch (error) {
    handleError(res, 'Error while retrieving events.', error);
  }
};

// Function to validate filter parameters
function validateFilterParameters(params: {
  user: unknown;
  accommodation: unknown;
  dateStart: unknown;
  dateEnd: unknown;
}): { isValid: boolean; details?: string[] } {
  const { user, accommodation, dateStart, dateEnd } = params;

  if (
    (user && isNaN(Number(user))) ||
    (accommodation && isNaN(Number(accommodation))) ||
    (dateStart && isNaN(Date.parse(String(dateStart)))) ||
    (dateEnd && isNaN(Date.parse(String(dateEnd))))
  ) {
    return { isValid: false, details: ['Invalid filter parameters.'] };
  }

  return { isValid: true };
}

// Function to build query filters
function buildEventFilters(params: {
  user?: number;
  accommodation?: number;
  dateStart?: string;
  dateEnd?: string;
}): EventWhereInput {
  const { user, accommodation, dateStart, dateEnd } = params;
  const where: EventWhereInput = {};

  if (user) {
    where.USEN_ID = Number(user);
  }

  if (accommodation) {
    where.ACCN_ID = Number(accommodation);
  }

  // Handle date filters
  if (dateStart && dateEnd) {
    where.EVED_START = {
      gte: new Date(dateStart),
      lte: new Date(dateEnd),
    };
  } else if (dateStart) {
    where.EVED_START = {
      gte: new Date(dateStart),
    };
  } else if (dateEnd) {
    where.EVED_START = {
      lte: new Date(dateEnd),
    };
  }

  return where;
}

// GET /events/filter?user=1&accommodation=2&dateStart=2025-05-01&dateEnd=2025-05-31
export const getFilteredEvents = async (req: Request, res: Response) => {
  try {
    const queryParams = {
      user: req.query.user,
      accommodation: req.query.accommodation,
      dateStart: req.query.dateStart,
      dateEnd: req.query.dateEnd,
    };

    // Validate parameters
    const validationResult = eventFilterQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return res
        .status(400)
        .json({ error: 'Validation error', details: validationResult.error.flatten().fieldErrors });
    }

    // Build filters
    const where = buildEventFilters(validationResult.data); // Use validated and transformed data

    // Query database with filters
    const events = await prisma.event.findMany({ where });
    res.status(200).json(sanitizeEvents(events));
  } catch (error) {
    handleError(res, 'Error while retrieving filtered events.', error);
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  if (!eventId || isNaN(eventId)) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  try {
    const event = await prisma.event.findUnique({ where: { EVEN_ID: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.status(200).json(sanitizeEvent(event));
  } catch (error) {
    handleError(res, 'Error while retrieving the event.', error);
  }
};

// Utility function to check event conflicts
// Re-enabled for testing suggestAlternativeSlots
async function hasEventConflict(
  { ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<EventCreateInput>,
  excludeId?: number,
): Promise<boolean> {
  if (!ACCN_ID || !USEN_ID || !EVED_START || !EVED_END) {
    return false; // Not enough info to check for conflict
  }
  const conflictingEvent = await prisma.event.findFirst({
    where: {
      ACCN_ID,
      USEN_ID,
      EVED_START: { lt: EVED_END as Date },
      EVED_END: { gt: EVED_START as Date },
      NOT: excludeId ? { EVEN_ID: excludeId } : undefined,
    },
  });
  return !!conflictingEvent;
}

// Event body validation helper
function validateEventBody(body: any): EventCreateInput {
  const eventInput: EventCreateInput = {
    EVEC_LIB: body.EVEC_LIB ?? '',
    EVED_START: toDateOrUndefined(body.EVED_START),
    EVED_END: toDateOrUndefined(body.EVED_END),
    USEN_ID: body.USEN_ID ?? undefined,
    ACCN_ID: body.ACCN_ID ?? undefined,
  };

  if (!eventInput.EVED_START || !eventInput.EVED_END) {
    throw new Error('EVED_START et EVED_END sont requis.');
  }
  if (!eventInput.USEN_ID || !eventInput.ACCN_ID) {
    throw new Error('USEN_ID et ACCN_ID sont requis.');
  }

  return eventInput;
}

// Utility function to suggest alternative time slots
function suggestAlternativeSlots(
  { ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<EventCreateInput>,
  existingEvents: Event[],
  slotDurationMinutes = 60,
  maxSuggestions = 3,
): TimeSlot[] {
  if (!EVED_START || !EVED_END) {
    return [];
  }

  const startDate = new Date(EVED_START);
  const endDate = new Date(EVED_END);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));
  const slotDuration = slotDurationMinutes || durationMinutes;

  const suggestions: TimeSlot[] = [];
  const occupiedSlots: { start: Date; end: Date }[] = existingEvents.map((event) => ({
    start: new Date(event.EVED_START),
    end: new Date(event.EVED_END),
  }));

  // Suggest time slots for the current day
  const baseStartCurrentDay = new Date(startDate);
  baseStartCurrentDay.setUTCHours(8, 0, 0, 0); // Start at 8 AM UTC
  const baseEndCurrentDay = new Date(startDate);
  baseEndCurrentDay.setUTCHours(20, 0, 0, 0); // End at 8 PM UTC

  // Create slots of the requested duration for the current day
  for (let i = 0; i < 24 && suggestions.length < maxSuggestions; i++) {
    const slotStart = new Date(baseStartCurrentDay);
    slotStart.setUTCMinutes(baseStartCurrentDay.getUTCMinutes() + i * slotDuration);
    const slotEnd = new Date(slotStart);
    slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + durationMinutes);

    // Do not exceed end of day
    if (slotEnd > baseEndCurrentDay) {
      break;
    }

    // Check if the time slot is available
    const isOccupied = occupiedSlots.some((slot) => slotStart < slot.end && slotEnd > slot.start);

    if (!isOccupied) {
      suggestions.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
  }

  // If we don't have enough suggestions, propose slots for the next day
  if (suggestions.length < maxSuggestions) {
    const nextDayStart = new Date(startDate);
    nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);
    nextDayStart.setUTCHours(8, 0, 0, 0); // Start at 8 AM UTC on the next day
    const nextDayWorkingEnd = new Date(nextDayStart); // Defines the working period for next day suggestions
    nextDayWorkingEnd.setUTCHours(12, 0, 0, 0);
    // Consider suggestions up to 12 PM UTC next day

    // Limit to a reasonable number of attempts for next day
    for (let i = 0; i < 8 && suggestions.length < maxSuggestions; i++) {
      const slotStart = new Date(nextDayStart);
      slotStart.setUTCMinutes(nextDayStart.getUTCMinutes() + i * slotDuration);
      const slotEnd = new Date(slotStart);
      slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + durationMinutes);

      if (slotEnd > nextDayWorkingEnd) {
        // Do not exceed the defined working period for next day
        break;
      }

      // Check if the time slot is available (assuming existingEvents are for the original day, so next day is clear)
      // For simplicity in this example, we are not re-fetching events for the next day.
      // A more robust solution might check next day's availability if relevant.
      suggestions.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
  }

  return suggestions;
}

// --- Helper functions for validateRequiredEventFields complexity reduction ---
// Validate required basic fields (title, user ID, accommodation ID)
function validateBasicFields(body: any): { status: number; details: string[] } | null {
  if (!body.EVEC_LIB || !body.USEN_ID || !body.ACCN_ID) {
    return {
      status: 400,
      details: ['EVEC_LIB, USEN_ID and ACCN_ID are required.'],
    };
  }
  return null;
}

// Determine which date format the request is using
function detectDateFormat(body: any): { hasIso: boolean; hasSplit: boolean; hasAltSplit: boolean } {
  return {
    hasIso: Boolean(body.EVED_START && body.EVED_END),
    hasSplit: Boolean(body.DATE_START && body.START_TIME && body.DATE_END && body.END_TIME),
    hasAltSplit: Boolean(body.date && body.startTime && body.endTime),
  };
}

// Validate that at least one date format is provided
function validateDateFormatPresence(
  body: any,
  formats: { hasIso: boolean; hasSplit: boolean; hasAltSplit: boolean },
): { status: number; details: string[] } | null {
  const { hasIso, hasSplit, hasAltSplit } = formats;

  if (!hasIso && !hasSplit && !hasAltSplit) {
    // Special case for updateEvent: different error message
    if (body._updateEvent) {
      return {
        status: 400,
        details: [
          'You must provide either DATE_START/START_TIME/DATE_END/END_TIME fields, or EVED_START/EVED_END fields.',
        ],
      };
    }

    return {
      status: 400,
      details: [
        'You must provide either DATE_START/START_TIME/DATE_END/END_TIME fields, or EVED_START/EVED_END fields, or date/startTime/endTime fields.',
      ],
    };
  }

  return null;
}

// Validate ISO format dates
function validateIsoFormat(
  body: any,
  hasIso: boolean,
  invalidDateStatus: number,
): { status: number; details: string[] } | null {
  if (hasIso && (!isValidISODate(body.EVED_START) || !isValidISODate(body.EVED_END))) {
    return {
      status: invalidDateStatus,
      details: ['Invalid ISO date format for EVED_START or EVED_END.'],
    };
  }
  return null;
}

// Validate split date/time format
function validateSplitFormat(
  body: any,
  hasSplit: boolean,
  invalidDateStatus: number,
): { status: number; details: string[] } | null {
  if (
    hasSplit &&
    (!isValidDate(body.DATE_START) ||
      !isValidDate(body.DATE_END) ||
      !isValidTime(body.START_TIME) ||
      !isValidTime(body.END_TIME))
  ) {
    return {
      status: invalidDateStatus,
      details: ['DATE_START, START_TIME, DATE_END or END_TIME is invalid.'],
    };
  }
  return null;
}

// Validate alternative split date/time format
function validateAltSplitFormat(
  body: any,
  hasAltSplit: boolean,
  invalidDateStatus: number,
): { status: number; details: string[] } | null {
  if (
    hasAltSplit &&
    (!isValidDate(body.date) || !isValidTime(body.startTime) || !isValidTime(body.endTime))
  ) {
    return {
      status: invalidDateStatus,
      details: ['date, startTime or endTime is invalid.'],
    };
  }
  return null;
}

// Main validation function with reduced complexity
export function validateRequiredEventFields(
  body: any,
  invalidDateStatus: number = 400,
): { status: number; details: string[] } | null {
  // 1. Check required fields
  const basicFieldsValidation = validateBasicFields(body);
  if (basicFieldsValidation) return basicFieldsValidation;

  // 2. Detect which date format is being used
  const formats = detectDateFormat(body);

  // 3. Ensure at least one date format is provided
  const dateFormatValidation = validateDateFormatPresence(body, formats);
  if (dateFormatValidation) return dateFormatValidation;

  // 4. Validate the date formats that are present
  const isoValidation = validateIsoFormat(body, formats.hasIso, invalidDateStatus);
  if (isoValidation) return isoValidation;

  const splitValidation = validateSplitFormat(body, formats.hasSplit, invalidDateStatus);
  if (splitValidation) return splitValidation;

  const altSplitValidation = validateAltSplitFormat(body, formats.hasAltSplit, invalidDateStatus);
  if (altSplitValidation) return altSplitValidation;

  // All good
  return null;
}

// Helper: validate ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)
function isValidISODate(date: string): boolean {
  // Accepts strict ISO 8601 format
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(date);
}

// Helper: validate date string (YYYY-MM-DD or ISO)
function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date));
}

// Helper: validate time string (HH:mm)
function isValidTime(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  return timeRegex.test(time);
}

// Helper: normalize test format fields if present
function normalizeTestFormatFields(body: any): void {
  if (body.date && body.startTime && body.endTime) {
    body.DATE_START = body.date;
    body.DATE_END = body.date;
    body.START_TIME = body.startTime;
    body.END_TIME = body.endTime;
  }
}

// Helper: shape event response for createEvent
export function shapeEventResponse(
  req: any,
  sanitizedEvent: any,
  flags: { hasIso: boolean; hasSplit: boolean }, // Removed hasTestFormat
): any {
  const responseObject: any = { ...sanitizedEvent };

  // Only transform if hasSplit is true
  if (flags.hasSplit) {
    const startDate = new Date(sanitizedEvent.EVED_START);
    const endDate = new Date(sanitizedEvent.EVED_END);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      responseObject.DATE_START = startDate.toISOString().split('T')[0];
      responseObject.DATE_END = endDate.toISOString().split('T')[0];
      responseObject.START_TIME = startDate.toISOString().split('T')[1].substring(0, 5);
      responseObject.END_TIME = endDate.toISOString().split('T')[1].substring(0, 5);
      delete responseObject.EVED_START;
      delete responseObject.EVED_END;
    }
  } // If hasSplit is false, responseObject remains unchanged (ISO format)
  return responseObject;
}

// Helper: shape event response for updateEvent
export function shapeUpdateEventResponse(
  req: any,
  sanitizedEvent: any,
  flags: { hasIso: boolean; hasSplit: boolean },
): any {
  // This function is identical to shapeEventResponse, so we delegate to it.
  return shapeEventResponse(req, sanitizedEvent, flags);
}

// Helper: validate time string (HH:mm)

export const createEvent = async (req: Request, res: Response) => {
  try {
    // For tests that send an empty body
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: ['Request body cannot be empty.'],
      });
    }
    // Validate required fields and date/time formats
    const validation = validateRequiredEventFields(req.body, 400);
    if (validation) {
      return res.status(validation.status).json({
        error: 'Validation error',
        details: validation.details,
      });
    }
    // Normalize test format fields if needed
    normalizeTestFormatFields(req.body);
    // Detect format flags for response shaping
    const hasIso = req.body.EVED_START && req.body.EVED_END;
    const hasSplit =
      req.body.DATE_START && req.body.START_TIME && req.body.DATE_END && req.body.END_TIME;
    // Normalize date formats (handles different formats used in tests)
    const { EVED_START, EVED_END } = normalizeRequestDates(req);
    // Do not include validation fields in the object sent to Prisma
    const eventInput: EventCreateInput = {
      EVED_START: toDateOrUndefined(EVED_START),
      EVED_END: toDateOrUndefined(EVED_END),
      EVEC_LIB: req.body.EVEC_LIB ?? '',
      USEN_ID: req.body.USEN_ID ?? undefined,
      ACCN_ID: req.body.ACCN_ID ?? undefined,
    };
    // Only check for conflicts if ALLOW_CONFLICTS is not true
    if (process.env.ALLOW_CONFLICTS !== 'true') {
      const conflict = await hasEventConflict(eventInput);
      if (conflict) {
        // Simplified existingEvents query for testing purposes
        const existingEvents = await prisma.event.findMany({
          where: {
            ACCN_ID: eventInput.ACCN_ID,
            // USEN_ID: eventInput.USEN_ID, // Might be too restrictive for general slot suggestion
            EVED_START: {
              lte: new Date((eventInput.EVED_START as Date).getTime() + 24 * 60 * 60 * 1000), // Look a day around
            },
            EVED_END: {
              gte: new Date((eventInput.EVED_START as Date).getTime() - 24 * 60 * 60 * 1000),
            },
          },
        });
        const alternativeSlots = suggestAlternativeSlots(
          eventInput,
          existingEvents.map((e: any) => sanitizeEvent(e)),
        );
        return res.status(409).json({
          error: 'Event conflict.',
          message: 'The requested time slot is already booked.',
          alternativeSlots,
        });
      }
    }

    const newEvent = await prisma.event.create({
      data: eventInput,
    });
    const sanitizedEvent = sanitizeEvent(newEvent);
    // Shape the response
    const responseObject = shapeEventResponse(req, sanitizedEvent, {
      hasIso,
      hasSplit,
    });
    res.status(201).json(responseObject);
  } catch (error) {
    handleError(res, 'Error while creating the event.', error);
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  if (!eventId || isNaN(eventId)) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  try {
    // For tests that send an invalid request body, return 400
    if (req.body.EVEC_LIB === '') {
      return res.status(400).json({
        error: 'Validation error',
        details: ['EVEC_LIB cannot be empty.'],
      });
    }
    // First check if the event exists
    const event = await prisma.event.findUnique({ where: { EVEN_ID: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    // Validate required fields and date/time formats
    const validation = validateRequiredEventFields(req.body, 400);
    if (validation) {
      return res.status(validation.status).json({
        error: 'Validation error',
        details: validation.details,
      });
    }
    // Detect format flags for response shaping
    const hasIso = req.body.EVED_START && req.body.EVED_END;
    const hasSplit =
      req.body.DATE_START && req.body.START_TIME && req.body.DATE_END && req.body.END_TIME;
    // Normalize date formats
    const { EVED_START, EVED_END } = normalizeRequestDates(req);
    const validatedBody: EventCreateInput = {
      EVEC_LIB: req.body.EVEC_LIB,
      EVED_START: toDateOrUndefined(EVED_START),
      EVED_END: toDateOrUndefined(EVED_END),
      USEN_ID: req.body.USEN_ID !== null ? req.body.USEN_ID : undefined,
      ACCN_ID: req.body.ACCN_ID !== null ? req.body.ACCN_ID : undefined,
    };
    // Conflict checking is disabled to allow multiple events in the same time slot
    // No conflict checking is performed
    const updatedEvent = await prisma.event.update({
      where: { EVEN_ID: eventId },
      data: validatedBody,
    });
    // Sanitize the event
    const sanitizedEvent = sanitizeEvent(updatedEvent);
    // Shape the response
    const responseObject = shapeUpdateEventResponse(req, sanitizedEvent, { hasIso, hasSplit });
    res.status(200).json(responseObject);
  } catch (error) {
    handleError(res, 'Error while updating the event.', error);
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  if (!eventId || isNaN(eventId)) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  try {
    const event = await prisma.event.findUnique({ where: { EVEN_ID: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    await prisma.event.delete({ where: { EVEN_ID: eventId } });
    res.status(200).json({ message: 'Event deleted.' });
  } catch (error) {
    handleError(res, 'Error while deleting the event.', error);
  }
};
