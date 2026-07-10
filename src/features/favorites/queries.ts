import { createClient } from '@/lib/supabase/server';

/** Set of coach ids the current user has favorited (empty if logged out). */
export async function getFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('favorites')
    .select('coach_id')
    .eq('athlete_id', user.id);

  return new Set((data ?? []).map((f) => f.coach_id));
}
