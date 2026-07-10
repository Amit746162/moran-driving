import { createClient } from '@/lib/supabase/server';
import { type CoachListItem } from '@/features/coaches/types';

/**
 * AI Coach Recommendations (Phase 5 scaffold).
 *
 * MVP ships a transparent heuristic ranking (rating × reviews × recency,
 * optionally filtered to the athlete's sport/location). The interface is built
 * so it can be swapped for a vector-similarity / embeddings model — e.g. embed
 * coach bios + athlete goals and rank by cosine similarity — without changing
 * the call site.
 */

export interface RecommendationContext {
  athleteId?: string;
  sportSlug?: string;
  country?: string;
  limit?: number;
}

interface RawCoach {
  coach_sports?: { sport: CoachListItem['sports'][number] | null }[];
  [key: string]: unknown;
}

export async function recommendCoaches(
  ctx: RecommendationContext = {},
): Promise<CoachListItem[]> {
  const supabase = await createClient();
  const limit = ctx.limit ?? 6;

  let query = supabase
    .from('coach_profiles')
    .select(
      `*,
       profile:profiles(full_name, avatar_url),
       coach_sports(sport:sports(id, slug, name, icon))`,
    )
    .eq('is_published', true);

  if (ctx.country) query = query.ilike('country', `%${ctx.country}%`);

  // Heuristic: prioritise well-reviewed, highly-rated coaches.
  const { data } = await query
    .order('rating_avg', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(limit * 3);

  let coaches = ((data ?? []) as unknown as RawCoach[]).map((raw) => {
    const { coach_sports, ...coach } = raw;
    const sports = (coach_sports ?? [])
      .map((cs) => cs.sport)
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    return { ...(coach as unknown as CoachListItem), sports };
  });

  if (ctx.sportSlug) {
    coaches = coaches.filter((c) => c.sports.some((s) => s.slug === ctx.sportSlug));
  }

  // score = rating (0-5) weighted by log(reviews + 1) for confidence.
  const score = (c: CoachListItem) =>
    c.rating_avg * Math.log10(c.rating_count + 10);

  return coaches.sort((a, b) => score(b) - score(a)).slice(0, limit);
}
