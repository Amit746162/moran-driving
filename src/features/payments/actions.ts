'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';

import { PaymentService } from './payment-service';

/**
 * Checkout placeholder (Phase 5).
 *
 * Creates a checkout session via the PaymentService. Today the ManualProvider
 * returns a null URL (no charge), so callers should treat a null URL as
 * "payment not yet enabled" and proceed with the booking as pending. When
 * Stripe is switched on, this returns a redirect URL with zero call-site changes.
 */
export async function startCheckout(bookingId: string): Promise<{
  ok: boolean;
  url: string | null;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, url: null, error: 'Not authenticated.' };

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, price, currency, coach_id, athlete_id')
    .eq('id', bookingId)
    .single();

  if (!booking) return { ok: false, url: null, error: 'Booking not found.' };

  const session = await PaymentService.createCheckoutSession({
    bookingId: booking.id,
    amount: Number(booking.price),
    currency: booking.currency,
    coachId: booking.coach_id,
    athleteId: booking.athlete_id,
  });

  return { ok: true, url: session.url };
}
