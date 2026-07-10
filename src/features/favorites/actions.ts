'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

/** Toggle a coach in the current athlete's favorites. Returns new state. */
export async function toggleFavorite(coachId: string): Promise<{ favorited: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('favorites')
    .select('coach_id')
    .eq('athlete_id', user.id)
    .eq('coach_id', coachId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('favorites')
      .delete()
      .eq('athlete_id', user.id)
      .eq('coach_id', coachId);
    revalidatePath('/favorites');
    return { favorited: false };
  }

  await supabase.from('favorites').insert({ athlete_id: user.id, coach_id: coachId });
  revalidatePath('/favorites');
  return { favorited: true };
}
