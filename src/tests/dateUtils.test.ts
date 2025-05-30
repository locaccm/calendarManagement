import {
  createUTCDateFromParts,
  enrichEventWithDateTimeParts,
  extractDatePart,
  extractTimePart,
} from '../utils/dateUtils';

describe('Date Utils', () => {
  describe('createUTCDateFromParts', () => {
    it('should create a UTC date from parts', () => {
      // Arrange
      const year = 2025;
      const month = 5; // Mai
      const day = 15;
      const hour = 10;
      const minute = 30;
      const second = 0;

      // Act
      const result = createUTCDateFromParts(year, month, day, hour, minute, second);

      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(year);
      expect(result.getUTCMonth()).toBe(month - 1); // Months in JS are 0-indexed
      expect(result.getUTCDate()).toBe(day);
      expect(result.getUTCHours()).toBe(hour);
      expect(result.getUTCMinutes()).toBe(minute);
      expect(result.getUTCSeconds()).toBe(second);
    });

    it('should handle single digit values correctly', () => {
      // Arrange
      const year = 2025;
      const month = 1; // Janvier
      const day = 1;
      const hour = 1;
      const minute = 5;
      const second = 0;

      // Act
      const result = createUTCDateFromParts(year, month, day, hour, minute, second);

      // Assert
      expect(result.getUTCFullYear()).toBe(year);
      expect(result.getUTCMonth()).toBe(month - 1);
      expect(result.getUTCDate()).toBe(day);
      expect(result.getUTCHours()).toBe(hour);
      expect(result.getUTCMinutes()).toBe(minute);
    });

    it('should handle month edge cases', () => {
      // Arrange & Act
      const decemberDate = createUTCDateFromParts(2025, 12, 31, 23, 59, 59);

      // Assert
      expect(decemberDate.getUTCFullYear()).toBe(2025);
      expect(decemberDate.getUTCMonth()).toBe(11); // December is 11 in JS
      expect(decemberDate.getUTCDate()).toBe(31);
    });
  });

  describe('extractDatePart', () => {
    it('should extract date part in YYYY-MM-DD format', () => {
      // Arrange
      const date = new Date('2025-05-15T10:30:00Z');

      // Act
      const result = extractDatePart(date);

      // Assert
      expect(result).toBe('2025-05-15');
    });

    it('should handle single digit month and day', () => {
      // Arrange
      const date = new Date('2025-01-01T00:00:00Z');

      // Act
      const result = extractDatePart(date);

      // Assert
      expect(result).toBe('2025-01-01');
    });
  });

  describe('extractTimePart', () => {
    it('should extract time part in HH:MM format', () => {
      // Arrange
      const date = new Date('2025-05-15T10:30:00Z');

      // Act
      const result = extractTimePart(date);

      // Assert
      expect(result).toBe('10:30');
    });

    it('should handle single digit hour and minute', () => {
      // Arrange
      const date = new Date('2025-05-15T01:05:00Z');

      // Act
      const result = extractTimePart(date);

      // Assert
      expect(result).toBe('01:05');
    });

    it('should handle midnight correctly', () => {
      // Arrange
      const date = new Date('2025-05-15T00:00:00Z');

      // Act
      const result = extractTimePart(date);

      // Assert
      expect(result).toBe('00:00');
    });
  });

  describe('enrichEventWithDateTimeParts', () => {
    it('should enrich event with date and time parts', () => {
      // Arrange
      const event = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: new Date('2025-05-15T10:30:00Z'),
        EVED_END: new Date('2025-05-15T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      // Act - Force enrichment even in test environment
      const result = enrichEventWithDateTimeParts(event, true);

      // Assert
      expect(result).toEqual({
        ...event,
        startDate: '2025-05-15',
        startTime: '10:30',
        endDate: '2025-05-15',
        endTime: '12:00',
      });
    });

    it('should handle null dates', () => {
      // Arrange
      const event = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: null,
        EVED_END: null,
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      // Act
      const result = enrichEventWithDateTimeParts(event);

      // Assert
      expect(result).toEqual({
        ...event,
      });
      expect(result.startDate).toBeUndefined();
      expect(result.startTime).toBeUndefined();
      expect(result.endDate).toBeUndefined();
      expect(result.endTime).toBeUndefined();
    });

    it('should skip enrichment in test environment unless forced', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const event = {
        EVEN_ID: 1,
        EVEC_LIB: 'Test Event',
        EVED_START: new Date('2025-05-15T10:30:00Z'),
        EVED_END: new Date('2025-05-15T12:00:00Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      // Act - Sans forcer l'enrichissement
      const resultWithoutForce = enrichEventWithDateTimeParts(event);

      // Act - By forcing enrichment
      const resultWithForce = enrichEventWithDateTimeParts(event, true);

      // Restore
      process.env.NODE_ENV = originalNodeEnv;

      // Assert
      expect(resultWithoutForce).toEqual(event); // Pas d'enrichissement

      expect(resultWithForce).toEqual({
        ...event,
        startDate: '2025-05-15',
        startTime: '10:30',
        endDate: '2025-05-15',
        endTime: '12:00',
      }); // Forced enrichment
    });
  });
});
