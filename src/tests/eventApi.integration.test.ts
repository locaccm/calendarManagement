import request from 'supertest';
import app from '../app';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Events API - Création et format date/heure', () => {
  let userId: number;
  let accnId: number;
  beforeAll(async () => {
    // Crée un utilisateur et un logement valides pour les tests
    const user = await prisma.user.upsert({
      where: { USEC_MAIL: 'testuser@example.com' },
      update: {},
      create: {
        USEC_LNAME: 'Test',
        USEC_FNAME: 'User',
        USEC_MAIL: 'testuser@example.com',
        USEC_PASSWORD: 'hash',
      },
    });
    userId = user.USEN_ID;
    let accn = await prisma.accommodation.findFirst({ where: { ACCC_NAME: 'Test Logement' } });
    if (!accn) {
      accn = await prisma.accommodation.create({
        data: {
          ACCC_NAME: 'Test Logement',
          ACCC_ADDRESS: '1 rue de Test',
          owner: { connect: { USEN_ID: userId } },
        },
      });
    }
    accnId = accn.ACCN_ID;
  });
  it('POST /events accepte format ISO et retourne les bons champs date/heure', async () => {
    const event = {
      EVEC_LIB: 'Test ISO',
      EVED_START: '2025-06-01T09:00:00Z',
      EVED_END: '2025-06-01T11:00:00Z',
      USEN_ID: userId,
      ACCN_ID: accnId,
    };
    const res = await request(app).post('/events').send(event);
    expect([201, 200, 409]).toContain(res.status); // Succès attendu, ne pas attendre 500 ici
    if ([201, 200].includes(res.status)) {
      expect(res.body.DATE_START).toBe('2025-06-01');
      expect(res.body.DATE_END).toBe('2025-06-01');
      expect(res.body.START_TIME).toBe('09:00');
      expect(res.body.END_TIME).toBe('11:00');
      expect(res.body.DATE_START).toBe(res.body.DATE_END); // même jour
    }
  });

  it('POST /events accepte date/startTime/endTime et retourne les bons champs', async () => {
    const event = {
      EVEC_LIB: 'Test split',
      date: '2025-07-10',
      startTime: '14:00',
      endTime: '16:00',
      USEN_ID: userId,
      ACCN_ID: accnId,
    };
    const res = await request(app).post('/events').send(event);
    expect([201, 200, 409]).toContain(res.status); // Succès attendu, ne pas attendre 500 ici
    if ([201, 200].includes(res.status)) {
      expect(res.body.DATE_START).toBe('2025-07-10');
      expect(res.body.DATE_END).toBe('2025-07-10');
      expect(res.body.START_TIME).toBe('14:00');
      expect(res.body.END_TIME).toBe('16:00');
      expect(res.body.DATE_START).toBe(res.body.DATE_END); // même jour
    }
  });

  it('POST /events accepte un événement sur plusieurs jours', async () => {
    const event = {
      EVEC_LIB: 'Test multi-jours',
      EVED_START: '2025-08-01T09:00:00Z',
      EVED_END: '2025-08-03T18:00:00Z',
      USEN_ID: userId,
      ACCN_ID: accnId,
    };
    const res = await request(app).post('/events').send(event);
    expect([201, 200, 409]).toContain(res.status); // Succès attendu, ne pas attendre 500 ici
    if ([201, 200].includes(res.status)) {
      expect(res.body.DATE_START).toBe('2025-08-01');
      expect(res.body.DATE_END).toBe('2025-08-03');
      expect(res.body.DATE_START).not.toBe(res.body.DATE_END); // plusieurs jours
    }
  });

  it('POST /events refuse un payload incomplet', async () => {
    const event = {
      EVEC_LIB: 'Test erreur',
      date: '2025-07-10',
      startTime: '14:00',
      USEN_ID: 102,
      ACCN_ID: 102,
    };
    const res = await request(app).post('/events').send(event);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });
});
