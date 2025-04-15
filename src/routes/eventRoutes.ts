import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements
 */
const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Liste des événements
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Retourne la liste des événements
 */
router.get('/events', getEvents);

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
 */
router.get('/events/:id', getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un événement
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Événement créé
 */
router.post('/events', createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Mettre à jour un événement
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
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *       404:
 *         description: Événement non trouvé
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
 */
router.delete('/events/:id', deleteEvent);

export default router;
