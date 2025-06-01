import { normalizeRequestDates } from '../utils/dateFormatHelper';

describe('normalizeRequestDates', () => {
  it('returns ISO fields if already present', () => {
    const req = { body: { EVED_START: '2025-06-01T10:00:00Z', EVED_END: '2025-06-01T12:00:00Z' } };
    expect(normalizeRequestDates(req as any)).toEqual({
      EVED_START: '2025-06-01T10:00:00Z',
      EVED_END: '2025-06-01T12:00:00Z',
    });
  });

  it('handles extended format (dateStart/dateEnd)', () => {
    const req = { body: { dateStart: '2025-06-01', startTime: '10:00', dateEnd: '2025-06-02', endTime: '12:00' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBe('2025-06-01T10:00:00.000Z');
    expect(result.EVED_END).toBe('2025-06-02T12:00:00.000Z');
    expect((req.body as any).DATE_START).toBe('2025-06-01');
    expect((req.body as any).START_TIME).toBe('10:00');
    expect((req.body as any).DATE_END).toBe('2025-06-02');
    expect((req.body as any).END_TIME).toBe('12:00');
  });

  it('handles single day event (date, startTime, endTime)', () => {
    const req = { body: { date: '2025-06-01', startTime: '10:00', endTime: '12:00' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBe('2025-06-01T10:00:00.000Z');
    expect(result.EVED_END).toBe('2025-06-01T12:00:00.000Z');
    expect((req.body as any).DATE_START).toBe('2025-06-01');
    expect((req.body as any).START_TIME).toBe('10:00');
    expect((req.body as any).DATE_END).toBe('2025-06-01');
    expect((req.body as any).END_TIME).toBe('12:00');
  });

  it('handles standard split format (DATE_START, START_TIME, DATE_END, END_TIME)', () => {
    const req = { body: { DATE_START: '2025-06-01', START_TIME: '10:00', DATE_END: '2025-06-02', END_TIME: '12:00' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBe('2025-06-01T10:00:00.000Z');
    expect(result.EVED_END).toBe('2025-06-02T12:00:00.000Z');
  });

  it('returns undefined for missing fields', () => {
    const req = { body: {} };
    expect(normalizeRequestDates(req as any)).toEqual({ EVED_START: undefined, EVED_END: undefined });
  });

  it('handles partial data (only start)', () => {
    const req = { body: { DATE_START: '2025-06-01', START_TIME: '10:00' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBe('2025-06-01T10:00:00.000Z');
    expect(result.EVED_END).toBeUndefined();
  });

  it('handles partial data (only end)', () => {
    const req = { body: { DATE_END: '2025-06-02', END_TIME: '12:00' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBeUndefined();
    expect(result.EVED_END).toBe('2025-06-02T12:00:00.000Z');
  });

  it('handles invalid dates gracefully', () => {
    const req = { body: { DATE_START: 'invalid', START_TIME: 'invalid' } };
    const result = normalizeRequestDates(req as any);
    expect(result.EVED_START).toBe('2000-01-01T00:00:00.000Z');
  });
});
