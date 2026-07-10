-- ═══════════════════════════════════════════════════════════════════════════
-- Coachly — Initial schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Design goals:
--   • Unlimited sports without schema changes (sports is a data table).
--   • Clean separation of auth (auth.users) from domain profiles.
--   • Booking engine that makes double-booking physically impossible.
--   • Payment-ready columns/tables so Stripe drops in without migrations.
--   • Everything indexed for marketplace-scale search & sorting.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist"; -- required for exclusion constraints

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type user_role as enum ('athlete', 'coach', 'admin');
create type session_mode as enum ('online', 'in_person', 'both');
create type booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);
create type payment_status as enum ('unpaid', 'processing', 'paid', 'refunded', 'failed');

-- ─────────────────────────────────────────────────────────────
-- Reference data: sports (add rows, never migrate)
-- ─────────────────────────────────────────────────────────────
create table public.sports (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,          -- 'football', 'padel', ...
  name        text not null,
  icon        text,                          -- lucide icon name or emoji
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index sports_active_idx on public.sports (is_active, sort_order);

-- ─────────────────────────────────────────────────────────────
-- Profiles: 1:1 with auth.users, holds shared identity + role
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          user_role not null default 'athlete',
  full_name     text,
  avatar_url    text,
  phone         text,
  country       text,
  city          text,
  locale        text default 'en',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

-- ─────────────────────────────────────────────────────────────
-- Coach profiles: rich, searchable marketplace listing
-- ─────────────────────────────────────────────────────────────
create table public.coach_profiles (
  id                 uuid primary key default uuid_generate_v4(),
  profile_id         uuid not null unique references public.profiles (id) on delete cascade,
  headline           text,                       -- "UEFA-A Football Coach"
  bio                text,
  cover_image_url    text,
  certifications     text[] not null default '{}',
  languages          text[] not null default '{}',
  years_experience   int not null default 0,
  price_per_session  numeric(10, 2) not null default 0,
  currency           char(3) not null default 'USD',
  mode               session_mode not null default 'both',
  country            text,
  region             text,
  city               text,
  -- Geospatial-ready: store lat/lng for "nearest" sort (PostGIS optional later).
  latitude           double precision,
  longitude          double precision,
  training_locations text[] not null default '{}',
  gallery            text[] not null default '{}',
  videos             text[] not null default '{}',
  -- Denormalized aggregates kept fresh by triggers for fast sorting/filtering.
  rating_avg         numeric(3, 2) not null default 0,
  rating_count       int not null default 0,
  is_published       boolean not null default false,
  onboarding_step    int not null default 0,       -- wizard progress
  -- Payments-ready (Phase 5): populated when Stripe Connect is enabled.
  stripe_account_id  text,
  payouts_enabled    boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index coach_country_idx  on public.coach_profiles (country);
create index coach_city_idx     on public.coach_profiles (city);
create index coach_price_idx    on public.coach_profiles (price_per_session);
create index coach_rating_idx   on public.coach_profiles (rating_avg desc);
create index coach_published_idx on public.coach_profiles (is_published);
create index coach_mode_idx     on public.coach_profiles (mode);

-- Many-to-many: a coach teaches many sports; a sport has many coaches.
create table public.coach_sports (
  coach_id  uuid not null references public.coach_profiles (id) on delete cascade,
  sport_id  uuid not null references public.sports (id) on delete cascade,
  primary key (coach_id, sport_id)
);
create index coach_sports_sport_idx on public.coach_sports (sport_id);

-- ─────────────────────────────────────────────────────────────
-- Availability engine
-- ─────────────────────────────────────────────────────────────

-- Recurring weekly rules (e.g. every Monday 09:00–12:00).
create table public.availability_rules (
  id            uuid primary key default uuid_generate_v4(),
  coach_id      uuid not null references public.coach_profiles (id) on delete cascade,
  weekday       smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time    time not null,
  end_time      time not null,
  slot_minutes  int not null default 60,
  timezone      text not null default 'UTC',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  check (end_time > start_time)
);
create index avail_rules_coach_idx on public.availability_rules (coach_id, weekday);

-- Explicit blocks: vacations, single blocked days, ad-hoc closures.
create table public.availability_blocks (
  id          uuid primary key default uuid_generate_v4(),
  coach_id    uuid not null references public.coach_profiles (id) on delete cascade,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  reason      text,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index avail_blocks_coach_idx on public.availability_blocks (coach_id, starts_at);

-- ─────────────────────────────────────────────────────────────
-- Bookings — the core. Double booking is impossible by construction.
-- ─────────────────────────────────────────────────────────────
create table public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  coach_id        uuid not null references public.coach_profiles (id) on delete cascade,
  athlete_id      uuid not null references public.profiles (id) on delete cascade,
  sport_id        uuid not null references public.sports (id),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  -- Time range used by the exclusion constraint below.
  slot            tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  status          booking_status not null default 'pending',
  mode            session_mode not null default 'in_person',
  location        text,
  price           numeric(10, 2) not null default 0,
  currency        char(3) not null default 'USD',
  athlete_note    text,
  cancel_reason   text,
  -- Payments-ready (Phase 5).
  payment_status  payment_status not null default 'unpaid',
  stripe_payment_intent_id text,
  commission_amount numeric(10, 2),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ★ The heart of the booking engine ★
-- Prevent two ACTIVE bookings for the same coach from overlapping in time.
-- Cancelled / no_show slots are freed automatically (excluded from the constraint).
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    coach_id with =,
    slot with &&
  )
  where (status in ('pending', 'confirmed', 'completed'));

create index bookings_coach_time_idx  on public.bookings (coach_id, starts_at);
create index bookings_athlete_idx     on public.bookings (athlete_id, starts_at desc);
create index bookings_status_idx      on public.bookings (status);

-- ─────────────────────────────────────────────────────────────
-- Reviews & favorites
-- ─────────────────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid unique references public.bookings (id) on delete set null,
  coach_id    uuid not null references public.coach_profiles (id) on delete cascade,
  athlete_id  uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (coach_id, athlete_id)  -- one review per athlete per coach
);
create index reviews_coach_idx on public.reviews (coach_id, created_at desc);

create table public.favorites (
  athlete_id  uuid not null references public.profiles (id) on delete cascade,
  coach_id    uuid not null references public.coach_profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (athlete_id, coach_id)
);
create index favorites_coach_idx on public.favorites (coach_id);

-- ─────────────────────────────────────────────────────────────
-- Payments scaffold (Phase 5) — table exists so webhooks have a home.
-- ─────────────────────────────────────────────────────────────
create table public.payments (
  id                   uuid primary key default uuid_generate_v4(),
  booking_id           uuid references public.bookings (id) on delete set null,
  athlete_id           uuid references public.profiles (id) on delete set null,
  coach_id             uuid references public.coach_profiles (id) on delete set null,
  amount               numeric(10, 2) not null,
  currency             char(3) not null default 'USD',
  commission_amount    numeric(10, 2) not null default 0,
  status               payment_status not null default 'unpaid',
  provider             text not null default 'stripe',
  provider_reference   text,      -- payment_intent / charge id
  raw_event            jsonb,     -- last webhook payload for auditing
  created_at           timestamptz not null default now()
);
create index payments_booking_idx on public.payments (booking_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Triggers & functions
-- ═══════════════════════════════════════════════════════════════════════════

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger coach_updated_at before update on public.coach_profiles
  for each row execute function public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
-- Role + full_name come from the signup metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'athlete'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute a coach's rating aggregates whenever reviews change.
create or replace function public.recalc_coach_rating()
returns trigger language plpgsql as $$
declare
  target_coach uuid := coalesce(new.coach_id, old.coach_id);
begin
  update public.coach_profiles c
  set rating_avg = coalesce((select round(avg(rating), 2) from public.reviews r where r.coach_id = target_coach), 0),
      rating_count = (select count(*) from public.reviews r where r.coach_id = target_coach)
  where c.id = target_coach;
  return null;
end;
$$;

create trigger reviews_recalc_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_coach_rating();
