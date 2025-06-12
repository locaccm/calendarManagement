const fs = require('fs');
const path = require('path');

// Lire le fichier de test
const testFilePath = path.join(__dirname, 'src/tests/eventController.mock.test.ts');
let content = fs.readFileSync(testFilePath, 'utf8');

// Update createEvent test to reflect that conflicts are allowed
content = content.replace(
  /it\('should return 409 when there is a conflict', async \(\) => \{[\s\S]*?expect\(typedPrismaMock\.event\.create\)\.not\.toHaveBeenCalled\(\);[\s\S]*?expect\(mockResponse\.status\)\.toHaveBeenCalledWith\(409\);[\s\S]*?expect\(mockResponse\.json\)\.toHaveBeenCalled\(\);[\s\S]*?\}\);/,
  `it('should create an event even when there is a conflict (conflicts allowed)', async () => {
      mockRequest.body = {
        EVEC_LIB: 'New Event',
        DATE_START: '2025-06-01',
        START_TIME: '00:00',
        DATE_END: '2025-06-02',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      const mockEvent = {
        EVEN_ID: 1,
        EVEC_LIB: 'New Event',
        EVED_START: new Date('2025-06-01T00:00:00.000Z'),
        EVED_END: new Date('2025-06-02T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Even with a conflict, the event should be created as conflicts are allowed
      typedPrismaMock.event.findFirst.mockResolvedValue({
        EVEN_ID: 2,
        EVEC_LIB: 'Existing Event',
        EVED_START: new Date('2025-06-01T00:00:00.000Z'),
        EVED_END: new Date('2025-06-02T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });

      typedPrismaMock.event.create.mockResolvedValue(mockEvent);

      // Act
      await createEvent(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(typedPrismaMock.event.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });`
);

// Update updateEvent test to reflect that conflicts are allowed
content = content.replace(
  /it\('should return 409 when there is a conflict', async \(\) => \{[\s\S]*?expect\(typedPrismaMock\.event\.update\)\.not\.toHaveBeenCalled\(\);[\s\S]*?expect\(mockResponse\.status\)\.toHaveBeenCalledWith\(409\);[\s\S]*?expect\(mockResponse\.json\)\.toHaveBeenCalled\(\);[\s\S]*?\}\);/,
  `it('should update an event even when there is a conflict (conflicts allowed)', async () => {
      const eventId = 1;
      mockRequest.params = { id: eventId.toString() };
      mockRequest.body = {
        EVEC_LIB: 'Updated Event',
        DATE_START: '2025-06-03',
        START_TIME: '00:00',
        DATE_END: '2025-06-04',
        END_TIME: '00:00',
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      const existingEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Existing Event',
        EVED_START: new Date('2025-05-01T00:00:00.000Z'),
        EVED_END: new Date('2025-05-02T00:00:00.000Z'),
        USEN_ID: 1,
        ACCN_ID: 1,
      };

      const updatedEvent = {
        EVEN_ID: eventId,
        EVEC_LIB: 'Updated Event',
        EVED_START: new Date('2025-06-03T00:00:00.000Z'),
        EVED_END: new Date('2025-06-04T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      };

      // Even with a conflict, the event should be updated as conflicts are allowed
      typedPrismaMock.event.findUnique.mockResolvedValue(existingEvent);
      typedPrismaMock.event.findFirst.mockResolvedValue({
        EVEN_ID: 2,
        EVEC_LIB: 'Conflict Event',
        EVED_START: new Date('2025-06-03T00:00:00.000Z'),
        EVED_END: new Date('2025-06-04T00:00:00.000Z'),
        USEN_ID: 2,
        ACCN_ID: 2,
      });
      typedPrismaMock.event.update.mockResolvedValue(updatedEvent);

      await updateEvent(mockRequest as Request, mockResponse as Response);

      expect(typedPrismaMock.event.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });`
);

// Write the updated file
fs.writeFileSync(testFilePath, content, 'utf8');

console.log('Conflict tests updated successfully!');
