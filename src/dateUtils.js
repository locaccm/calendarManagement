// Utilitaires de dates pour les tests

function parseFrenchDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return null;
  return new Date(`${year}-${month}-${day}`);
}

function parseFrenchDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;
  const [date, time] = dateTimeStr.split(' ');
  const parsedDate = parseFrenchDate(date);
  if (!parsedDate || !time) return null;
  const [hours, minutes] = time.split(':');
  parsedDate.setHours(Number(hours) || 0, Number(minutes) || 0);
  return parsedDate;
}

function formatTimeToFrench(date) {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function parseISODate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function parseISODateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;
  const date = new Date(dateTimeStr);
  return isNaN(date.getTime()) ? null : date;
}

function formatDateToFrench(date) {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleDateString('fr-FR');
}

function formatDateToISO(date) {
  if (!date || !(date instanceof Date)) return '';
  return date.toISOString().split('T')[0];
}

function formatDateTimeToFrench(date) {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeToISO(date) {
  if (!date || !(date instanceof Date)) return '';
  return date.toISOString();
}

module.exports = {
  parseFrenchDate,
  parseFrenchDateTime,
  formatTimeToFrench,
  parseISODate,
  parseISODateTime,
  formatDateToFrench,
  formatDateToISO,
  formatDateTimeToFrench,
  formatDateTimeToISO,
};
