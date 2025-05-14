import { Request, Response } from 'express';
import prisma from '../prisma';
import { Event } from '../models/Event';
import { EventWhereInput, EventCreateInput } from '../types/prisma';

// Helper pour convertir une valeur en Date ou undefined
function toDateOrUndefined(val: unknown): Date | undefined {
  if (val == null) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

// Helper pour convertir un objet Prisma (avec null) en Event strict
function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export function sanitizeEvent(prismaEvent: any): any {
  const startDate = prismaEvent.EVED_START ? new Date(prismaEvent.EVED_START) : null;
  const endDate = prismaEvent.EVED_END ? new Date(prismaEvent.EVED_END) : null;
  return {
    EVEN_ID: prismaEvent.EVEN_ID!,
    EVEC_LIB: prismaEvent.EVEC_LIB ?? '',
    EVED_START: startDate ? startDate.toISOString() : '',
    EVED_END: endDate ? endDate.toISOString() : '',
    DATE_START: startDate
      ? `${startDate.getFullYear()}-${pad2(startDate.getMonth() + 1)}-${pad2(startDate.getDate())}`
      : '',
    DATE_END: endDate
      ? `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(endDate.getDate())}`
      : '',
    START_TIME: startDate
      ? `${pad2(startDate.getUTCHours())}:${pad2(startDate.getUTCMinutes())}`
      : '',
    END_TIME: endDate ? `${pad2(endDate.getUTCHours())}:${pad2(endDate.getUTCMinutes())}` : '',
    DATE: startDate
      ? `${startDate.getFullYear()}-${pad2(startDate.getMonth() + 1)}-${pad2(startDate.getDate())}`
      : '', // compat descendante
    USEN_ID: prismaEvent.USEN_ID ?? 0,
    ACCN_ID: prismaEvent.ACCN_ID ?? 0,
  };
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

// handleError supprimé : gestion centralisée via next()

export const getEvents = async (req: Request, res: Response, next: Function) => {
  try {
    const events = await prisma.event.findMany();
    res.json(sanitizeEvents(events));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des événements.' });
  }
};

// GET /events/filter?usager=1&logement=2&dateStart=2025-05-01&dateEnd=2025-05-31
export const getFilteredEvents = async (req: Request, res: Response, next: Function) => {
  const { usager, logement, dateStart, dateEnd } = req.query;

  // Validation des paramètres
  if (
    (usager && isNaN(Number(usager))) ||
    (logement && isNaN(Number(logement))) ||
    (dateStart && isNaN(Date.parse(String(dateStart)))) ||
    (dateEnd && isNaN(Date.parse(String(dateEnd))))
  ) {
    return res.status(400).json({ error: 'Validation error' });
  }

  try {
    const where: EventWhereInput = {};

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

    const prismaEvents = await prisma.event.findMany({ where });
    const events: Event[] = sanitizeEvents(prismaEvents);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du filtrage des événements.' });
  }
};

export const getEventById = async (req: Request, res: Response, next: Function) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(404).json({ error: 'Événement non trouvé.' });
  }
  try {
    const prismaEvent = await prisma.event.findUnique({
      where: { EVEN_ID: id },
    });

    if (!prismaEvent) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }

    const event: Event = sanitizeEvent(prismaEvent);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'événement." });
  }
};

// Fonction utilitaire pour vérifier les conflits d'événements
async function hasEventConflict(
  { ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<EventCreateInput>,
  excludeId?: number,
): Promise<boolean> {
  if (!ACCN_ID && !USEN_ID) return false;

  const whereClauses = [];

  if (ACCN_ID) {
    whereClauses.push({
      ACCN_ID,
      AND: [
        { EVED_START: { lte: toDateOrUndefined(EVED_END) ?? new Date(8640000000000000) } },
        { EVED_END: { gte: toDateOrUndefined(EVED_START) ?? new Date(-8640000000000000) } },
        excludeId ? { NOT: { EVEN_ID: excludeId } } : {},
      ],
    });
  }

  if (USEN_ID) {
    whereClauses.push({
      USEN_ID,
      AND: [
        { EVED_START: { lte: toDateOrUndefined(EVED_END) ?? new Date(8640000000000000) } },
        { EVED_END: { gte: toDateOrUndefined(EVED_START) ?? new Date(-8640000000000000) } },
        excludeId ? { NOT: { EVEN_ID: excludeId } } : {},
      ],
    });
  }

  if (whereClauses.length === 0) return false;

  const conflict = await prisma.event.findFirst({
    where: { OR: whereClauses },
  });

  return !!conflict;
}

// Helper de validation du body d'événement
function validateEventBody(body: any): EventCreateInput {
  if (
    typeof body.EVEC_LIB !== 'string' ||
    !body.EVEC_LIB.trim() ||
    !body.EVED_START ||
    !body.EVED_END ||
    typeof body.USEN_ID !== 'number' ||
    typeof body.ACCN_ID !== 'number'
  ) {
    throw new Error('Champs obligatoires manquants ou invalides');
  }
  return {
    EVEC_LIB: body.EVEC_LIB,
    EVED_START: new Date(body.EVED_START),
    EVED_END: new Date(body.EVED_END),
    USEN_ID: body.USEN_ID,
    ACCN_ID: body.ACCN_ID,
  };
}

// Fonction utilitaire pour proposer des créneaux alternatifs
function suggestAlternativeSlots(
  { ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<EventCreateInput>,
  existingEvents: Event[],
  slotDurationMinutes = 60,
  maxSuggestions = 3,
): TimeSlot[] {
  if (!EVED_START || !EVED_END) return [];

  const start = toDateOrUndefined(EVED_START) ?? new Date();
  const end = toDateOrUndefined(EVED_END) ?? new Date();
  const durationMs = end.getTime() - start.getTime();

  if (durationMs <= 0) return [];

  // Filtrer les événements en conflit pour la même ressource
  let relevantEvents = existingEvents.filter((ev) => {
    if (ACCN_ID && ev.ACCN_ID === ACCN_ID) return true;
    if (USEN_ID && ev.USEN_ID === USEN_ID) return true;
    return false;
  });

  relevantEvents = relevantEvents.sort(
    (a, b) => new Date(a.EVED_START).getTime() - new Date(b.EVED_START).getTime(),
  );

  // Chercher des créneaux libres autour du créneau demandé
  const suggestions: TimeSlot[] = [];

  // Chercher avant et après le créneau demandé
  for (let direction of [-1, 1]) {
    let tries = 0;
    let testStart = new Date(start.getTime());
    let testEnd = new Date(end.getTime());

    while (suggestions.length < maxSuggestions && tries < 10) {
      // Décale le créneau d'un pas (slotDurationMinutes ou durée demandée)
      const stepMs = direction * Math.max(durationMs, slotDurationMinutes * 60000);
      testStart = new Date(testStart.getTime() + stepMs);
      testEnd = new Date(testEnd.getTime() + stepMs);

      const overlap = relevantEvents.some(
        (ev) => !(new Date(ev.EVED_END) <= testStart || new Date(ev.EVED_START) >= testEnd),
      );

      if (!overlap && testStart > new Date()) {
        suggestions.push({
          start: testStart.toISOString().slice(0, 16),
          end: testEnd.toISOString().slice(0, 16),
        });
      }

      tries++;
    }
  }

  return suggestions.slice(0, maxSuggestions);
}

export const createEvent = async (req: Request, res: Response, next: Function) => {
  try {
    // Permettre la saisie séparée (date, startTime, endTime) ou ISO (EVED_START, EVED_END)
    let { ACCN_ID, USEN_ID, EVED_START, EVED_END, date, startTime, endTime } = req.body;
    // Si date/startTime/endTime fournis, on construit l'ISO
    if (date && startTime && endTime) {
      EVED_START = `${date}T${startTime}:00.000Z`;
      EVED_END = `${date}T${endTime}:00.000Z`;
    }
    // On ne passe à Prisma QUE les champs du modèle
    const eventInput: EventCreateInput = {
      EVEC_LIB: req.body.EVEC_LIB ?? '',
      EVED_START: toDateOrUndefined(EVED_START),
      EVED_END: toDateOrUndefined(EVED_END),
      USEN_ID: req.body.USEN_ID ?? undefined,
      ACCN_ID: req.body.ACCN_ID ?? undefined,
    };

    const hasConflict = await hasEventConflict({
      ...eventInput,
      EVED_START: toDateOrUndefined(eventInput.EVED_START),
      EVED_END: toDateOrUndefined(eventInput.EVED_END),
    });

    if (hasConflict) {
      // Récupérer les événements en conflit pour suggérer des alternatives
      const conflictEventsRaw = await prisma.event.findMany({
        where: {
          OR: [ACCN_ID ? { ACCN_ID } : {}, USEN_ID ? { USEN_ID } : {}],
          AND: [
            {
              EVED_START: {
                lte: toDateOrUndefined(eventInput.EVED_END) ?? new Date(8640000000000000),
              },
            },
            {
              EVED_END: {
                gte: toDateOrUndefined(eventInput.EVED_START) ?? new Date(-8640000000000000),
              },
            },
          ],
        },
      });
      const conflictEvents = sanitizeEvents(conflictEventsRaw);

      // Personnalisation via le body
      const suggestionDuration =
        typeof req.body.suggestionDuration === 'number' ? req.body.suggestionDuration : undefined;
      const maxSuggestions =
        typeof req.body.maxSuggestions === 'number' ? req.body.maxSuggestions : undefined;

      const alternatives = suggestAlternativeSlots(
        {
          ...eventInput,
          EVED_START: toDateOrUndefined(eventInput.EVED_START),
          EVED_END: toDateOrUndefined(eventInput.EVED_END),
          EVEC_LIB: eventInput.EVEC_LIB ?? '',
          USEN_ID: eventInput.USEN_ID ?? undefined,
          ACCN_ID: eventInput.ACCN_ID ?? undefined,
        },
        conflictEvents,
        suggestionDuration,
        maxSuggestions,
      );

      return res.status(409).json({
        error:
          'Conflit: un événement existe déjà pour ce logement ou cet utilisateur sur ce créneau.',
        alternatives,
      });
    }

    const event = await prisma.event.create({
      data: eventInput,
    });

    res.status(201).json(sanitizeEvent(event));
  } catch (error) {
    next({ status: 500, message: "Erreur lors de la création de l'événement.", details: error });
  }
};

export const updateEvent = async (req: Request, res: Response, next: Function) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId)) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }
    const event = await prisma.event.findUnique({
      where: { EVEN_ID: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }

    // Validation stricte du body
    let validatedBody: EventCreateInput;
    try {
      validatedBody = validateEventBody(req.body);
    } catch (e) {
      return res.status(400).json({ error: 'Validation error' });
    }
    const merged = { ...event, ...validatedBody };
    const safeMerged: EventCreateInput = {
      ...merged,
      EVED_START: toDateOrUndefined(merged.EVED_START),
      EVED_END: toDateOrUndefined(merged.EVED_END),
      USEN_ID: merged.USEN_ID ?? undefined,
      ACCN_ID: merged.ACCN_ID ?? undefined,
      EVEC_LIB: merged.EVEC_LIB ?? '',
    };
    // Vérification de conflit (hors événement courant)
    const hasConflict = await hasEventConflict(safeMerged, eventId);

    if (hasConflict) {
      // Récupérer les événements en conflit pour suggérer des alternatives
      const conflictEventsRaw = await prisma.event.findMany({
        where: {
          OR: [
            merged.ACCN_ID ? { ACCN_ID: merged.ACCN_ID } : {},
            merged.USEN_ID ? { USEN_ID: merged.USEN_ID } : {},
          ],
          AND: [
            {
              EVED_START: {
                lte: toDateOrUndefined(merged.EVED_END) ?? new Date(8640000000000000),
              },
            },
            {
              EVED_END: {
                gte: toDateOrUndefined(merged.EVED_START) ?? new Date(-8640000000000000),
              },
            },
            { NOT: { EVEN_ID: eventId } },
          ],
        },
      });
      const conflictEvents = sanitizeEvents(conflictEventsRaw);

      // Personnalisation via le body
      const suggestionDuration =
        typeof req.body.suggestionDuration === 'number' ? req.body.suggestionDuration : undefined;
      const maxSuggestions =
        typeof req.body.maxSuggestions === 'number' ? req.body.maxSuggestions : undefined;

      const alternatives = suggestAlternativeSlots(
        {
          ...merged,
          EVED_START: toDateOrUndefined(merged.EVED_START),
          EVED_END: toDateOrUndefined(merged.EVED_END),
          EVEC_LIB: merged.EVEC_LIB ?? '',
          USEN_ID: merged.USEN_ID ?? undefined,
          ACCN_ID: merged.ACCN_ID ?? undefined,
        },
        conflictEvents,
        suggestionDuration,
        maxSuggestions,
      );

      return res.status(409).json({
        error:
          'Conflit: un événement existe déjà pour ce logement ou cet utilisateur sur ce créneau.',
        alternatives,
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { EVEN_ID: eventId },
      data: validatedBody,
    });

    res.json(sanitizeEvent(updatedEvent));
  } catch (error) {
    next({ status: 500, message: "Erreur lors de la mise à jour de l'événement.", details: error });
  }
};

export const deleteEvent = async (req: Request, res: Response, next: Function) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId)) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }
    const event = await prisma.event.findUnique({
      where: { EVEN_ID: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }

    await prisma.event.delete({
      where: { EVEN_ID: eventId },
    });

    res.json({ message: 'Événement supprimé.' });
  } catch (error) {
    next({ status: 500, message: "Erreur lors de la suppression de l'événement.", details: error });
  }
};
