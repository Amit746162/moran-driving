'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

/**
 * Submit (or update) a review for a coach. One review per athlete per coach —
 * the DB unique constraint dedupes, so we upsert.
 */
export async function submitReview(input: {
  coachId: string;
  bookingId?: string;
  rating: number;
  comment?: string;
}): Promise<ReviewResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Not authenticated.' };
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: 'Rating must be between 1 and 5.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('reviews').upsert(
    {
      coach_id: input.coachId,
      athlete_id: user.id,
      booking_id: input.bookingId ?? null,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    { onConflict: 'coach_id,athlete_id' },
  );

  if (error) return { ok: false, error: 'Could not submit your review.' };

  revalidatePath(`/coaches/${input.coachId}`);
  revalidatePath('/bookings');
  return { ok: true };
}
