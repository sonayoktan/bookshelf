export function normalizeStr(str) {
  return (str || '').trim().toLocaleLowerCase('tr-TR');
}

export function getSearchScore(book, query) {
  if (!query || !query.trim()) return 0;
  const q = normalizeStr(query);
  const title = normalizeStr(book.title);
  const author = normalizeStr(book.author);
  const genre = normalizeStr(book.genre);
  const review = normalizeStr(book.review);
  const quotes = (book.quotes || []).map(normalizeStr);

  // 1. Kitap adı doğrudan aranan harf/ifade ile başlıyorsa (En yüksek öncelik)
  if (title.startsWith(q)) return 1;

  // 2. Kitap adındaki herhangi bir kelime aranan ifade ile başlıyorsa
  const titleWords = title.split(/\s+/);
  if (titleWords.some(w => w.startsWith(q))) return 2;

  // 3. Kitap adı aranan ifadeyi içeriyorsa
  if (title.includes(q)) return 3;

  // 4. Yazar adı doğrudan aranan harf/ifade ile başlıyorsa (Peşisıra yazarlar)
  if (author.startsWith(q)) return 4;

  // 5. Yazar adındaki herhangi bir kelime (soyad vb.) aranan ifade ile başlıyorsa
  const authorWords = author.split(/\s+/);
  if (authorWords.some(w => w.startsWith(q))) return 5;

  // 6. Yazar adı aranan ifadeyi içeriyorsa
  if (author.includes(q)) return 6;

  // 7. Tür eşleşmesi
  if (genre.startsWith(q)) return 7;
  if (genre.includes(q)) return 8;

  // 8. Alıntı veya inceleme notu eşleşmesi
  if (quotes.some(qt => qt.includes(q))) return 9;
  if (review.includes(q)) return 10;

  return 999; // Eşleşme yok
}

export function getMatchType(book, query) {
  const score = getSearchScore(book, query);
  if (score <= 3) return 'Kitap Adı';
  if (score <= 6) return 'Yazar';
  if (score <= 8) return 'Tür';
  if (score === 9) return 'Alıntı';
  if (score === 10) return 'Not';
  return 'Eşleşme';
}
