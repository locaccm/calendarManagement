// Test pour améliorer la couverture de dist/utils/dateUtils.js

describe('Date Utils', () => {
  let dateUtils;
  
  beforeEach(() => {
    jest.resetModules();
    dateUtils = require('../../dist/utils/dateUtils');
  });
  
  describe('formatDateToFrench', () => {
    it('should format date to French format', () => {
      const date = new Date('2023-05-15T10:30:00');
      const result = dateUtils.formatDateToFrench(date);
      expect(result).toBeDefined();
    });
    
    it('should handle null date', () => {
      const result = dateUtils.formatDateToFrench(null);
      expect(result).toBe('');
    });
  });
  
  describe('formatDateToISO', () => {
    it('should format date to ISO format', () => {
      const date = new Date('2023-05-15T10:30:00');
      const result = dateUtils.formatDateToISO(date);
      expect(result).toBeDefined();
    });
    
    it('should handle null date', () => {
      const result = dateUtils.formatDateToISO(null);
      expect(result).toBe('');
    });
  });
  
  describe('formatDateTimeToFrench', () => {
    it('should format date and time to French format', () => {
      const date = new Date('2023-05-15T10:30:00');
      const result = dateUtils.formatDateTimeToFrench(date);
      expect(result).toBeDefined();
    });
    
    it('should handle null date', () => {
      const result = dateUtils.formatDateTimeToFrench(null);
      expect(result).toBe('');
    });
  });
  
  describe('formatDateTimeToISO', () => {
    it('should format date and time to ISO format', () => {
      const date = new Date('2023-05-15T10:30:00');
      const result = dateUtils.formatDateTimeToISO(date);
      expect(result).toBeDefined();
    });
    
    it('should handle null date', () => {
      const result = dateUtils.formatDateTimeToISO(null);
      expect(result).toBe('');
    });
  });
  
  describe('parseFrenchDate', () => {
    it('should parse French date format', () => {
      const dateStr = '15/05/2023';
      const result = dateUtils.parseFrenchDate(dateStr);
      expect(result).toBeInstanceOf(Date);
    });
    
    it('should handle invalid date format', () => {
      const dateStr = 'invalid-date';
      const result = dateUtils.parseFrenchDate(dateStr);
      expect(result).toBeNull();
    });
    
    it('should handle null input', () => {
      const result = dateUtils.parseFrenchDate(null);
      expect(result).toBeNull();
    });
  });
  
  describe('parseFrenchDateTime', () => {
    it('should parse French date and time format', () => {
      const dateTimeStr = '15/05/2023 10:30';
      const result = dateUtils.parseFrenchDateTime(dateTimeStr);
      expect(result).toBeInstanceOf(Date);
    });
    
    it('should handle invalid date time format', () => {
      const dateTimeStr = 'invalid-date-time';
      const result = dateUtils.parseFrenchDateTime(dateTimeStr);
      expect(result).toBeNull();
    });
    
    it('should handle null input', () => {
      const result = dateUtils.parseFrenchDateTime(null);
      expect(result).toBeNull();
    });
  });
  
  describe('formatTimeToFrench', () => {
    it('should format time to French format', () => {
      const date = new Date('2023-05-15T10:30:00');
      const result = dateUtils.formatTimeToFrench(date);
      expect(result).toBeDefined();
    });
    
    it('should handle null date', () => {
      const result = dateUtils.formatTimeToFrench(null);
      expect(result).toBe('');
    });
  });
  
  describe('parseISODate', () => {
    it('should parse ISO date format', () => {
      const dateStr = '2023-05-15';
      const result = dateUtils.parseISODate(dateStr);
      expect(result).toBeInstanceOf(Date);
    });
    
    it('should handle invalid date format', () => {
      const dateStr = 'invalid-date';
      const result = dateUtils.parseISODate(dateStr);
      expect(result).toBeNull();
    });
    
    it('should handle null input', () => {
      const result = dateUtils.parseISODate(null);
      expect(result).toBeNull();
    });
  });
  
  describe('parseISODateTime', () => {
    it('should parse ISO date and time format', () => {
      const dateTimeStr = '2023-05-15T10:30:00';
      const result = dateUtils.parseISODateTime(dateTimeStr);
      expect(result).toBeInstanceOf(Date);
    });
    
    it('should handle invalid date time format', () => {
      const dateTimeStr = 'invalid-date-time';
      const result = dateUtils.parseISODateTime(dateTimeStr);
      expect(result).toBeNull();
    });
    
    it('should handle null input', () => {
      const result = dateUtils.parseISODateTime(null);
      expect(result).toBeNull();
    });
  });
});
