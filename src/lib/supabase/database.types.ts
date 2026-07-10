/**
 * Typed representation of the Postgres schema.
 *
 * In a real project this is generated with:
 *   pnpm db:types   (supabase gen types typescript --local)
 *
 * It is committed by hand here so the app is fully type-safe before the
 * Supabase CLI has ever run. Keep it in sync with supabase/migrations/*.
 */

export type UserRole = 'athlete' | 'coach' | 'admin';
export type SessionMode = 'online' | 'in_person' | 'both';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PaymentStatus = 'unpaid' | 'processing' | 'paid' | 'refunded' | 'failed';

export interface Database {
  public: {
    Tables: {
      sports: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sports']['Row']> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['sports']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          country: string | null;
          city: string | null;
          locale: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { id: string } & Partial<
          Database['public']['Tables']['profiles']['Row']
        >;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      coach_profiles: {
        Row: {
          id: string;
          profile_id: string;
          headline: string | null;
          bio: string | null;
          cover_image_url: string | null;
          certifications: string[];
          languages: string[];
          years_experience: number;
          price_per_session: number;
          currency: string;
          mode: SessionMode;
          country: string | null;
          region: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          training_locations: string[];
          gallery: string[];
          videos: string[];
          rating_avg: number;
          rating_count: number;
          is_published: boolean;
          onboarding_step: number;
          stripe_account_id: string | null;
          payouts_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { profile_id: string } & Partial<
          Database['public']['Tables']['coach_profiles']['Row']
        >;
        Update: Partial<Database['public']['Tables']['coach_profiles']['Row']>;
        Relationships: [];
      };
      coach_sports: {
        Row: { coach_id: string; sport_id: string };
        Insert: { coach_id: string; sport_id: string };
        Update: Partial<{ coach_id: string; sport_id: string }>;
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          coach_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes: number;
          timezone: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: { coach_id: string; weekday: number; start_time: string; end_time: string } & Partial<
          Database['public']['Tables']['availability_rules']['Row']
        >;
        Update: Partial<Database['public']['Tables']['availability_rules']['Row']>;
        Relationships: [];
      };
      availability_blocks: {
        Row: {
          id: string;
          coach_id: string;
          starts_at: string;
          ends_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: { coach_id: string; starts_at: string; ends_at: string } & Partial<
          Database['public']['Tables']['availability_blocks']['Row']
        >;
        Update: Partial<Database['public']['Tables']['availability_blocks']['Row']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          coach_id: string;
          athlete_id: string;
          sport_id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          mode: SessionMode;
          location: string | null;
          price: number;
          currency: string;
          athlete_note: string | null;
          cancel_reason: string | null;
          payment_status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          commission_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          coach_id: string;
          athlete_id: string;
          sport_id: string;
          starts_at: string;
          ends_at: string;
        } & Partial<Database['public']['Tables']['bookings']['Row']>;
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string | null;
          coach_id: string;
          athlete_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: { coach_id: string; athlete_id: string; rating: number } & Partial<
          Database['public']['Tables']['reviews']['Row']
        >;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
        Relationships: [];
      };
      favorites: {
        Row: { athlete_id: string; coach_id: string; created_at: string };
        Insert: { athlete_id: string; coach_id: string };
        Update: Partial<{ athlete_id: string; coach_id: string }>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          athlete_id: string | null;
          coach_id: string | null;
          amount: number;
          currency: string;
          commission_amount: number;
          status: PaymentStatus;
          provider: string;
          provider_reference: string | null;
          raw_event: unknown | null;
          created_at: string;
        };
        Insert: { amount: number } & Partial<
          Database['public']['Tables']['payments']['Row']
        >;
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_coach_id: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: {
      user_role: UserRole;
      session_mode: SessionMode;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience row aliases used across features.
export type SportRow = Database['public']['Tables']['sports']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type CoachProfileRow = Database['public']['Tables']['coach_profiles']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type AvailabilityRuleRow =
  Database['public']['Tables']['availability_rules']['Row'];
