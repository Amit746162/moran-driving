import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { type CoachProfileRow } from '@/lib/supabase/database.types';

/**
 * Load the coach_profile owned by the current user (or null).
 * Used by coach-only pages: onboarding, availability, dashboard.
 */
export async function getMyCoachProfile(): Promise<CoachProfileRow | null> {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== 'coach') return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  return data;
}

/** Ensure a coach_profile row exists for the current coach, returning its id. */
export async function ensureCoachProfile(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== 'coach') return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('coach_profiles')
    .insert({ profile_id: user.id })
    .select('id')
    .single();

  return created?.id ?? null;
}
