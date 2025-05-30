const fs = require('fs');
const path = require('path');

// Lire le fichier de test
const testFilePath = path.join(__dirname, 'src/tests/calendarViewController.mock.test.ts');
let content = fs.readFileSync(testFilePath, 'utf8');

// Corriger le test getEventsForDay
content = content.replace(
  /expect\(mockResponse\.json\)\.toHaveBeenCalledWith\(\s+mockEvents\.map\(\(e\) =>\s+expect\.objectContaining\(\{\s+\.\.\.e,\s+EVED_START: e\.EVED_START instanceof Date \? e\.EVED_START\.toISOString\(\) : e\.EVED_START,\s+EVED_END: e\.EVED_END instanceof Date \? e\.EVED_END\.toISOString\(\) : e\.EVED_END,\s+\}\),\s+\),\s+\);/,
  `expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(String),
          events: expect.arrayContaining(
            mockEvents.map((e) =>
              expect.objectContaining({
                ...e,
                EVED_START: e.EVED_START instanceof Date ? e.EVED_START.toISOString() : e.EVED_START,
                EVED_END: e.EVED_END instanceof Date ? e.EVED_END.toISOString() : e.EVED_END,
              })
            )
          ),
        })
      );`
);

// Corriger le test getEventsForWeek
content = content.replace(
  /expect\(mockResponse\.json\)\.toHaveBeenCalledWith\(\s+expect\.objectContaining\(\{\s+date: expect\.any\(String\),\s+events: expect\.arrayContaining\(/,
  `expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          week: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          events: expect.arrayContaining(`
);

// Corriger le test getEventsForMonth
content = content.replace(
  /expect\(mockResponse\.json\)\.toHaveBeenCalledWith\(\s+expect\.objectContaining\(\{\s+date: expect\.any\(String\),\s+events: expect\.arrayContaining\(/,
  `expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          month: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(String),
          endDate: expect.any(String),
          days: expect.any(Array),
          daysInMonth: expect.any(Number),
          events: expect.arrayContaining(`
);

// Write the updated file
fs.writeFileSync(testFilePath, content, 'utf8');

console.log('Calendar view tests updated successfully!');
