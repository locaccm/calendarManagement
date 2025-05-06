import express from 'express';
import request from 'supertest';
import { AppDataSource } from '../data-source';
import * as dataSource from '../data-source';
import eventRoutes from '../routes/eventRoutes';
import { Event } from '../models/Event';

jest.mock('../data-source');

// Mock data
const events = [
  { EVEN_ID: 1, EVED_START: '2025-05-05', EVED_END: '2025-05-05', EVEC_LIB: 'A', USEN_ID: 1, ACCN_ID: 1 },
  { EVEN_ID: 2, EVED_START: '2025-05-07', EVED_END: '2025-05-07', EVEC_LIB: 'B', USEN_ID: 2, ACCN_ID: 1 },
  { EVEN_ID: 3, EVED_START: '2025-05-10', EVED_END: '2025-05-10', EVEC_LIB: 'C', USEN_ID: 1, ACCN_ID: 2 },
];

describe('Calendar View Endpoints', () => {
  let mockRepo: any;
  let app: express.Express;
  let errorLogs: any[] = [];
  let findCalls: any[] = [];
  beforeEach(() => {
    jest.clearAllMocks();
    findCalls = [];
    const { Between, Equal } = require('typeorm');
    mockRepo = {
      find: jest.fn((opts) => {
        findCalls.push(opts);
        // Si on cherche sur une date exacte (day)
        if (opts && opts.where && typeof opts.where.EVED_START === 'string') {
          return Promise.resolve(events.filter(ev => ev.EVED_START === opts.where.EVED_START));
        }
        // Si on cherche sur un opérateur TypeORM Between ou Equal (mock ou vrai)
        if (opts && opts.where && typeof opts.where.EVED_START === 'object' && opts.where.EVED_START !== null) {
          const val = opts.where.EVED_START;
          console.log('MOCK TYPEORM OPERATOR', JSON.stringify(val));
          if (val._type === 'between' && Array.isArray(val._value)) {
            const [start, end] = val._value;
            return Promise.resolve(events.filter(ev => ev.EVED_START >= start && ev.EVED_START <= end));
          }
          if (val._type === 'equal') {
            return Promise.resolve(events.filter(ev => ev.EVED_START === val._value));
          }
          // fallback : { start, end } ou [start, end]
          const start = val.start || val[0];
          const end = val.end || val[1];
          if (start && end) {
            return Promise.resolve(events.filter(ev => ev.EVED_START >= start && ev.EVED_START <= end));
          }
        }
        // Sinon, retourne tout
        if (!opts || !opts.where) return Promise.resolve(events);
        // Cas inattendu
        console.log('MOCK FIND UNEXPECTED OPTS', opts);
        return Promise.resolve([]);
      }),
      target: {}, // TypeORM utilise cette propriété dans les mocks pour Between/Equal
    };
    jest.spyOn(dataSource.AppDataSource, 'getRepository').mockReturnValue(mockRepo);
    errorLogs = [];
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      errorLogs.push(args);
    });
    // Création de l'app APRÈS l'injection du mock
    app = express();
    app.use(express.json());
    app.use('/events', eventRoutes);
  });

  it('GET /events/day returns events for a day', async () => {
    mockRepo.find.mockResolvedValue([events[0]]);
    const res = await request(app).get('/events/day?date=2025-05-05');
    console.log('DAY:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(200);
    if (res.status !== 200) {
      console.log('SERVER ERROR LOGS:', errorLogs);
    }
    expect(res.body).toEqual([events[0]]);
    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ EVED_START: expect.any(Object) }),
    }));
  });

  it('GET /events/day returns 400 if date missing', async () => {
    mockRepo.find.mockResolvedValue([]); // pour éviter une erreur si jamais appelé
    const res = await request(app).get('/events/day').query({});
    console.log('DAY400:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockRepo.find).not.toHaveBeenCalled();
  });

  it('GET /events/week returns events for a week', async () => {
    mockRepo.find.mockResolvedValue([events[0], events[1]]);
    const res = await request(app).get('/events/week?week=19&year=2025');
    console.log('WEEK:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ EVED_START: expect.any(Object) }),
    }));
  });

  it('GET /events/week returns 400 if params missing', async () => {
    mockRepo.find.mockResolvedValue([]);
    const res = await request(app).get('/events/week?year=2025');
    console.log('WEEK400:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockRepo.find).not.toHaveBeenCalled();
  });

  it('GET /events/month returns events for a month', async () => {
    mockRepo.find.mockResolvedValue([events[2]]);
    const res = await request(app).get('/events/month?month=5&year=2025');
    console.log('MONTH:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ EVED_START: expect.any(Object) }),
    }));
  });

  it('GET /events/month returns 400 if params missing', async () => {
    mockRepo.find.mockResolvedValue([]);
    const res = await request(app).get('/events/month?year=2025');
    console.log('MONTH400:', res.body, res.status);
    console.log('FIND CALLS:', JSON.stringify(findCalls, null, 2));
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockRepo.find).not.toHaveBeenCalled();
  });

  it('handles server error', async () => {
    mockRepo.find.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/events/day?date=2025-05-05');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
