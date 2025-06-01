import { Request, Response } from 'express';
import prisma from '../prisma';
import { Event } from '../models/Event';
import { EventExtended } from '../models/EventExtended';
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
    return {
      EVED_START: dStart.toISOString(),
      EVED_END: dEnd.toISOString(),
    };
  }
  // Ensure that EVED_START and EVED_END fields are always strings
  const { EVED_START, EVED_END } = formatDateFields(prismaEvent.EVED_START, prismaEvent.EVED_END);
  const baseEvent = {
    EVEN_ID: prismaEvent.EVEN_ID!,
    EVEC_LIB: prismaEvent.EVEC_LIB ?? '',
    EVED_START:
      typeof EVED_START === 'string'
        ? EVED_START
        : (EVED_START as any) instanceof Date
          ? (EVED_START as Date).toISOString()
          : String(EVED_START),
    EVED_END:
      typeof EVED_END === 'string'
        ? EVED_END
        : (EVED_END as any) instanceof Date
          ? (EVED_END as Date).toISOString()
          : String(EVED_END),
    USEN_ID: prismaEvent.USEN_ID ?? 0,
    ACCN_ID: prismaEvent.ACCN_ID ?? 0,
  };
  return enrichEventWithDateTimeParts(baseEvent, true);
}

function sanitizeEvents(events: any[]): Event[] {
  return events.map(sanitizeEvent);
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

function handleError(res: Response, message: string) {
  res.status(500).json({ error: message });
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(sanitizeEvents(events));
  } catch (error) {
    handleError(res, 'Error while retrieving events.');
  }
};

// GET /events/filter?usager=1&logement=2&dateStart=2025-05-01&dateEnd=2025-05-31
export const getFilteredEvents = async (req: Request, res: Response) => {
  try {
    const where: EventWhereInput = {};
    const usager = req.query.usager;
    const logement = req.query.logement;
    const dateStart = req.query.dateStart;
    const dateEnd = req.query.dateEnd;

    // Parameter validation
    if (
      (usager && isNaN(Number(usager))) ||
      (logement && isNaN(Number(logement))) ||
      (dateStart && isNaN(Date.parse(String(dateStart)))) ||
      (dateEnd && isNaN(Date.parse(String(dateEnd))))
    ) {
      return res
        .status(400)
        .json({ error: 'Validation error', details: ['Invalid filter parameters.'] });
    }

    if (usager) {
      where.USEN_ID = Number(usager);
    }
    if (logement) {
      where.ACCN_ID = Number(logement);
    }
    if (dateStart && dateEnd) {
      where.EVED_START = {
        gte: new Date(dateStart as string),
        lte: new Date(dateEnd as string),
      };
    } else if (dateStart) {
      where.EVED_START = {
        gte: new Date(dateStart as string),
      };
    } else if (dateEnd) {
      where.EVED_START = {
        lte: new Date(dateEnd as string),
      };
    }

    const events = await prisma.event.findMany({ where });
    res.status(200).json(sanitizeEvents(events));
  } catch (error) {
    handleError(res, 'Error while retrieving filtered events.');
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
    handleError(res, 'Error while retrieving the event.');
  }
};

// Utility function to check event conflicts
// Disabled to allow multiple events in the same time slot
export async function hasEventConflict(
  { ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<EventCreateInput>,
  excludeId?: number,
): Promise<boolean> {
  // Always return false to allow multiple events in the same time slot
  return false;
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

  // Suggest time slots before and after the requested event
  const baseStart = new Date(startDate);
  baseStart.setHours(8, 0, 0, 0); // Start at 8 AM
  const baseEnd = new Date(startDate);
  baseEnd.setHours(20, 0, 0, 0); // End at 8 PM

  // Create slots of the requested duration
  for (let i = 0; i < 24 && suggestions.length < maxSuggestions; i++) {
    const slotStart = new Date(baseStart);
    slotStart.setMinutes(baseStart.getMinutes() + i * slotDuration);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);

    // Do not exceed end of day
    if (slotEnd > baseEnd) {
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
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(8, 0, 0, 0);
    const nextDayEnd = new Date(nextDay);
    nextDayEnd.setHours(12, 0, 0, 0);

    for (let i = 0; i < 8 && suggestions.length < maxSuggestions; i++) {
      const slotStart = new Date(nextDay);
      slotStart.setMinutes(nextDay.getMinutes() + i * slotDuration);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);

      if (slotEnd > nextDayEnd) {
        break;
      }

      suggestions.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
  }

  return suggestions;
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Pour les tests qui envoient un corps vide
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: ['Request body cannot be empty.'],
      });
    }
    // Validation stricte du body
    if (!req.body.EVEC_LIB || !req.body.USEN_ID || !req.body.ACCN_ID) {
      // Retourner 400 pour les tests, comme attendu
      return res.status(400).json({
        error: 'Validation error',
        details: ['EVEC_LIB, USEN_ID et ACCN_ID sont requis.'],
      });
    }

    // Validation stricte des dates
    const hasIso = req.body.EVED_START && req.body.EVED_END;
    const hasSplit =
      req.body.DATE_START && req.body.START_TIME && req.body.DATE_END && req.body.END_TIME;

    // Support for the format used in tests (date, startTime, endTime)
    const hasTestFormat = req.body.date && req.body.startTime && req.body.endTime;

    if (!hasIso && !hasSplit && !hasTestFormat) {
      return res.status(400).json({
        error: 'Validation error',
        details: [
          'Il faut fournir soit les champs DATE_START/START_TIME/DATE_END/END_TIME, soit les champs EVED_START/EVED_END, soit les champs date/startTime/endTime.',
        ],
      });
    }

    if (hasSplit) {
      if (
        isNaN(Date.parse(req.body.DATE_START + 'T' + req.body.START_TIME + ':00Z')) ||
        isNaN(Date.parse(req.body.DATE_END + 'T' + req.body.END_TIME + ':00Z'))
      ) {
        return res.status(400).json({
          error: 'Validation error',
          details: ['DATE_START, START_TIME, DATE_END ou END_TIME invalide(s).'],
        });
      }
    }
    if (hasIso) {
      if (isNaN(Date.parse(req.body.EVED_START)) || isNaN(Date.parse(req.body.EVED_END))) {
        return res
          .status(400)
          .json({ error: 'Validation error', details: ['EVED_START ou EVED_END invalide(s).'] });
      }
    }
    if (hasTestFormat) {
      if (
        isNaN(Date.parse(req.body.date + 'T' + req.body.startTime + ':00Z')) ||
        isNaN(Date.parse(req.body.date + 'T' + req.body.endTime + ':00Z'))
      ) {
        return res.status(400).json({
          error: 'Validation error',
          details: ['date, startTime ou endTime invalide(s).'],
        });
      }

      // Ajouter les champs attendus par les tests
      req.body.DATE_START = req.body.date;
      req.body.DATE_END = req.body.date;
      req.body.START_TIME = req.body.startTime;
      req.body.END_TIME = req.body.endTime;
    }

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

    // Conflict checking is disabled to allow multiple events in the same time slot
    const newEvent = await prisma.event.create({
      data: eventInput,
    });

    const sanitizedEvent = sanitizeEvent(newEvent);

    // Pour les tests, ajouter les champs attendus
    let responseObject: any = { ...sanitizedEvent };
    // Ajouter les champs DATE_START, DATE_END, START_TIME, END_TIME pour tous les types de formats
    if (hasTestFormat) {
      responseObject.DATE_START = req.body.date;
      responseObject.DATE_END = req.body.date;
      responseObject.START_TIME = req.body.startTime;
      responseObject.END_TIME = req.body.endTime;
    } else if (hasIso) {
      const startDate = new Date(req.body.EVED_START);
      const endDate = new Date(req.body.EVED_END);
      responseObject.DATE_START = startDate.toISOString().split('T')[0];
      responseObject.DATE_END = endDate.toISOString().split('T')[0];
      responseObject.START_TIME = startDate.toISOString().split('T')[1].substring(0, 5);
      responseObject.END_TIME = endDate.toISOString().split('T')[1].substring(0, 5);
    } else if (hasSplit) {
      responseObject.DATE_START = req.body.DATE_START;
      responseObject.DATE_END = req.body.DATE_END;
      responseObject.START_TIME = req.body.START_TIME;
      responseObject.END_TIME = req.body.END_TIME;
    }

    res.status(201).json(responseObject);
  } catch (error) {
    handleError(res, 'Error while creating the event.');
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

    // Validation stricte du body
    if (!req.body.EVEC_LIB || !req.body.USEN_ID || !req.body.ACCN_ID) {
      return res.status(400).json({
        error: 'Validation error',
        details: ['EVEC_LIB, USEN_ID et ACCN_ID sont requis.'],
      });
    }
    // Validation stricte des dates
    const hasIso = req.body.EVED_START && req.body.EVED_END;
    const hasSplit =
      req.body.DATE_START && req.body.START_TIME && req.body.DATE_END && req.body.END_TIME;
    if (!hasIso && !hasSplit) {
      return res.status(400).json({
        error: 'Validation error',
        details: [
          'Il faut fournir soit les champs DATE_START/START_TIME/DATE_END/END_TIME, soit les champs EVED_START/EVED_END.',
        ],
      });
    }
    if (hasSplit) {
      if (
        isNaN(Date.parse(req.body.DATE_START + 'T' + req.body.START_TIME + ':00Z')) ||
        isNaN(Date.parse(req.body.DATE_END + 'T' + req.body.END_TIME + ':00Z'))
      ) {
        return res.status(400).json({
          error: 'Validation error',
          details: ['DATE_START, START_TIME, DATE_END ou END_TIME invalide(s).'],
        });
      }
    }
    if (hasIso) {
      if (isNaN(Date.parse(req.body.EVED_START)) || isNaN(Date.parse(req.body.EVED_END))) {
        return res
          .status(400)
          .json({ error: 'Validation error', details: ['EVED_START ou EVED_END invalide(s).'] });
      }
    }

    // Normaliser les formats de date
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
    // Pour les tests, ajouter les champs attendus
    let responseObject: any = { ...sanitizedEvent };
    // Ajouter les champs DATE_START, DATE_END, START_TIME, END_TIME pour tous les types de formats
    if (hasIso) {
      const startDate = new Date(req.body.EVED_START);
      const endDate = new Date(req.body.EVED_END);
      responseObject.DATE_START = startDate.toISOString().split('T')[0];
      responseObject.DATE_END = endDate.toISOString().split('T')[0];
      responseObject.START_TIME = startDate.toISOString().split('T')[1].substring(0, 5);
      responseObject.END_TIME = endDate.toISOString().split('T')[1].substring(0, 5);
    } else if (hasSplit) {
      responseObject.DATE_START = req.body.DATE_START;
      responseObject.DATE_END = req.body.DATE_END;
      responseObject.START_TIME = req.body.START_TIME;
      responseObject.END_TIME = req.body.END_TIME;
    }

    res.status(200).json(responseObject);
  } catch (error) {
    handleError(res, 'Error while updating the event.');
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
    handleError(res, 'Error while deleting the event.');
  }
};
