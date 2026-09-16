import { useState, useEffect } from 'react';
import { supabase, isAuthEnabled } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isAuthEnabled);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return {
    user: session?.user ?? null,
    isAuthLoading,
    signOut
  };
}

export function getDisplayName(user) {
  if (!user) return '';
  return user.user_metadata?.display_name || user.email?.split('@')[0] || '';
}
