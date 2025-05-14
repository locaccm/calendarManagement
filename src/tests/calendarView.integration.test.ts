import request from 'supertest';
import app from '../app';

describe('Calendar Views (integration)', () => {
  describe('GET /calendar/day', () => {
    it('retourne les événements du jour', async () => {
      const res = await request(app).get('/calendar/day?date=2025-06-01');
      expect([200, 204]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('retourne 400 si date manquante ou invalide', async () => {
      const res = await request(app).get('/calendar/day');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/week', () => {
    it('retourne les événements de la semaine', async () => {
      const res = await request(app).get('/calendar/week?week=23&year=2025');
      expect([200, 204]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('retourne 400 si paramètres manquants ou invalides', async () => {
      const res = await request(app).get('/calendar/week');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/month', () => {
    it('retourne les événements du mois', async () => {
      const res = await request(app).get('/calendar/month?month=6&year=2025');
      expect([200, 204]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('retourne 400 si paramètres manquants ou invalides', async () => {
      const res = await request(app).get('/calendar/month');
      expect(res.status).toBe(400);
    });
  });
});
