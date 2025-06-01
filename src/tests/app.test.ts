import request from 'supertest';
import app from '../app';

describe('App integration smoke tests', () => {
  it('should load the main app without crashing', () => {
    expect(app).toBeDefined();
  });

  it('should respond to GET / with HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain('Calendar Management API');
  });

  it('should respond to GET /health with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should redirect /api-docs-fr to /api-docs', async () => {
    const res = await request(app).get('/api-docs-fr');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/api-docs');
  });
});
