import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/server';
import { PaymentService } from '@/features/payments/payment-service';

/**
 * Stripe webhook endpoint (Phase 5 placeholder).
 *
 * The route + verification + persistence flow is wired end-to-end so enabling
 * Stripe is purely a matter of implementing StripeProvider.verifyWebhook and
 * setting STRIPE_WEBHOOK_SECRET. Until then it accepts and no-ops safely.
 */
export async function POST(request: Request) {
  if (!PaymentService.isLive()) {
    // Payments are not enabled yet — acknowledge so no retries pile up.
    return NextResponse.json({ received: true, live: false });
  }

  const signature = request.headers.get('stripe-signature') ?? '';
  const payload = await request.text();

  let event;
  try {
    event = await PaymentService.verifyWebhook(payload, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'payment.succeeded':
      if (event.bookingId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid', stripe_payment_intent_id: event.reference })
          .eq('id', event.bookingId);
      }
      break;
    case 'payment.failed':
      if (event.bookingId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', event.bookingId);
      }
      break;
    case 'refund.succeeded':
      if (event.bookingId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded' })
          .eq('id', event.bookingId);
      }
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
