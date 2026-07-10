-- ═══════════════════════════════════════════════════════════════════════════
-- Coachly — Row Level Security (role-based access control)
-- ═══════════════════════════════════════════════════════════════════════════
-- Principles:
--   • Public marketplace data (sports, published coaches, reviews) is readable
--     by anyone — the browse experience must work logged-out.
--   • Users can only mutate their own rows.
--   • Coaches own their listing/availability; athletes own their bookings.
--   • Admin bypass is handled with the service-role key on the server, so we
--     don't need permissive admin policies that could leak via the anon key.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.sports              enable row level security;
alter table public.profiles            enable row level security;
alter table public.coach_profiles      enable row level security;
alter table public.coach_sports        enable row level security;
alter table public.availability_rules  enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.bookings            enable row level security;
alter table public.reviews             enable row level security;
alter table public.favorites           enable row level security;
alter table public.payments            enable row level security;

-- Helper: current user's coach_profile id (or null).
create or replace function public.current_coach_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.coach_profiles where profile_id = auth.uid();
$$;

-- ── sports ────────────────────────────────────────────────────
create policy "sports readable by all" on public.sports
  for select using (true);

-- ── profiles ──────────────────────────────────────────────────
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- Public can read the basic identity of a coach (name/avatar) via join,
-- so expose a minimal read for profiles that own a published coach listing.
create policy "profiles: read public coaches" on public.profiles
  for select using (
    exists (
      select 1 from public.coach_profiles c
      where c.profile_id = profiles.id and c.is_published = true
    )
  );

-- ── coach_profiles ────────────────────────────────────────────
create policy "coaches: read published" on public.coach_profiles
  for select using (is_published = true or profile_id = auth.uid());
create policy "coaches: insert own" on public.coach_profiles
  for insert with check (profile_id = auth.uid());
create policy "coaches: update own" on public.coach_profiles
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ── coach_sports ──────────────────────────────────────────────
create policy "coach_sports: read all" on public.coach_sports
  for select using (true);
create policy "coach_sports: manage own" on public.coach_sports
  for all using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

-- ── availability (rules + blocks) ─────────────────────────────
create policy "availability_rules: read all" on public.availability_rules
  for select using (true);
create policy "availability_rules: manage own" on public.availability_rules
  for all using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

create policy "availability_blocks: read all" on public.availability_blocks
  for select using (true);
create policy "availability_blocks: manage own" on public.availability_blocks
  for all using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

-- ── bookings ──────────────────────────────────────────────────
create policy "bookings: read own" on public.bookings
  for select using (
    athlete_id = auth.uid() or coach_id = public.current_coach_id()
  );
create policy "bookings: athlete creates" on public.bookings
  for insert with check (athlete_id = auth.uid());
-- Athletes may cancel; coaches may confirm/complete/mark no-show. Both are
-- covered by "owns the booking"; app-layer guards refine allowed transitions.
create policy "bookings: update participants" on public.bookings
  for update using (
    athlete_id = auth.uid() or coach_id = public.current_coach_id()
  );

-- ── reviews ───────────────────────────────────────────────────
create policy "reviews: read all" on public.reviews
  for select using (true);
create policy "reviews: athlete writes own" on public.reviews
  for insert with check (athlete_id = auth.uid());
create policy "reviews: athlete edits own" on public.reviews
  for update using (athlete_id = auth.uid()) with check (athlete_id = auth.uid());
create policy "reviews: athlete deletes own" on public.reviews
  for delete using (athlete_id = auth.uid());

-- ── favorites ─────────────────────────────────────────────────
create policy "favorites: manage own" on public.favorites
  for all using (athlete_id = auth.uid()) with check (athlete_id = auth.uid());

-- ── payments (read-only to participants; writes via service role) ─────────
create policy "payments: read own" on public.payments
  for select using (
    athlete_id = auth.uid() or coach_id = public.current_coach_id()
  );
