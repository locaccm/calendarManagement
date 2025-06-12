import {
  eventCreateSchema,
  eventUpdateSchema,
  eventIdParamSchema,
  eventFilterQuerySchema,
} from '../validation/eventSchemas';

describe('Event Validation Schemas', () => {
  describe('eventCreateSchema', () => {
    test('should validate a valid event with ISO dates', () => {
      // Arrange
      const validEvent = {
        EVEC_LIB: 'Test Event',
        EVED_START: '2023-01-01T10:00:00Z',
        EVED_END: '2023-01-01T12:00:00Z',
        USEN_ID: 1,
        ACCN_ID: 2,
      };

      // Act
      const result = eventCreateSchema.safeParse(validEvent);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should validate a valid event with split date/time fields', () => {
      // Arrange
      const validEvent = {
        EVEC_LIB: 'Test Event',
        date: '2023-01-01',
        startTime: '10:00',
        endTime: '12:00',
        USEN_ID: 1,
        ACCN_ID: 2,
      };

      // Act
      const result = eventCreateSchema.safeParse(validEvent);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should reject event with invalid date format', () => {
      // Arrange
      const invalidEvent = {
        EVEC_LIB: 'Test Event',
        date: 'invalid-date',
        startTime: '10:00',
        endTime: '12:00',
        USEN_ID: 1,
        ACCN_ID: 2,
      };

      // Act
      const result = eventCreateSchema.safeParse(invalidEvent);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('eventUpdateSchema', () => {
    test('should validate a partial update with only some fields', () => {
      // Arrange
      const validUpdate = {
        EVEC_LIB: 'Updated Event',
      };

      // Act
      const result = eventUpdateSchema.safeParse(validUpdate);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should validate an empty update', () => {
      // Arrange
      const emptyUpdate = {};

      // Act
      const result = eventUpdateSchema.safeParse(emptyUpdate);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('eventIdParamSchema', () => {
    test('should validate valid numeric ID', () => {
      // Arrange
      const validId = { id: '123' };

      // Act
      const result = eventIdParamSchema.safeParse(validId);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should reject non-numeric ID', () => {
      // Arrange
      const invalidId = { id: 'abc' };

      // Act
      const result = eventIdParamSchema.safeParse(invalidId);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('eventFilterQuerySchema', () => {
    test('should validate query with no params', () => {
      // Arrange
      const emptyQuery = {};

      // Act
      const result = eventFilterQuerySchema.safeParse(emptyQuery);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
