import { supabase } from './supabase';

const TABLE = 'books';

// Maps the app's camelCase book object to a database row (without ownership / ordering columns)
function toRow(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author || '',
    cover_url: book.coverUrl || null,
    rating: Number(book.rating) || 0,
    genre: book.genre || null,
    spine_color: book.spineColor || null,
    spine_pattern: book.spinePattern || null,
    pages: book.pages ? Number(book.pages) : null,
    year: book.year || null,
    read_date: book.readDate || null,
    status: book.status,
    favorite: Boolean(book.favorite),
    review: book.review || '',
    quotes: book.quotes || [],
    shelf_number: book.shelfNumber ?? null
  };
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    rating: row.rating,
    genre: row.genre,
    spineColor: row.spine_color,
    spinePattern: row.spine_pattern,
    pages: row.pages,
    year: row.year,
    readDate: row.read_date,
    status: row.status,
    favorite: row.favorite,
    review: row.review,
    quotes: row.quotes || [],
    shelfNumber: row.shelf_number,
    createdAt: row.created_at
  };
}

export async function fetchBooks(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false });

  if (error) throw error;
  return data.map(fromRow);
}

// Inserts books at the front of the shelf, keeping their given order.
// With overwrite = false, books whose id already exists are left untouched.
export async function insertBooks(userId, books, { overwrite = false } = {}) {
  if (books.length === 0) return;

  const base = Date.now();
  const rows = books.map((book, index) => ({
    ...toRow(book),
    user_id: userId,
    sort_order: base - index
  }));

  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'user_id,id', ignoreDuplicates: !overwrite });

  if (error) throw error;
}

export async function updateBook(userId, book) {
  const { error } = await supabase
    .from(TABLE)
    .update(toRow(book))
    .eq('user_id', userId)
    .eq('id', book.id);

  if (error) throw error;
}

export async function deleteBook(userId, bookId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('id', bookId);

  if (error) throw error;
}
