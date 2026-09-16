export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Same format as the sample books, e.g. "16 Eylül 2026"
export function formatTurkishDate(date) {
  return `${date.getDate()} ${TURKISH_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Year a finished book was read, or null when it cannot be determined.
// Older entries were saved with the literal text "Bugün", so the row's creation time is used for them.
export function getReadYear(book) {
  if (book.status !== 'read') return null;

  const text = book.readDate || '';
  if (/bugün/i.test(text)) {
    return book.createdAt ? new Date(book.createdAt).getFullYear() : null;
  }

  const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  return yearMatch ? Number(yearMatch[1]) : null;
}
