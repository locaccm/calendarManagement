import { sanitizeEvent } from '../controllers/eventController';

describe('sanitizeEvent', () => {
  it('returns correct date/time fields for same day', () => {
    const input = {
      EVEN_ID: 1,
      EVEC_LIB: 'Test',
      EVED_START: '2025-06-01T09:00:00.000Z',
      EVED_END: '2025-06-01T11:00:00.000Z',
      USEN_ID: 1,
      ACCN_ID: 1,
    };
    const res = sanitizeEvent(input);
    // Les dates sont maintenant toujours au format ISO complet
    expect(res.EVED_START).toBe('2025-06-01T09:00:00.000Z');
    expect(res.EVED_END).toBe('2025-06-01T11:00:00.000Z');
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
    // Les dates sont maintenant toujours au format ISO complet
    expect(res.EVED_START).toBe('2025-06-01T09:00:00.000Z');
    expect(res.EVED_END).toBe('2025-06-03T18:00:00.000Z');
    expect(res.EVED_START).not.toBe(res.EVED_END);
  });

  it('handles null or invalid values', () => {
    const input = {
      EVEN_ID: 3,
      EVEC_LIB: 'Test null',
      EVED_START: null,
      EVED_END: null,
      USEN_ID: 3,
      ACCN_ID: 3,
    };
    const res = sanitizeEvent(input);
    // Null values are converted to empty strings
    expect(res.EVED_START).toBe('');
    expect(res.EVED_END).toBe('');
  });
});
