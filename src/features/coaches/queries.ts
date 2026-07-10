import { createClient } from '@/lib/supabase/server';

import {
  type CoachDetail,
  type CoachListItem,
  type CoachReview,
  type CoachSearchParams,
} from './types';

const PAGE_SIZE = 12;

/** Shape of the embedded select we run against Supabase. */
const COACH_SELECT = `
  *,
  profile:profiles!inner(full_name, avatar_url),
  coach_sports!inner(sport:sports!inner(id, slug, name, icon))
`;

interface RawCoach {
  coach_sports?: { sport: CoachListItem['sports'][number] | null }[];
  [key: string]: unknown;
}

/** Flatten the nested coach_sports → sports join into a clean array. */
function normalizeCoach(raw: RawCoach): CoachListItem {
  const { coach_sports, ...coach } = raw;
  const sports = (coach_sports ?? [])
    .map((cs) => cs.sport)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  return { ...(coach as unknown as CoachListItem), sports };
}

/**
 * Search & filter published coaches.
 * All filters are optional; sorting supports the marketplace's 5 modes.
 */
export async function searchCoaches(params: CoachSearchParams): Promise<{
  coaches: CoachListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('coach_profiles')
    .select(COACH_SELECT, { count: 'exact' })
    .eq('is_published', true);

  // ── Filters ──────────────────────────────────────────────
  if (params.sport) {
    query = query.eq('coach_sports.sport.slug', params.sport);
  }
  if (params.country) query = query.ilike('country', `%${params.country}%`);
  if (params.city) query = query.ilike('city', `%${params.city}%`);
  if (params.region) query = query.ilike('region', `%${params.region}%`);
  if (params.mode && params.mode !== 'both') {
    // A "both" coach satisfies either online or in-person searches.
    query = query.in('mode', [params.mode, 'both']);
  }
  if (params.language) query = query.contains('languages', [params.language]);
  if (typeof params.minPrice === 'number')
    query = query.gte('price_per_session', params.minPrice);
  if (typeof params.maxPrice === 'number')
    query = query.lte('price_per_session', params.maxPrice);
  if (typeof params.minRating === 'number')
    query = query.gte('rating_avg', params.minRating);

  // ── Sorting ──────────────────────────────────────────────
  switch (params.sort) {
    case 'price_asc':
      query = query.order('price_per_session', { ascending: true });
      break;
    case 'reviews':
      query = query.order('rating_count', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'rating':
    default:
      query = query.order('rating_avg', { ascending: false });
      break;
  }

  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  const coaches = ((data ?? []) as unknown as RawCoach[]).map(normalizeCoach);
  return { coaches, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

/** Fetch a single coach with sports + reviews for the detail page. */
export async function getCoachById(id: string): Promise<CoachDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coach_profiles')
    .select(COACH_SELECT)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  const base = normalizeCoach(data as unknown as RawCoach);

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, athlete:profiles!athlete_id(full_name, avatar_url)')
    .eq('coach_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const reviews = (reviewRows ?? []) as unknown as CoachReview[];
  return { ...base, reviews };
}

/** Distinct list of countries/cities that currently have coaches (for filters). */
export async function getCoachLocations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_profiles')
    .select('country, city')
    .eq('is_published', true)
    .limit(500);

  const countries = new Set<string>();
  const cities = new Set<string>();
  (data ?? []).forEach((row) => {
    if (row.country) countries.add(row.country);
    if (row.city) cities.add(row.city);
  });
  return {
    countries: [...countries].sort(),
    cities: [...cities].sort(),
  };
}
