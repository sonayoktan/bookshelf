import { supabase } from './supabase';

const TABLE = 'reading_goals';

// Returns the target book count for the year, or null when no goal is set
export async function fetchReadingGoal(userId, year) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('target_books')
    .eq('user_id', userId)
    .eq('year', year)
    .maybeSingle();

  if (error) throw error;
  return data?.target_books ?? null;
}

export async function saveReadingGoal(userId, year, targetBooks) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, year, target_books: targetBooks },
      { onConflict: 'user_id,year' }
    );

  if (error) throw error;
}
