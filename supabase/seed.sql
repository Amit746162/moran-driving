-- ═══════════════════════════════════════════════════════════════════════════
-- Coachly — Seed data
-- Sports catalogue. New sports are just new rows — no schema change needed.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.sports (slug, name, icon, sort_order) values
  ('football',   'Football (Soccer)', '⚽', 10),
  ('basketball', 'Basketball',        '🏀', 20),
  ('tennis',     'Tennis',            '🎾', 30),
  ('padel',      'Padel',             '🎾', 40),
  ('volleyball', 'Volleyball',        '🏐', 50),
  ('footvolley', 'Footvolley',        '🏖️', 60),
  ('handball',   'Handball',          '🤾', 70),
  ('fitness',    'Fitness / Gym',     '💪', 80),
  ('running',    'Running',           '🏃', 90),
  ('swimming',   'Swimming',          '🏊', 100)
on conflict (slug) do nothing;
