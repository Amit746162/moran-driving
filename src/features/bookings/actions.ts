'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { type BookingStatus } from '@/lib/supabase/database.types';

import { PaymentService } from '@/features/payments/payment-service';

export interface BookingResult {
  ok: boolean;
  bookingId?: string;
  error?: string;
}

/**
 * Create a booking. The database's gist exclusion constraint is the source of
 * truth for availability — if two athletes race for the same slot, exactly one
 * insert succeeds and the other receives a friendly "slot taken" error.
 */
export async function createBooking(input: {
  coachId: string;
  sportId: string;
  start: string;
  end: string;
  mode: 'online' | 'in_person';
  note?: string;
}): Promise<BookingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Please log in to book a session.' };

  const supabase = await createClient();

  // Pull the coach's live price so the client can't tamper with it.
  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('price_per_session, currency')
    .eq('id', input.coachId)
    .single();

  if (!coach) return { ok: false, error: 'Coach not found.' };

  const commission = PaymentService.calculateCommission(coach.price_per_session);

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      coach_id: input.coachId,
      athlete_id: user.id,
      sport_id: input.sportId,
      starts_at: input.start,
      ends_at: input.end,
      mode: input.mode,
      status: 'pending',
      price: coach.price_per_session,
      currency: coach.currency,
      athlete_note: input.note ?? null,
      commission_amount: commission,
    })
    .select('id')
    .single();

  if (error) {
    // 23P01 = exclusion_violation (slot overlaps an existing active booking).
    if (error.code === '23P01') {
      return {
        ok: false,
        error: 'That slot was just booked by someone else. Please pick another.',
      };
    }
    return { ok: false, error: 'Could not create the booking. Please try again.' };
  }

  revalidatePath(`/coaches/${input.coachId}`);
  revalidatePath('/bookings');
  return { ok: true, bookingId: data.id };
}

/** Allowed status transitions per role, enforced app-side (RLS guards ownership). */
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export async function updateBookingStatus(
  bookingId: string,
  next: BookingStatus,
  reason?: string,
): Promise<BookingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Not authenticated.' };

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single();

  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (!TRANSITIONS[booking.status].includes(next)) {
    return { ok: false, error: `Cannot move a ${booking.status} booking to ${next}.` };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: next, cancel_reason: reason ?? null })
    .eq('id', bookingId);

  if (error) return { ok: false, error: 'Update failed.' };

  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  return { ok: true };
}
