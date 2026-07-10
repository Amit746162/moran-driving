/**
 * PushService (Phase 5 scaffold) — Web Push / FCM abstraction.
 *
 * Subscriptions would be stored per-device in a `push_subscriptions` table.
 * `send` fans out a payload to all of a user's devices. Implement with the
 * `web-push` library (VAPID keys) or Firebase Cloud Messaging when ready.
 */

export interface PushSubscriptionRecord {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushMessage {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export const PushService = {
  isEnabled(): boolean {
    return Boolean(process.env.VAPID_PRIVATE_KEY);
  },

  async subscribe(_record: PushSubscriptionRecord): Promise<void> {
    // TODO(Phase 5): upsert into push_subscriptions.
  },

  async unsubscribe(_userId: string, _endpoint: string): Promise<void> {
    // TODO(Phase 5): delete subscription.
  },

  async send(userId: string, message: PushMessage): Promise<void> {
    if (!this.isEnabled()) return;
    // TODO(Phase 5): look up subscriptions and webpush.sendNotification(...).
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[push] → ${userId}: ${message.title}`);
    }
  },
};
