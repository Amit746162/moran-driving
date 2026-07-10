import 'server-only';

import { createAdminClient } from '@/lib/supabase/server';
import { requireRole } from '@/features/auth/lib/get-user';

/** Throws/redirect-guard helper — every admin query starts here. */
export async function assertAdmin() {
  const user = await requireRole('admin');
  return Boolean(user);
}

export interface AdminStats {
  users: number;
  coaches: number;
  publishedCoaches: number;
  bookings: number;
  completedBookings: number;
  grossRevenue: number;
  commission: number;
}

/** Platform-wide KPIs for the admin overview/reports page. */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();

  const [users, coaches, published, bookings, completed] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('coach_profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('coach_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('price, commission_amount')
      .eq('status', 'completed'),
  ]);

  const completedRows = completed.data ?? [];
  const grossRevenue = completedRows.reduce((s, r) => s + Number(r.price), 0);
  const commission = completedRows.reduce(
    (s, r) => s + Number(r.commission_amount ?? 0),
    0,
  );

  return {
    users: users.count ?? 0,
    coaches: coaches.count ?? 0,
    publishedCoaches: published.count ?? 0,
    bookings: bookings.count ?? 0,
    completedBookings: completedRows.length,
    grossRevenue,
    commission,
  };
}

export async function listUsers(limit = 100) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, country, city, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listCoaches(limit = 100) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('coach_profiles')
    .select(
      'id, headline, is_published, price_per_session, currency, rating_avg, rating_count, city, country, profile:profiles(full_name)',
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as AdminCoach[];
}

export interface AdminCoach {
  id: string;
  headline: string | null;
  is_published: boolean;
  price_per_session: number;
  currency: string;
  rating_avg: number;
  rating_count: number;
  city: string | null;
  country: string | null;
  profile: { full_name: string | null } | null;
}

export async function listBookings(limit = 100) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('bookings')
    .select(
      'id, starts_at, status, price, currency, mode, coach:coach_profiles(profile:profiles(full_name)), athlete:profiles!athlete_id(full_name), sport:sports(name, icon)',
    )
    .order('starts_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as AdminBooking[];
}

export interface AdminBooking {
  id: string;
  starts_at: string;
  status: string;
  price: number;
  currency: string;
  mode: string;
  coach: { profile: { full_name: string | null } | null } | null;
  athlete: { full_name: string | null } | null;
  sport: { name: string; icon: string | null } | null;
}

export async function listSports() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('sports')
    .select('*')
    .order('sort_order');
  return data ?? [];
}
