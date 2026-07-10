/**
 * NotificationService (Phase 5 scaffold).
 *
 * Central place to emit user-facing notifications across channels (email, push,
 * in-app). Today it logs; swap each channel for a real transport (Resend/
 * Postmark for email, the PushService for web push) without touching callers.
 *
 * Call sites to wire when ready:
 *   • booking created        → notify coach
 *   • booking confirmed      → notify athlete
 *   • booking cancelled      → notify the other party
 *   • 24h reminder (cron)    → notify both
 *   • new review             → notify coach
 */

export type NotificationChannel = 'email' | 'push' | 'in_app';

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'review_received';

export interface NotificationPayload {
  to: string; // user id
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export const NotificationService = {
  async send(payload: NotificationPayload): Promise<void> {
    const channels = payload.channels ?? ['in_app', 'email'];
    for (const channel of channels) {
      await this.dispatch(channel, payload);
    }
  },

  async dispatch(channel: NotificationChannel, payload: NotificationPayload) {
    // TODO(Phase 5): implement real transports.
    //   email  → await EmailProvider.send(...)
    //   push   → await PushService.send(...)
    //   in_app → insert into a `notifications` table + Supabase Realtime
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[notify:${channel}] → ${payload.to}: ${payload.title}`);
    }
  },
};
