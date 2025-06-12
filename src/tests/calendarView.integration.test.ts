import request from 'supertest';
import app from '../app';
import { describeSkipInCI, skipInCI } from './skipTestsInCI';

describeSkipInCI('Calendar Views (integration)', () => {
  describe('GET /calendar/day', () => {
    it('returns 400 if date is missing or invalid', async () => {
      const res = await request(app).get('/calendar/day').set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/week', () => {
    it('returns 400 if parameters are missing or invalid', async () => {
      const res = await request(app)
        .get('/calendar/week')
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /calendar/month', () => {
    it('returns 400 if parameters are missing or invalid', async () => {
      const res = await request(app)
        .get('/calendar/month')
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
    });
  });
});
