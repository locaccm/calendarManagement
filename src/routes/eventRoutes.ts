import { Router } from 'express';
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
 *   description: Event management
 */
const router = Router();

router.get('/events/filter', getFilteredEvents);

/**
 * @swagger
 * /en/events/filter:
 *   get:
 *     summary: Filter events
 *     description: |
 *       Filter events based on different criteria (user, accommodation, period).
 *       All parameters are optional, but at least one should be provided to get relevant results.
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: User ID (tenant)
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: Accommodation ID
 *         example: 2
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: 2025-05-01
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: 2025-05-31
 *     responses:
 *       200:
 *         description: Filtered list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example: [
 *               {
 *                 "EVEN_ID": 89,
 *                 "EVEC_LIB": "Annual meeting",
 *                 "EVED_START": "2025-06-01T09:00:00.000Z",
 *                 "EVED_END": "2025-06-01T11:00:00.000Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 1,
 *                 "startDate": "2025-06-01",
 *                 "startTime": "09:00",
 *                 "endDate": "2025-06-01",
 *                 "endTime": "11:00"
 *               },
 *               {
 *                 "EVEN_ID": 90,
 *                 "EVEC_LIB": "Apartment viewing",
 *                 "EVED_START": "2025-06-02T14:00:00.000Z",
 *                 "EVED_END": "2025-06-02T15:00:00.000Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 1,
 *                 "startDate": "2025-06-02",
 *                 "startTime": "14:00",
 *                 "endDate": "2025-06-02",
 *                 "endTime": "15:00"
 *               }
 *             ]
 *       400:
 *         description: Invalid filter parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient rights according to the Access API
 */
router.get('/en/events/filter', getFilteredEvents);

/**
 * @swagger
 * /fr/evenements:
 *   get:
 *     summary: List of events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Returns the list of events
 */

// Route pour les tests
router.get('/events', getEvents);
router.get('/fr/evenements', getEvents);

/**
 * @swagger
 * /en/events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Returns the list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/en/events', getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *     x-language: fr
 */

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *     x-language: en
 */
router.get('/events/:id', getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create an event
 *     description: |
 *       Creates a new event in the calendar.
 *       Multiple date formats are accepted:
 *       1. Format ISO 8601 (EVED_START et EVED_END): "2025-05-15T10:00:00Z"
 *       2. Separate format (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             formatISO:
 *               summary: Format ISO 8601
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Apartment visit",
 *                 "EVED_START": "2025-05-15T10:00:00Z",
 *                 "EVED_END": "2025-05-15T11:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSepare:
 *               summary: Separate format (one day)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Apartment visit",
 *                 "EVED_START": "2025-05-15T10:00:00Z",
 *                 "EVED_END": "2025-05-15T11:00:00Z",
 *                 "startDate": "2025-05-15",
 *                 "startTime": "10:00",
 *                 "endDate": "2025-05-15",
 *                 "endTime": "11:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatMultiJours:
 *               summary: Separate format (multiple days)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Real estate seminar",
 *                 "EVED_START": "2025-05-15T09:00:00Z",
 *                 "EVED_END": "2025-05-17T18:00:00Z",
 *                 "startDate": "2025-05-15",
 *                 "startTime": "09:00",
 *                 "endDate": "2025-05-17",
 *                 "endTime": "18:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Created event ID
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Invalid data or event conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Access denied - Insufficient rights according to access API
 *     x-language: fr
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create an event
 *     description: |
 *       Creates a new event in the calendar.
 *       Multiple date formats are accepted:
 *       1. ISO 8601 format (EVED_START and EVED_END): "2025-05-15T10:00:00Z"
 *       2. Separate format (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             formatISO:
 *               summary: ISO 8601 Format
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Apartment viewing",
 *                 "EVED_START": "2025-05-15T10:00:00Z",
 *                 "EVED_END": "2025-05-15T11:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSeparate:
 *               summary: Separate format (single day)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Apartment viewing",
 *                 "EVED_START": "2025-05-15T10:00:00Z",
 *                 "EVED_END": "2025-05-15T11:00:00Z",
 *                 "startDate": "2025-05-15",
 *                 "startTime": "10:00",
 *                 "endDate": "2025-05-15",
 *                 "endTime": "11:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatMultiDay:
 *               summary: Separate format (multiple days)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Real estate seminar",
 *                 "EVED_START": "2025-05-15T09:00:00Z",
 *                 "EVED_END": "2025-05-17T18:00:00Z",
 *                 "startDate": "2025-05-15",
 *                 "startTime": "09:00",
 *                 "endDate": "2025-05-17",
 *                 "endTime": "18:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created event
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Invalid data or event conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient rights according to the Access API
 *     x-language: en
 */
router.post('/events', createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     description: |
 *       Updates an existing event in the calendar.
 *       Multiple date formats are accepted:
 *       1. Format ISO 8601 (EVED_START et EVED_END): "2025-05-15T10:00:00Z"
 *       2. Separate format (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             formatISO:
 *               summary: Format ISO 8601
 *               value: {
 *                 "EVEC_LIB": "Modified apartment visit",
 *                 "EVED_START": "2025-05-16T14:00:00Z",
 *                 "EVED_END": "2025-05-16T15:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSepare:
 *               summary: Separate format (one day)
 *               value: {
 *                 "EVEC_LIB": "Modified apartment visit",
 *                 "EVED_START": "2025-05-16T14:00:00Z",
 *                 "EVED_END": "2025-05-16T15:00:00Z",
 *                 "startDate": "2025-05-16",
 *                 "startTime": "14:00",
 *                 "endDate": "2025-05-16",
 *                 "endTime": "15:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatMultiJours:
 *               summary: Separate format (multiple days)
 *               value: {
 *                 "EVEC_LIB": "Modified real estate seminar",
 *                 "EVED_START": "2025-05-16T09:00:00Z",
 *                 "EVED_END": "2025-05-18T18:00:00Z",
 *                 "startDate": "2025-05-16",
 *                 "startTime": "09:00",
 *                 "endDate": "2025-05-18",
 *                 "endTime": "18:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Updated event ID
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Invalid data or event conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Access denied - Insufficient rights according to access API
 *       404:
 *         description: Event not found
 *     x-language: fr
 */

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     description: |
 *       Updates an existing event in the calendar.
 *       Multiple date formats are accepted:
 *       1. ISO 8601 format (EVED_START and EVED_END): "2025-05-15T10:00:00Z"
 *       2. Separate format (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             formatISO:
 *               summary: ISO 8601 Format
 *               value: {
 *                 "EVEC_LIB": "Modified apartment viewing",
 *                 "EVED_START": "2025-05-16T14:00:00Z",
 *                 "EVED_END": "2025-05-16T15:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSeparate:
 *               summary: Separate format (single day)
 *               value: {
 *                 "EVEC_LIB": "Modified apartment viewing",
 *                 "EVED_START": "2025-05-16T14:00:00Z",
 *                 "EVED_END": "2025-05-16T15:00:00Z",
 *                 "startDate": "2025-05-16",
 *                 "startTime": "14:00",
 *                 "endDate": "2025-05-16",
 *                 "endTime": "15:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatMultiDay:
 *               summary: Separate format (multiple days)
 *               value: {
 *                 "EVEC_LIB": "Modified real estate seminar",
 *                 "EVED_START": "2025-05-16T09:00:00Z",
 *                 "EVED_END": "2025-05-18T18:00:00Z",
 *                 "startDate": "2025-05-16",
 *                 "startTime": "09:00",
 *                 "endDate": "2025-05-18",
 *                 "endTime": "18:00",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the updated event
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Invalid data or event conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient rights according to the Access API
 *       404:
 *         description: Event not found
 *     x-language: en
 */
router.put('/events/:id', updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted
 *       404:
 *         description: Event not found
 *     x-language: fr
 */

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted
 *       404:
 *         description: Event not found
 *     x-language: en
 */
router.delete('/events/:id', deleteEvent);

/**
 * @swagger
 * tags:
 *   name: Calendar Views
 *   description: Vues du calendrier (jour, semaine, mois)
 */

/**
 * @swagger
 * /calendar/day:
 *   get:
 *     summary: Get events for a specific day
 *     description: |
 *       Returns all events for a specific date.
 *     tags: [Calendar Views]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to retrieve events for (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: User ID (tenant) to filter events
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: Accommodation ID to filter events
 *         example: 2
 *     responses:
 *       200:
 *         description: Day information and list of events for the specified day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Requested day date
 *                   example: "2025-05-15"
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             example: {
 *               "date": "2025-06-01",
 *               "events": [
 *                 {
 *                   "EVEN_ID": 89,
 *                   "EVEC_LIB": "Annual meeting",
 *                   "EVED_START": "2025-06-01T09:00:00.000Z",
 *                   "EVED_END": "2025-06-01T11:00:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-01",
 *                   "startTime": "09:00",
 *                   "endDate": "2025-06-01",
 *                   "endTime": "11:00"
 *                 },
 *                 {
 *                   "EVEN_ID": 91,
 *                   "EVEC_LIB": "Entretien technique",
 *                   "EVED_START": "2025-06-01T14:00:00.000Z",
 *                   "EVED_END": "2025-06-01T15:30:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-01",
 *                   "startTime": "14:00",
 *                   "endDate": "2025-06-01",
 *                   "endTime": "15:30"
 *                 }
 *               ]
 *             }
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Access denied - Insufficient rights according to access API
 */
router.get('/calendar/day', getEventsForDay);

/**
 * @swagger
 * /calendar/week:
 *   get:
 *     summary: Get events for a specific week
 *     description: |
 *       Returns all events for a specific week.
 *       You can specify either a date within the week or directly the week number and year.
 *     tags: [Calendar Views]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date within the week to retrieve events for (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Week number (1-53)
 *         example: 20
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *         example: 2025
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: User ID (tenant) to filter events
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: Accommodation ID to filter events
 *         example: 2
 *     responses:
 *       200:
 *         description: Week information and list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 week:
 *                   type: integer
 *                   description: Week number (1-53)
 *                   example: 20
 *                 year:
 *                   type: integer
 *                   description: Year
 *                   example: 2025
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Premier jour de la semaine
 *                   example: "2025-05-12"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Dernier jour de la semaine
 *                   example: "2025-05-18"
 *                 days:
 *                   type: array
 *                   description: Liste des jours de la semaine
 *                   items:
 *                     type: string
 *                     format: date
 *                   example: ["2025-05-12", "2025-05-13", "2025-05-14", "2025-05-15", "2025-05-16", "2025-05-17", "2025-05-18"]
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             example: {
 *               "week": 22,
 *               "year": 2025,
 *               "startDate": "2025-06-01",
 *               "endDate": "2025-06-07",
 *               "days": ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"],
 *               "events": [
 *                 {
 *                   "EVEN_ID": 89,
 *                   "EVEC_LIB": "Annual meeting",
 *                   "EVED_START": "2025-06-01T09:00:00.000Z",
 *                   "EVED_END": "2025-06-01T11:00:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-01",
 *                   "startTime": "09:00",
 *                   "endDate": "2025-06-01",
 *                   "endTime": "11:00"
 *                 },
 *                 {
 *                   "EVEN_ID": 90,
 *                   "EVEC_LIB": "Apartment visit",
 *                   "EVED_START": "2025-06-02T14:00:00.000Z",
 *                   "EVED_END": "2025-06-02T15:00:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-02",
 *                   "startTime": "14:00",
 *                   "endDate": "2025-06-02",
 *                   "endTime": "15:00"
 *                 }
 *               ]
 *             }
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Access denied - Insufficient rights according to access API
 */
router.get('/calendar/week', getEventsForWeek);

/**
 * @swagger
 * /calendar/month:
 *   get:
 *     summary: Get events for a specific month
 *     description: |
 *       Returns all events for a specific month.
 *       You can specify either a date within the month or directly the month and year.
 *     tags: [Calendar Views]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in the month to retrieve events for (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month (1-12)
 *         example: 5
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *         example: 2025
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: User ID (tenant) to filter events
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: Accommodation ID to filter events
 *         example: 2
 *     responses:
 *       200:
 *         description: Month information and list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                   description: Month (1-12)
 *                   example: 5
 *                 year:
 *                   type: integer
 *                   description: Year
 *                   example: 2025
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: First day of the month
 *                   example: "2025-05-01"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Last day of the month
 *                   example: "2025-05-31"
 *                 daysInMonth:
 *                   type: integer
 *                   description: Number of days in the month
 *                   example: 31
 *                 days:
 *                   type: array
 *                   description: List of days in the month
 *                   items:
 *                     type: string
 *                     format: date
 *                   example: ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05"]
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             example: {
 *               "month": 6,
 *               "year": 2025,
 *               "startDate": "2025-06-01",
 *               "endDate": "2025-06-30",
 *               "daysInMonth": 30,
 *               "days": ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "..."  ],
 *               "events": [
 *                 {
 *                   "EVEN_ID": 89,
 *                   "EVEC_LIB": "Annual meeting",
 *                   "EVED_START": "2025-06-01T09:00:00.000Z",
 *                   "EVED_END": "2025-06-01T11:00:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-01",
 *                   "startTime": "09:00",
 *                   "endDate": "2025-06-01",
 *                   "endTime": "11:00"
 *                 },
 *                 {
 *                   "EVEN_ID": 92,
 *                   "EVEC_LIB": "Lease signing",
 *                   "EVED_START": "2025-06-15T14:00:00.000Z",
 *                   "EVED_END": "2025-06-15T15:00:00.000Z",
 *                   "USEN_ID": 1,
 *                   "ACCN_ID": 1,
 *                   "startDate": "2025-06-15",
 *                   "startTime": "14:00",
 *                   "endDate": "2025-06-15",
 *                   "endTime": "15:00"
 *                 }
 *               ]
 *             }
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Access denied - Insufficient rights according to access API
 */
router.get('/calendar/month', getEventsForMonth);

export default router;
