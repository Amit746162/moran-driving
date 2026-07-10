import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import {
  type BookingRow,
  type SessionMode,
} from '@/lib/supabase/database.types';

export interface BookingWithParties extends BookingRow {
  coach: {
    id: string;
    profile: { full_name: string | null; avatar_url: string | null } | null;
  } | null;
  athlete: { full_name: string | null; avatar_url: string | null } | null;
  sport: { name: string; icon: string | null } | null;
}

const BOOKING_SELECT = `
  *,
  coach:coach_profiles(id, profile:profiles(full_name, avatar_url)),
  athlete:profiles!athlete_id(full_name, avatar_url),
  sport:sports(name, icon)
`;

/**
 * Bookings for the current user, split into upcoming & past.
 * Works for both roles — RLS scopes rows to the athlete or the coach.
 */
export async function getMyBookings(): Promise<{
  upcoming: BookingWithParties[];
  past: BookingWithParties[];
  role: 'athlete' | 'coach' | 'admin';
}> {
  const user = await getCurrentUser();
  const role = user?.profile?.role ?? 'athlete';
  if (!user) return { upcoming: [], past: [], role };

  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .order('starts_at', { ascending: true });

  const rows = (data ?? []) as unknown as BookingWithParties[];
  const now = Date.now();
  const isPast = (b: BookingWithParties) =>
    new Date(b.starts_at).getTime() < now ||
    ['completed', 'cancelled', 'no_show'].includes(b.status);

  return {
    upcoming: rows.filter((b) => !isPast(b)),
    past: rows.filter(isPast).reverse(),
    role,
  };
}

export interface SessionSummary {
  currency: string;
  totalRevenue: number;
  completedCount: number;
  upcomingCount: number;
}

/** Lightweight revenue/session summary for the coach dashboard. */
export async function getCoachSummary(coachId: string): Promise<SessionSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select('price, currency, status, starts_at')
    .eq('coach_id', coachId);

  const rows = data ?? [];
  const completed = rows.filter((r) => r.status === 'completed');
  const upcoming = rows.filter(
    (r) =>
      ['pending', 'confirmed'].includes(r.status) &&
      new Date(r.starts_at).getTime() > Date.now(),
  );

  return {
    currency: rows[0]?.currency ?? 'USD',
    totalRevenue: completed.reduce((sum, r) => sum + Number(r.price), 0),
    completedCount: completed.length,
    upcomingCount: upcoming.length,
  };
}

export type { SessionMode };
