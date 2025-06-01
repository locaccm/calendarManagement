import { 
  eventCreateSchema, 
  eventUpdateSchema, 
  eventIdParamSchema,
  eventFilterQuerySchema
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
        ACCN_ID: 2
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
        ACCN_ID: 2
      };

      // Act
      const result = eventCreateSchema.safeParse(validEvent);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should reject event with missing date information', () => {
      // Arrange
      const invalidEvent = {
        EVEC_LIB: 'Test Event',
        USEN_ID: 1,
        ACCN_ID: 2
      };

      // Act
      const result = eventCreateSchema.safeParse(invalidEvent);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Il faut fournir soit EVED_START/EVED_END, soit date/startTime/endTime');
      }
    });

    test('should reject event with invalid date format', () => {
      // Arrange
      const invalidEvent = {
        EVEC_LIB: 'Test Event',
        date: 'invalid-date',
        startTime: '10:00',
        endTime: '12:00',
        USEN_ID: 1,
        ACCN_ID: 2
      };

      // Act
      const result = eventCreateSchema.safeParse(invalidEvent);

      // Assert
      expect(result.success).toBe(false);
    });

    test('should reject event with missing required fields', () => {
      // Arrange
      const invalidEvent = {
        EVED_START: '2023-01-01T10:00:00Z',
        EVED_END: '2023-01-01T12:00:00Z',
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
        EVEC_LIB: 'Updated Event'
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

    test('should reject update with invalid field values', () => {
      // Arrange
      const invalidUpdate = {
        EVEC_LIB: '',  // Empty string not allowed
        USEN_ID: 'not-a-number'
      };

      // Act
      const result = eventUpdateSchema.safeParse(invalidUpdate);

      // Assert
      expect(result.success).toBe(false);
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
    test('should validate and transform valid query params', () => {
      // Arrange
      const validQuery = {
        usager: '1',
        logement: '2',
        dateStart: '2023-01-01',
        dateEnd: '2023-01-31'
      };

      // Act
      const result = eventFilterQuerySchema.safeParse(validQuery);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          usager: 1,
          logement: 2,
          dateStart: '2023-01-01',
          dateEnd: '2023-01-31'
        });
      }
    });

    test('should validate query with no params', () => {
      // Arrange
      const emptyQuery = {};

      // Act
      const result = eventFilterQuerySchema.safeParse(emptyQuery);

      // Assert
      expect(result.success).toBe(true);
    });

    test('should reject invalid usager param', () => {
      // Arrange
      const invalidQuery = {
        usager: 'abc'
      };

      // Act
      const result = eventFilterQuerySchema.safeParse(invalidQuery);

      // Assert
      expect(result.success).toBe(false);
    });

    test('should reject invalid logement param', () => {
      // Arrange
      const invalidQuery = {
        logement: 'abc'
      };

      // Act
      const result = eventFilterQuerySchema.safeParse(invalidQuery);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
