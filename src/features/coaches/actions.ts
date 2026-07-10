'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/features/auth/lib/get-user';
import { type Database } from '@/lib/supabase/database.types';
import { ensureCoachProfile } from './lib/get-my-coach';

export interface CoachActionResult {
  ok: boolean;
  error?: string;
}

type CoachUpdate = Database['public']['Tables']['coach_profiles']['Update'];

/** Partial update of the current coach's profile (used by every wizard step). */
export async function updateCoachProfile(
  patch: CoachUpdate,
): Promise<CoachActionResult> {
  const coachId = await ensureCoachProfile();
  if (!coachId) return { ok: false, error: 'Not a coach.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('coach_profiles')
    .update(patch)
    .eq('id', coachId);

  if (error) return { ok: false, error: 'Could not save changes.' };
  revalidatePath('/coach/onboarding');
  revalidatePath('/dashboard');
  return { ok: true };
}

/** Replace the coach's selected sports (many-to-many). */
export async function setCoachSports(sportIds: string[]): Promise<CoachActionResult> {
  const coachId = await ensureCoachProfile();
  if (!coachId) return { ok: false, error: 'Not a coach.' };

  const supabase = await createClient();
  await supabase.from('coach_sports').delete().eq('coach_id', coachId);
  if (sportIds.length > 0) {
    const { error } = await supabase
      .from('coach_sports')
      .insert(sportIds.map((sport_id) => ({ coach_id: coachId, sport_id })));
    if (error) return { ok: false, error: 'Could not save sports.' };
  }
  revalidatePath('/coach/onboarding');
  return { ok: true };
}

/** Publish (or unpublish) the coach's listing. */
export async function setPublished(published: boolean): Promise<CoachActionResult> {
  const user = await requireRole('coach');
  if (!user) return { ok: false, error: 'Not a coach.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('coach_profiles')
    .update({ is_published: published, onboarding_step: 99 })
    .eq('profile_id', user.id);

  if (error) return { ok: false, error: 'Could not update publish state.' };
  revalidatePath('/dashboard');
  return { ok: true };
}
