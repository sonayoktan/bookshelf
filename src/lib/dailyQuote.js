function hashString(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getLocalDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Picks one quote from the user's books; stays the same for the whole day and changes the next day
export function pickDailyQuote(books, seed = '', date = new Date()) {
  const quotes = books.flatMap((book) =>
    (book.quotes || [])
      .filter((text) => text && text.trim())
      .map((text) => ({ text, book }))
  );
  if (quotes.length === 0) return null;

  const index = hashString(`${getLocalDateKey(date)}:${seed}`) % quotes.length;
  return quotes[index];
}
