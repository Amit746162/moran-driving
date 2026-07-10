import {
  type CoachProfileRow,
  type SportRow,
} from '@/lib/supabase/database.types';

/** Minimal identity fields joined from `profiles`. */
export interface CoachIdentity {
  full_name: string | null;
  avatar_url: string | null;
}

/** A coach as returned by the search/list query (card view). */
export interface CoachListItem extends CoachProfileRow {
  profile: CoachIdentity | null;
  sports: Pick<SportRow, 'id' | 'slug' | 'name' | 'icon'>[];
}

/** Full coach profile incl. reviews for the detail page. */
export interface CoachDetail extends CoachListItem {
  reviews: CoachReview[];
}

export interface CoachReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  athlete: CoachIdentity | null;
}

/** Parsed, validated search parameters used by the query + filter UI. */
export interface CoachSearchParams {
  sport?: string; // sport slug
  country?: string;
  city?: string;
  region?: string;
  language?: string;
  mode?: 'online' | 'in_person' | 'both';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: 'today' | 'tomorrow';
  sort?: string;
  page?: number;
}
