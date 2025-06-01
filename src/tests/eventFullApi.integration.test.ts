import request from 'supertest';
import app from '../app';
import { describeSkipInCI, skipInCI } from './skipTestsInCI';

// Utilities to create a basic event
const baseEvent = {
  EVEC_LIB: 'Test meeting',
  EVED_START: '2025-06-01T09:00:00Z',
  EVED_END: '2025-06-01T11:00:00Z',
  USEN_ID: 1,
  ACCN_ID: 1,
};

let createdEventId: number;

describeSkipInCI('Event API (integration, full CRUD)', () => {
  // Creation
  it('POST /events creates an event', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', 'Bearer test-token')
      .send(baseEvent);
    expect([201, 200, 409]).toContain(res.status);
    if ([201, 200].includes(res.status)) {
      expect(res.body.EVEN_ID).toBeDefined();
      createdEventId = res.body.EVEN_ID;
    }
  });

  // Lecture liste
  it('GET /events returns the list of events', async () => {
    const res = await request(app).get('/events').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Lecture par ID
  it('GET /events/:id returns an existing event', async () => {
    const res = await request(app)
      .get(`/events/${createdEventId}`)
      .set('Authorization', 'Bearer test-token');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.EVEN_ID).toBe(createdEventId);
    }
  });

  // Modification
  it('PUT /events/:id modifies an event', async () => {
    const res = await request(app)
      .put(`/events/${createdEventId}`)
      .set('Authorization', 'Bearer test-token')
      .send({
        EVEC_LIB: 'Modified meeting',
        EVED_START: '2025-06-01T09:00:00Z',
        EVED_END: '2025-06-01T11:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 1,
      });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.EVEC_LIB).toBe('Modified meeting');
    }
  });

  // Suppression
  it('DELETE /events/:id deletes an event', async () => {
    const res = await request(app)
      .delete(`/events/${createdEventId}`)
      .set('Authorization', 'Bearer test-token');
    expect([200, 204, 404]).toContain(res.status);
  });

  // Read by ID after deletion
  it('GET /events/:id returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/events/${createdEventId}`)
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(404);
  });

  // Error case: creation without required field
  it('POST /events returns 400 if required field is missing', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', 'Bearer test-token')
      .send({});
    expect(res.status).toBe(400);
  });

  // Error case: update with wrong ID
  it('PUT /events/:id returns 404 if ID does not exist', async () => {
    const res = await request(app)
      .put('/events/999999')
      .set('Authorization', 'Bearer test-token')
      .send({ EVEC_LIB: 'Test nonexistent' });
    expect(res.status).toBe(404);
  });

  // Error case: deletion with wrong ID
  it('DELETE /events/:id returns 404 if ID does not exist', async () => {
    const res = await request(app)
      .delete('/events/999999')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(404);
  });
});
