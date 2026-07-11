/** Shared domain types for the mobile client (subset of the DB schema). */

export interface Sport {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

export interface Coach {
  id: string;
  profile_id: string;
  headline: string | null;
  bio: string | null;
  cover_image_url: string | null;
  price_per_session: number;
  currency: string;
  mode: 'online' | 'in_person' | 'both';
  city: string | null;
  country: string | null;
  years_experience: number;
  languages: string[];
  certifications: string[];
  rating_avg: number;
  rating_count: number;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  sports: Sport[];
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  mode: string;
  price: number;
  currency: string;
  coach: {
    id: string;
    profile: { full_name: string | null; avatar_url: string | null } | null;
  } | null;
  sport: { name: string; icon: string | null } | null;
}
