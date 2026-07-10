/**
 * PaymentService — provider-agnostic payment abstraction.
 *
 * Payments are intentionally NOT live yet. This service defines the full
 * surface the app will call, with a no-op "manual" provider today. When Stripe
 * is enabled (Phase 5), implement `StripeProvider` against this same interface
 * and swap the `provider` — no call sites change.
 */

const COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 15);

export interface CheckoutSession {
  id: string;
  url: string | null;
  provider: 'stripe' | 'manual';
}

export interface PaymentProvider {
  createCheckoutSession(args: {
    bookingId: string;
    amount: number;
    currency: string;
    coachId: string;
    athleteId: string;
  }): Promise<CheckoutSession>;

  refund(paymentReference: string): Promise<{ ok: boolean }>;

  /** Verify + parse a provider webhook. Returns a normalized event. */
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

export interface WebhookEvent {
  type: 'payment.succeeded' | 'payment.failed' | 'refund.succeeded' | 'unknown';
  bookingId?: string;
  reference?: string;
  raw: unknown;
}

/**
 * Placeholder provider used until Stripe keys are configured. It short-circuits
 * checkout so bookings work end-to-end without collecting money.
 */
class ManualProvider implements PaymentProvider {
  async createCheckoutSession(): Promise<CheckoutSession> {
    return { id: `manual_${crypto.randomUUID()}`, url: null, provider: 'manual' };
  }
  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
  async verifyWebhook(payload: string): Promise<WebhookEvent> {
    return { type: 'unknown', raw: payload };
  }
}

/*
 * ── Stripe wiring (Phase 5) ──────────────────────────────────────────────
 * When ready, install `stripe`, implement the class below, and select it in
 * `resolveProvider()` once STRIPE_SECRET_KEY is present.
 *
 * class StripeProvider implements PaymentProvider {
 *   private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *   async createCheckoutSession({ bookingId, amount, currency }) {
 *     const session = await this.stripe.checkout.sessions.create({ ... });
 *     return { id: session.id, url: session.url, provider: 'stripe' };
 *   }
 *   // refund(), verifyWebhook() ...
 * }
 */

function resolveProvider(): PaymentProvider {
  // if (process.env.STRIPE_SECRET_KEY) return new StripeProvider();
  return new ManualProvider();
}

export const PaymentService = {
  provider: resolveProvider(),

  /** Platform commission for a given session price. */
  calculateCommission(amount: number): number {
    return Math.round(amount * (COMMISSION_PERCENT / 100) * 100) / 100;
  },

  /** Net payout to the coach after commission. */
  coachPayout(amount: number): number {
    return Math.round((amount - this.calculateCommission(amount)) * 100) / 100;
  },

  createCheckoutSession: (args: Parameters<PaymentProvider['createCheckoutSession']>[0]) =>
    resolveProvider().createCheckoutSession(args),

  refund: (reference: string) => resolveProvider().refund(reference),

  verifyWebhook: (payload: string, signature: string) =>
    resolveProvider().verifyWebhook(payload, signature),

  isLive(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },
};
