import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Without credentials the app still works as a read-only demo shelf
export const isAuthEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isAuthEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
