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
 *   description: Gestion des événements
 *   x-language: fr
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */
const router = Router();

/**
 * @swagger
 * /fr/evenements/filtrer:
 *   get:
 *     summary: Filtrer les événements
 *     description: |
 *       Filtrer les événements selon différents critères (utilisateur, logement, période).
 *       Tous les paramètres sont optionnels, mais au moins un devrait être fourni pour obtenir des résultats pertinents.
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (locataire)
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: ID du logement
 *         example: 2
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (AAAA-MM-JJ)
 *         example: 2025-05-01
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (AAAA-MM-JJ)
 *         example: 2025-05-31
 *     responses:
 *       200:
 *         description: Liste filtrée des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example: [
 *               {
 *                 "EVEN_ID": 89,
 *                 "EVEC_LIB": "Réunion annuelle",
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
 *                 "EVEC_LIB": "Visite appartement",
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
 *         description: Paramètres de filtre invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
 */
router.get('/fr/evenements/filtrer', getFilteredEvents);

// Route pour les tests
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
 *     summary: Liste des événements
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Retourne la liste des événements
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
 *     summary: Récupérer un événement par ID
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
 *       404:
 *         description: Événement non trouvé
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
 *     summary: Créer un événement
 *     description: |
 *       Crée un nouvel événement dans le calendrier.
 *       Plusieurs formats de date sont acceptés :
 *       1. Format ISO 8601 (EVED_START et EVED_END): "2025-05-15T10:00:00Z"
 *       2. Format séparé (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
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
 *                 "EVEC_LIB": "Visite appartement",
 *                 "EVED_START": "2025-05-15T10:00:00Z",
 *                 "EVED_END": "2025-05-15T11:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSepare:
 *               summary: Format séparé (une journée)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Visite appartement",
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
 *               summary: Format séparé (plusieurs jours)
 *               value: {
 *                 "EVEN_ID": 1,
 *                 "EVEC_LIB": "Séminaire immobilier",
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
 *         description: Événement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'événement créé
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Données invalides ou conflit d'événements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
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
 *     summary: Mettre à jour un événement
 *     description: |
 *       Met à jour un événement existant dans le calendrier.
 *       Plusieurs formats de date sont acceptés :
 *       1. Format ISO 8601 (EVED_START et EVED_END): "2025-05-15T10:00:00Z"
 *       2. Format séparé (date, startTime, endTime): date="2025-05-15", startTime="10:00", endTime="11:00"
 *     tags: [Events]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à mettre à jour
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
 *                 "EVEC_LIB": "Visite appartement modifiée",
 *                 "EVED_START": "2025-05-16T14:00:00Z",
 *                 "EVED_END": "2025-05-16T15:00:00Z",
 *                 "USEN_ID": 1,
 *                 "ACCN_ID": 2
 *               }
 *             formatSepare:
 *               summary: Format séparé (une journée)
 *               value: {
 *                 "EVEC_LIB": "Visite appartement modifiée",
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
 *               summary: Format séparé (plusieurs jours)
 *               value: {
 *                 "EVEC_LIB": "Séminaire immobilier modifié",
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
 *         description: Événement mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'événement mis à jour
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Données invalides ou conflit d'événements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
 *       404:
 *         description: Événement non trouvé
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
 *     summary: Supprimer un événement
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
 *     summary: Récupérer les événements pour un jour spécifique
 *     description: |
 *       Retourne tous les événements pour une date spécifique.
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
 *         description: Date pour laquelle récupérer les événements (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: ID de l'usager (locataire) pour filtrer les événements
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: ID du logement pour filtrer les événements
 *         example: 2
 *     responses:
 *       200:
 *         description: Informations du jour et liste des événements pour le jour spécifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Date du jour demandé
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
 *                   "EVEC_LIB": "Réunion annuelle",
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
 *         description: Paramètres invalides
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
 */
router.get('/calendar/day', getEventsForDay);

/**
 * @swagger
 * /calendar/week:
 *   get:
 *     summary: Récupérer les événements pour une semaine spécifique
 *     description: |
 *       Retourne tous les événements pour une semaine spécifique.
 *       Vous pouvez spécifier soit une date dans la semaine, soit directement le numéro de semaine et l'année.
 *     tags: [Calendar Views]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date dans la semaine pour laquelle récupérer les événements (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Numéro de la semaine (1-53)
 *         example: 20
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Année
 *         example: 2025
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: ID de l'usager (locataire) pour filtrer les événements
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: ID du logement pour filtrer les événements
 *         example: 2
 *     responses:
 *       200:
 *         description: Informations de la semaine et liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 week:
 *                   type: integer
 *                   description: Numéro de la semaine (1-53)
 *                   example: 20
 *                 year:
 *                   type: integer
 *                   description: Année
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
 *                   "EVEC_LIB": "Réunion annuelle",
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
 *                   "EVEC_LIB": "Visite appartement",
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
 *         description: Paramètres invalides
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
 */
router.get('/calendar/week', getEventsForWeek);

/**
 * @swagger
 * /calendar/month:
 *   get:
 *     summary: Récupérer les événements pour un mois spécifique
 *     description: |
 *       Retourne tous les événements pour un mois spécifique.
 *       Vous pouvez spécifier soit une date dans le mois, soit directement le mois et l'année.
 *     tags: [Calendar Views]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date dans le mois pour lequel récupérer les événements (format YYYY-MM-DD)
 *         example: 2025-05-15
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Mois (1-12)
 *         example: 5
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Année
 *         example: 2025
 *       - in: query
 *         name: usager
 *         schema:
 *           type: integer
 *         description: ID de l'usager (locataire) pour filtrer les événements
 *         example: 1
 *       - in: query
 *         name: logement
 *         schema:
 *           type: integer
 *         description: ID du logement pour filtrer les événements
 *         example: 2
 *     responses:
 *       200:
 *         description: Informations du mois et liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                   description: Mois (1-12)
 *                   example: 5
 *                 year:
 *                   type: integer
 *                   description: Année
 *                   example: 2025
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Premier jour du mois
 *                   example: "2025-05-01"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Dernier jour du mois
 *                   example: "2025-05-31"
 *                 daysInMonth:
 *                   type: integer
 *                   description: Nombre de jours dans le mois
 *                   example: 31
 *                 days:
 *                   type: array
 *                   description: Liste des jours du mois
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
 *                   "EVEC_LIB": "Réunion annuelle",
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
 *                   "EVEC_LIB": "Signature du bail",
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
 *         description: Paramètres invalides
 *       401:
 *         description: Non autorisé - Clé d'API manquante ou invalide
 *       403:
 *         description: Accès refusé - Droits insuffisants selon l'API d'accès
 */
router.get('/calendar/month', getEventsForMonth);

export default router;
