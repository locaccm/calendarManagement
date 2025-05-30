import request from 'supertest';
import app from '../app';

describe('Calendar Views (integration)', () => {
  describe('GET /calendar/day', () => {
    it('returns events for the day', async () => {
      const res = await request(app).get('/calendar/day?date=2025-06-01');
      expect([200, 204]).toContain(res.status);
      expect(res.body).toHaveProperty('date');
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
    it('retourne 400 si date manquante ou invalide', async () => {
      const res = await request(app).get('/calendar/day');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/week', () => {
    it('returns events for the week', async () => {
      const res = await request(app).get('/calendar/week?week=23&year=2025');
      expect([200, 204]).toContain(res.status);
      expect(res.body).toHaveProperty('week');
      expect(res.body).toHaveProperty('year');
      expect(res.body).toHaveProperty('days');
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
    it('returns 400 if parameters are missing or invalid', async () => {
      const res = await request(app).get('/calendar/week');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/month', () => {
    it('returns events for the month', async () => {
      const res = await request(app).get('/calendar/month?month=6&year=2025');
      expect([200, 204]).toContain(res.status);
      expect(res.body).toHaveProperty('month');
      expect(res.body).toHaveProperty('year');
      expect(res.body).toHaveProperty('days');
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
    it('returns 400 if parameters are missing or invalid', async () => {
      const res = await request(app).get('/calendar/month');
      expect(res.status).toBe(400);
    });
  });
});
