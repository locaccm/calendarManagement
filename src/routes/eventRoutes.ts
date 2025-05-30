import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */
const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List of events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Returns the list of events
 */
router.get('/events', getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve an event by ID
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
 */
router.get('/events/:id', getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/events', createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
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
 *         description: Event updated
 *       404:
 *         description: Event not found
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
 */
router.delete('/events/:id', deleteEvent);

export default router;
