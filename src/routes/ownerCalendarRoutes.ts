import { Router } from 'express';
import {
  getOwnerCalendars,
  getOwnerCalendarById,
  createOwnerCalendar,
  updateOwnerCalendar,
  deleteOwnerCalendar,
} from '../controllers/ownerCalendarController';

const router = Router();

/**
 * @swagger
 * /owner-calendars:
 *   get:
 *     summary: Liste tous les calendriers propriétaires
 *     tags: [OwnerCalendar]
 *     responses:
 *       200:
 *         description: Liste des calendriers propriétaires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OwnerCalendar'
 */
router.get('/owner-calendars', getOwnerCalendars);

/**
 * @swagger
 * /owner-calendars/{id}:
 *   get:
 *     summary: Récupère un calendrier propriétaire par ID
 *     tags: [OwnerCalendar]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du calendrier
 *     responses:
 *       200:
 *         description: Calendrier trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OwnerCalendar'
 *       404:
 *         description: Calendrier non trouvé
 */
router.get('/owner-calendars/:id', getOwnerCalendarById);

/**
 * @swagger
 * /owner-calendars:
 *   post:
 *     summary: Crée un nouveau calendrier propriétaire
 *     tags: [OwnerCalendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OwnerCalendar'
 *     responses:
 *       201:
 *         description: Calendrier créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OwnerCalendar'
 */
router.post('/owner-calendars', createOwnerCalendar);

/**
 * @swagger
 * /owner-calendars/{id}:
 *   put:
 *     summary: Met à jour un calendrier propriétaire
 *     tags: [OwnerCalendar]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du calendrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OwnerCalendar'
 *     responses:
 *       200:
 *         description: Calendrier mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OwnerCalendar'
 *       404:
 *         description: Calendrier non trouvé
 */
router.put('/owner-calendars/:id', updateOwnerCalendar);

/**
 * @swagger
 * /owner-calendars/{id}:
 *   delete:
 *     summary: Supprime un calendrier propriétaire
 *     tags: [OwnerCalendar]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du calendrier
 *     responses:
 *       200:
 *         description: Calendrier supprimé
 *       404:
 *         description: Calendrier non trouvé
 */
router.delete('/owner-calendars/:id', deleteOwnerCalendar);

export default router;
