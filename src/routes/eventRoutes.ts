import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements
 */
const router = Router();

// Placeholder route pour Swagger
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
router.get('/events', (req, res) => {
  res.json([]); // À remplacer par la logique réelle
});

export default router;
