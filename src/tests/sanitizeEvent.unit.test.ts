import { sanitizeEvent } from '../controllers/eventController';

describe('sanitizeEvent', () => {
  it('retourne les bons champs date/heure pour même jour', () => {
    const input = {
      EVEN_ID: 1,
      EVEC_LIB: 'Test',
      EVED_START: '2025-06-01T09:00:00.000Z',
      EVED_END: '2025-06-01T11:00:00.000Z',
      USEN_ID: 1,
      ACCN_ID: 1,
    };
    const res = sanitizeEvent(input);
    expect(res.DATE_START).toBe('2025-06-01');
    expect(res.DATE_END).toBe('2025-06-01');
    expect(res.DATE_START).toBe(res.DATE_END);
    expect(res.START_TIME).toBe('09:00');
    expect(res.END_TIME).toBe('11:00');
  });

  it('retourne les bons champs date/heure pour plusieurs jours', () => {
    const input = {
      EVEN_ID: 2,
      EVEC_LIB: 'Test multi',
      EVED_START: '2025-06-01T09:00:00.000Z',
      EVED_END: '2025-06-03T18:00:00.000Z',
      USEN_ID: 2,
      ACCN_ID: 2,
    };
    const res = sanitizeEvent(input);
    expect(res.DATE_START).toBe('2025-06-01');
    expect(res.DATE_END).toBe('2025-06-03');
    expect(res.DATE_START).not.toBe(res.DATE_END);
    expect(res.START_TIME).toBe('09:00');
    expect(res.END_TIME).toBe('18:00');
  });

  it('gère les valeurs null ou invalides', () => {
    const input = {
      EVEN_ID: 3,
      EVEC_LIB: 'Test null',
      EVED_START: null,
      EVED_END: null,
      USEN_ID: 3,
      ACCN_ID: 3,
    };
    const res = sanitizeEvent(input);
    expect(res.DATE_START).toBe('');
    expect(res.DATE_END).toBe('');
    expect(res.START_TIME).toBe('');
    expect(res.END_TIME).toBe('');
  });
});
