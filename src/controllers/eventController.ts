import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Between, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Event } from '../models/Event';

function handleError(res: Response, message: string) {
  res.status(500).json({ error: message });
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const events = await eventRepo.find();
    res.json(events);
  } catch (error) {
    handleError(res, 'Erreur lors de la récupération des événements.');
  }
};

// GET /events/filter?usager=1&logement=2&dateStart=2025-05-01&dateEnd=2025-05-31
export const getFilteredEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const { usager, logement, dateStart, dateEnd } = req.query;
    const where: any = {};
    if (usager) where.USEN_ID = Number(usager);
    if (logement) where.ACCN_ID = Number(logement);
    if (dateStart && dateEnd) {
      where.EVED_START = Between(dateStart, dateEnd);
    } else if (dateStart) {
      where.EVED_START = MoreThanOrEqual(dateStart);
    } else if (dateEnd) {
      where.EVED_START = LessThanOrEqual(dateEnd);
    }
    const events = await eventRepo.find({ where });
    res.json(events);
  } catch (error) {
    handleError(res, 'Erreur lors du filtrage des événements.');
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé.' });
    res.json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la récupération de l'événement.");
  }
};

// Fonction utilitaire pour vérifier les conflits d'événements
async function hasEventConflict({ ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<Event>, eventRepo: any, excludeId?: number) {
  if (!ACCN_ID && !USEN_ID) return false;
  const where: any[] = [];
  if (ACCN_ID) {
    where.push({
      ACCN_ID,
      EVED_START: LessThanOrEqual(EVED_END),
      EVED_END: MoreThanOrEqual(EVED_START),
      ...(excludeId && { EVEN_ID: Not(excludeId) }),
    });
  }
  if (USEN_ID) {
    where.push({
      USEN_ID,
      EVED_START: LessThanOrEqual(EVED_END),
      EVED_END: MoreThanOrEqual(EVED_START),
      ...(excludeId && { EVEN_ID: Not(excludeId) }),
    });
  }
  if (where.length === 0) return false;
  const conflict = await eventRepo.findOne({ where });
  return !!conflict;
}

// Fonction utilitaire pour proposer des créneaux alternatifs
function suggestAlternativeSlots({ ACCN_ID, USEN_ID, EVED_START, EVED_END }: Partial<Event>, existingEvents: Event[], slotDurationMinutes = 60, maxSuggestions = 3) {
  if (!EVED_START || !EVED_END) return [];
  const start = new Date(EVED_START);
  const end = new Date(EVED_END);
  const durationMs = end.getTime() - start.getTime();
  if (durationMs <= 0) return [];

  // Filtrer les événements en conflit pour la même ressource
  let relevantEvents = existingEvents.filter(ev => {
    if (ACCN_ID && ev.ACCN_ID === ACCN_ID) return true;
    if (USEN_ID && ev.USEN_ID === USEN_ID) return true;
    return false;
  });
  relevantEvents = relevantEvents.sort((a, b) => new Date(a.EVED_START).getTime() - new Date(b.EVED_START).getTime());

  // Chercher des créneaux libres autour du créneau demandé
  const suggestions = [];
  let windowStart = new Date(start);
  let windowEnd = new Date(end);

  // Chercher avant et après le créneau demandé
  for (let direction of [-1, 1]) {
    let tries = 0;
    let testStart = new Date(start);
    let testEnd = new Date(end);
    while (suggestions.length < maxSuggestions && tries < 10) {
      // Décale le créneau d'un pas (slotDurationMinutes ou durée demandée)
      const stepMs = direction * Math.max(durationMs, slotDurationMinutes * 60000);
      testStart = new Date(testStart.getTime() + stepMs);
      testEnd = new Date(testEnd.getTime() + stepMs);
      // Vérifie qu'il n'y a pas de conflit sur ce créneau
      const overlap = relevantEvents.some(ev =>
        !(new Date(ev.EVED_END) <= testStart || new Date(ev.EVED_START) >= testEnd)
      );
      if (!overlap && testStart > new Date()) {
        suggestions.push({ start: testStart.toISOString().slice(0, 16), end: testEnd.toISOString().slice(0, 16) });
      }
      tries++;
    }
  }
  return suggestions.slice(0, maxSuggestions);
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const { ACCN_ID, USEN_ID, EVED_START, EVED_END } = req.body;
    // Vérification de conflit
    const whereClauses = [] as any[];
    if (ACCN_ID) {
      whereClauses.push({ ACCN_ID, EVED_START: LessThanOrEqual(EVED_END), EVED_END: MoreThanOrEqual(EVED_START) });
    }
    if (USEN_ID) {
      whereClauses.push({ USEN_ID, EVED_START: LessThanOrEqual(EVED_END), EVED_END: MoreThanOrEqual(EVED_START) });
    }
    const conflicts = await eventRepo.find({ where: whereClauses });
    if (conflicts.length > 0) {
      // Personnalisation via le body
      const suggestionDuration = typeof req.body.suggestionDuration === 'number' ? req.body.suggestionDuration : undefined;
      const maxSuggestions = typeof req.body.maxSuggestions === 'number' ? req.body.maxSuggestions : undefined;
      const alternatives = suggestAlternativeSlots(
        { ACCN_ID, USEN_ID, EVED_START, EVED_END },
        conflicts,
        suggestionDuration,
        maxSuggestions
      );
      return res.status(409).json({ error: "Conflit: un événement existe déjà pour ce logement ou cet utilisateur sur ce créneau.", alternatives });
    }
    const event = eventRepo.create(req.body);
    await eventRepo.save(event);
    res.status(201).json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la création de l'événement.");
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const event = await eventRepo.findOneBy({ EVEN_ID: Number(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé.' });
    const merged = { ...event, ...req.body };
    // Vérification de conflit (hors événement courant)
    const whereClauses = [] as any[];
    if (merged.ACCN_ID) {
      whereClauses.push({ ACCN_ID: merged.ACCN_ID, EVED_START: LessThanOrEqual(merged.EVED_END), EVED_END: MoreThanOrEqual(merged.EVED_START), EVEN_ID: Not(event.EVEN_ID) });
    }
    if (merged.USEN_ID) {
      whereClauses.push({ USEN_ID: merged.USEN_ID, EVED_START: LessThanOrEqual(merged.EVED_END), EVED_END: MoreThanOrEqual(merged.EVED_START), EVEN_ID: Not(event.EVEN_ID) });
    }
    const conflicts = await eventRepo.find({ where: whereClauses });
    if (conflicts.length > 0) {
      // Personnalisation via le body
      const suggestionDuration = typeof req.body.suggestionDuration === 'number' ? req.body.suggestionDuration : undefined;
      const maxSuggestions = typeof req.body.maxSuggestions === 'number' ? req.body.maxSuggestions : undefined;
      const alternatives = suggestAlternativeSlots(
        merged,
        conflicts,
        suggestionDuration,
        maxSuggestions
      );
      return res.status(409).json({ error: "Conflit: un événement existe déjà pour ce logement ou cet utilisateur sur ce créneau.", alternatives });
    }
    eventRepo.merge(event, req.body);
    await eventRepo.save(event);
    res.json(event);
  } catch (error) {
    handleError(res, "Erreur lors de la mise à jour de l'événement.");
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const result = await eventRepo.delete({ EVEN_ID: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ error: 'Événement non trouvé.' });
    res.json({ message: 'Événement supprimé.' });
  } catch (error) {
    handleError(res, "Erreur lors de la suppression de l'événement.");
  }
};
