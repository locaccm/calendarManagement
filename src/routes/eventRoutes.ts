import { Router } from 'express';
const router = Router();
import { validateBody, validateQuery } from '../middleware/validation';
import {
  eventCreateSchema,
  eventUpdateSchema,
  eventIdParamSchema,
  eventFilterQuerySchema,
} from '../validation/eventSchemas';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getFilteredEvents,
} from '../controllers/eventController';
import {
  getEventsForDay,
  getEventsForWeek,
  getEventsForMonth,
} from '../controllers/calendarViewController';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements via Prisma (ORM moderne, type-safe, remplaçant TypeORM)
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - EVEC_LIB
 *         - EVED_START
 *         - EVED_END
 *         - USEN_ID
 *         - ACCN_ID
 *       properties:
 *         EVEN_ID:
 *           type: integer
 *           description: Identifiant unique de l'événement
 *         EVEC_LIB:
 *           type: string
 *           description: Libellé de l'événement
 *         EVED_START:
 *           type: string
 *           format: date-time
 *           description: Date et heure de début (format ISO)
 *         EVED_END:
 *           type: string
 *           format: date-time
 *           description: Date et heure de fin (format ISO)
 *         DATE_START:
 *           type: string
 *           format: date
 *           description: Date de début (YYYY-MM-DD). Si DATE_START = DATE_END, l'événement est sur un seul jour.
 *         DATE_END:
 *           type: string
 *           format: date
 *           description: Date de fin (YYYY-MM-DD). Si DATE_START = DATE_END, l'événement est sur un seul jour.
 *         START_TIME:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *           description: Heure de début (HH:mm)
 *         END_TIME:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *           description: Heure de fin (HH:mm)
 *         DATE:
 *           type: string
 *           format: date
 *           description: Date de début (compatibilité, identique à DATE_START)
 *         USEN_ID:
 *           type: integer
 *           description: ID de l'usager
 *         ACCN_ID:
 *           type: integer
 *           description: ID du logement
 *       example:
 *         EVEN_ID: 1
 *         EVEC_LIB: Réunion annuelle
 *         EVED_START: "2025-06-01T09:00:00Z"
 *         EVED_END: "2025-06-01T11:00:00Z"
 *         DATE_START: "2025-06-01"
 *         DATE_END: "2025-06-01"
 *         START_TIME: "09:00"
 *         END_TIME: "11:00"
 *         DATE: "2025-06-01"
 *         USEN_ID: 1
 *         ACCN_ID: 1
 *     EventCreate:
 *       type: object
 *       required:
 *         - EVEC_LIB
 *         - USEN_ID
 *         - ACCN_ID
 *       properties:
 *         EVEC_LIB:
 *           type: string
 *           description: Libellé de l'événement
 *         EVED_START:
 *           type: string
 *           format: date-time
 *           description: Date et heure de début (format ISO, optionnel si date/startTime fournis)
 *         EVED_END:
 *           type: string
 *           format: date-time
 *           description: Date et heure de fin (format ISO, optionnel si date/endTime fournis)
 *         date:
 *           type: string
 *           format: date
 *           description: Date de l'événement (YYYY-MM-DD, optionnel si EVED_START/EVED_END fournis)
 *         startTime:
 *           type: string
 *           pattern: ^\d{2}:\d{2}$
 *           description: Heure de début (HH:mm, optionnel si EVED_START fourni)
 *         endTime:
 *           type: string
 *           pattern: ^\d{2}:\d{2}$
 *           description: Heure de fin (HH:mm, optionnel si EVED_END fourni)
 *         USEN_ID:
 *           type: integer
 *           description: ID de l'usager
 *         ACCN_ID:
 *           type: integer
 *           description: ID du logement
 *       examples:
 *         creation_iso:
 *           summary: Création via format ISO
 *           value:
 *             EVEC_LIB: Réunion annuelle
 *             EVED_START: "2025-06-01T09:00:00Z"
 *             EVED_END: "2025-06-01T11:00:00Z"
 *             USEN_ID: 1
 *             ACCN_ID: 1
 *         creation_split:
 *           summary: Création via date et heures séparées
 *           value:
 *             EVEC_LIB: Réunion annuelle
 *             date: "2025-06-01"
 *             startTime: "09:00"
 *             endTime: "11:00"
 *             USEN_ID: 1
 *             ACCN_ID: 1
 *   @swagger
 *   /events:
 *     get:
 *       summary: Liste des événements (stockés via Prisma)
 *       tags: [Events]
 *       responses:
 *         200:
 *           description: Retourne la liste des événements
 *     responses:
 *       200:
 *         description: Retourne la liste des événements
 */
router.get('/events', getEvents);
router.get('/calendar/day', getEventsForDay);
router.get('/calendar/week', getEventsForWeek);
router.get('/calendar/month', getEventsForMonth);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupérer un événement par ID (stocké via Prisma)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de l'événement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *             example:
 *               EVEN_ID: 1
 *               EVEC_LIB: Réunion annuelle
 *               EVED_START: "2025-06-01T09:00:00Z"
 *               EVED_END: "2025-06-01T11:00:00Z"
 *               USEN_ID: 1
 *               ACCN_ID: 1
 *       404:
 *         description: Événement non trouvé
 */
router.get('/events/filter', validateQuery(eventFilterQuerySchema), getFilteredEvents);
router.get('/events/:id', getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un événement (persisté via Prisma)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             ExempleCréation:
 *               summary: Exemple d'événement à créer
 *               value:
 *                 EVEC_LIB: Réunion annuelle
 *                 EVED_START: "2025-06-01T09:00:00Z"
 *                 EVED_END: "2025-06-01T11:00:00Z"
 *                 USEN_ID: 1
 *                 ACCN_ID: 1
 *     responses:
 *       201:
 *         description: Événement créé
 *         content:
 *           application/json:
 *             example:
 *               EVEN_ID: 123
 *               EVEC_LIB: Réunion annuelle
 *               EVED_START: "2025-06-01T09:00:00Z"
 *               EVED_END: "2025-06-01T11:00:00Z"
 *               USEN_ID: 1
 *               ACCN_ID: 1
 */
router.post('/events', validateBody(eventCreateSchema), createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Mettre à jour un événement (persisté via Prisma)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             ExempleMaj:
 *               summary: Exemple de mise à jour d'événement
 *               value:
 *                 EVEC_LIB: Réunion modifiée
 *                 EVED_START: "2025-06-01T10:00:00Z"
 *                 EVED_END: "2025-06-01T12:00:00Z"
 *                 USEN_ID: 1
 *                 ACCN_ID: 1
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *         content:
 *           application/json:
 *             example:
 *               EVEN_ID: 123
 *               EVEC_LIB: Réunion modifiée
 *               EVED_START: "2025-06-01T10:00:00Z"
 *               EVED_END: "2025-06-01T12:00:00Z"
 *               USEN_ID: 1
 *               ACCN_ID: 1
 *       404:
 *         description: Événement non trouvé
 */
router.put('/events/:id', validateBody(eventUpdateSchema), updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Supprimer un événement (persisté via Prisma)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       404:
 *         description: Événement non trouvé
 */
router.delete('/events/:id', deleteEvent);

/**
 * @swagger
 * /events/filter:
 *   get:
 *     summary: Filtrer les événements
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: ID de l'usager (locataire)
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: ID du logement
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste filtrée des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             examples:
 *               ExempleFiltre:
 *                 summary: Exemple de liste filtrée
 *                 value:
 *                   - EVEN_ID: 1
 *                     EVEC_LIB: Réunion annuelle
 *                     EVED_START: "2025-06-01T09:00:00Z"
 *                     EVED_END: "2025-06-01T11:00:00Z"
 *                     USEN_ID: 1
 *                     ACCN_ID: 1
 *                   - EVEN_ID: 2
 *                     EVEC_LIB: Entretien
 *                     EVED_START: "2025-06-02T14:00:00Z"
 *                     EVED_END: "2025-06-02T15:00:00Z"
 *                     USEN_ID: 2
 *                     ACCN_ID: 1
 */
router.get('/events/filter', validateQuery(eventFilterQuerySchema), getFilteredEvents);

// Endpoints pour la vue calendrier (jour, semaine, mois)
/**
 * @swagger
 * /calendar/day:
 *   get:
 *     summary: Récupérer les événements d'un jour
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date au format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Liste des événements pour le jour donné
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example:
 *               - EVEN_ID: 1
 *                 EVEC_LIB: Réunion annuelle
 *                 EVED_START: "2025-06-01T09:00:00Z"
 *                 EVED_END: "2025-06-01T11:00:00Z"
 *                 USEN_ID: 1
 *                 ACCN_ID: 1
 *       400:
 *         description: Date manquante ou invalide
 */
router.get('/day', getEventsForDay);
/**
 * @swagger
 * /calendar/week:
 *   get:
 *     summary: Récupérer les événements d'une semaine
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro de la semaine (ISO)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         required: true
 *         description: Année
 *     responses:
 *       200:
 *         description: Liste des événements pour la semaine donnée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example:
 *               - EVEN_ID: 1
 *                 EVEC_LIB: Réunion annuelle
 *                 EVED_START: "2025-06-01T09:00:00Z"
 *                 EVED_END: "2025-06-01T11:00:00Z"
 *                 USEN_ID: 1
 *                 ACCN_ID: 1
 *       400:
 *         description: Semaine ou année manquante/invalide
 */
router.get('/week', getEventsForWeek);
/**
 * @swagger
 * /calendar/month:
 *   get:
 *     summary: Récupérer les événements d'un mois
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         required: true
 *         description: Mois (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         required: true
 *         description: Année
 *     responses:
 *       200:
 *         description: Liste des événements pour le mois donné
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example:
 *               - EVEN_ID: 1
 *                 EVEC_LIB: Réunion annuelle
 *                 EVED_START: "2025-06-01T09:00:00Z"
 *                 EVED_END: "2025-06-01T11:00:00Z"
 *                 USEN_ID: 1
 *                 ACCN_ID: 1
 *       400:
 *         description: Mois ou année manquant/invalide
 */
router.get('/month', getEventsForMonth);

export default router;
