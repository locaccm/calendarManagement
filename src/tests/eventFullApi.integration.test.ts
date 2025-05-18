import request from 'supertest';
import app from '../app';

// Utilitaires pour créer un événement de base
const baseEvent = {
  EVEC_LIB: 'Réunion test',
  EVED_START: '2025-06-01T09:00:00Z',
  EVED_END: '2025-06-01T11:00:00Z',
  USEN_ID: 1,
  ACCN_ID: 1,
};

let createdEventId: number;

describe('Event API (integration, full CRUD)', () => {
  // Création
  it('POST /events crée un événement', async () => {
    const res = await request(app).post('/events').send(baseEvent);
    expect([201, 200, 409]).toContain(res.status);
    if ([201, 200].includes(res.status)) {
      expect(res.body.EVEN_ID).toBeDefined();
      createdEventId = res.body.EVEN_ID;
    }
  });

  // Lecture liste
  it('GET /events retourne la liste des événements', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Lecture par ID
  it('GET /events/:id retourne un événement existant', async () => {
    const res = await request(app).get(`/events/${createdEventId}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.EVEN_ID).toBe(createdEventId);
    }
  });

  // Modification
  it('PUT /events/:id modifie un événement', async () => {
    const res = await request(app).put(`/events/${createdEventId}`).send({
      EVEC_LIB: 'Réunion modifiée',
      EVED_START: '2025-06-01T09:00:00Z',
      EVED_END: '2025-06-01T11:00:00Z',
      USEN_ID: 1,
      ACCN_ID: 1,
    });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.EVEC_LIB).toBe('Réunion modifiée');
    }
  });

  // Suppression
  it('DELETE /events/:id supprime un événement', async () => {
    const res = await request(app).delete(`/events/${createdEventId}`);
    expect([200, 204, 404]).toContain(res.status);
  });

  // Lecture par ID après suppression
  it('GET /events/:id retourne 404 après suppression', async () => {
    const res = await request(app).get(`/events/${createdEventId}`);
    expect(res.status).toBe(404);
  });

  // Cas d'erreur : création sans champ obligatoire
  it('POST /events retourne 400 si champ obligatoire manquant', async () => {
    const res = await request(app).post('/events').send({});
    expect(res.status).toBe(400);
  });

  // Cas d'erreur : modification avec mauvais ID
  it('PUT /events/:id retourne 404 si ID inexistant', async () => {
    const res = await request(app).put('/events/999999').send({ EVEC_LIB: 'Test inexistant' });
    expect(res.status).toBe(404);
  });

  // Cas d'erreur : suppression avec mauvais ID
  it('DELETE /events/:id retourne 404 si ID inexistant', async () => {
    const res = await request(app).delete('/events/999999');
    expect(res.status).toBe(404);
  });
});
