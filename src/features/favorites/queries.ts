import { createClient } from '@/lib/supabase/server';
import { type CoachListItem } from '@/features/coaches/types';

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

interface RawFavoriteCoach {
  coach_sports?: { sport: CoachListItem['sports'][number] | null }[];
  [key: string]: unknown;
}

/** Full favorite coaches for the favorites page. */
export async function getFavoriteCoaches(): Promise<CoachListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('favorites')
    .select(
      `coach:coach_profiles(
        *,
        profile:profiles(full_name, avatar_url),
        coach_sports(sport:sports(id, slug, name, icon))
      )`,
    )
    .eq('athlete_id', user.id);

  return ((data ?? []) as unknown as { coach: RawFavoriteCoach | null }[])
    .map((row) => row.coach)
    .filter((c): c is RawFavoriteCoach => Boolean(c))
    .map((raw) => {
      const { coach_sports, ...coach } = raw;
      const sports = (coach_sports ?? [])
        .map((cs) => cs.sport)
        .filter((s): s is NonNullable<typeof s> => Boolean(s));
      return { ...(coach as unknown as CoachListItem), sports };
    });
}
