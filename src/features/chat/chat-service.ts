/**
 * ChatService (Phase 5 scaffold) — 1:1 messaging between athlete & coach.
 *
 * Intended implementation: a `conversations` + `messages` schema with Supabase
 * Realtime for live delivery. A conversation is keyed by (coach, athlete) and
 * optionally linked to a booking. This interface lets the UI be built against a
 * stable contract before the backend lands.
 */

export interface Conversation {
  id: string;
  coachId: string;
  athleteId: string;
  bookingId?: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export const ChatService = {
  async getOrCreateConversation(
    _coachId: string,
    _athleteId: string,
  ): Promise<Conversation | null> {
    // TODO(Phase 5): upsert a conversation row and return it.
    return null;
  },

  async listMessages(_conversationId: string): Promise<Message[]> {
    // TODO(Phase 5): select messages ordered by created_at.
    return [];
  },

  async sendMessage(_conversationId: string, _body: string): Promise<Message | null> {
    // TODO(Phase 5): insert message, bump conversation.last_message_at,
    // and trigger NotificationService + Realtime broadcast.
    return null;
  },

  /** Subscribe to live messages (Supabase Realtime channel) — client-side. */
  subscribe(_conversationId: string, _onMessage: (m: Message) => void): () => void {
    // TODO(Phase 5): return an unsubscribe function.
    return () => {};
  },
};
