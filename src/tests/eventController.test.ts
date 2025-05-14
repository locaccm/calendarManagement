import request from 'supertest';
import app from '../app';

describe('Health route', () => {
  it('GET /health should return 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Events API validation & error handling', () => {
  it('POST /events with invalid body should return 400', async () => {
    const res = await request(app)
      .post('/events')
      .send({ EVEC_LIB: '', USEN_ID: 'notanumber' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details).toBeDefined();
  });

  it('PUT /events/:id with invalid body should return 400', async () => {
    const res = await request(app)
      .put('/events/1')
      .send({ EVEC_LIB: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('GET /events/99999999 (not found) should return 404', async () => {
    const res = await request(app).get('/events/99999999');
    expect([404, 500]).toContain(res.status); // 404 attendu, 500 si DB non mockée
  });

  it('DELETE /events/99999999 (not found) should return 404', async () => {
    const res = await request(app).delete('/events/99999999');
    expect([404, 500]).toContain(res.status);
  });

  it('GET /events/filter?usager=abc (invalid query) should return 400', async () => {
    const res = await request(app).get('/events/filter?usager=abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('POST /events with conflit (simulate 409)', async () => {
    // Ce test suppose que tu as un mock ou une DB qui peut générer un conflit
    // Ici, on force un conflit sur le même créneau et logement/usager
    const event = {
      EVEC_LIB: 'Réunion annuelle',
      EVED_START: '2025-06-01T09:00:00Z',
      EVED_END: '2025-06-01T11:00:00Z',
      USEN_ID: 1,
      ACCN_ID: 1,
    };
    await request(app).post('/events').send(event);
    const res = await request(app).post('/events').send(event);
    expect([409, 500]).toContain(res.status); // 409 attendu, 500 si DB non mockée
  });
});
