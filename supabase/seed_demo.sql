-- ═══════════════════════════════════════════════════════════════════════════
-- Coachly — OPTIONAL demo data
-- Run manually against a LOCAL/dev database to populate the marketplace:
--   psql "$DATABASE_URL" -f supabase/seed_demo.sql
-- Creates 6 published coaches (with logins), availability and reviews.
-- Login for every demo coach:  <email>  /  password: coachly123
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert demo auth users. The handle_new_user() trigger auto-creates their
-- profile rows using the role + full_name from raw_user_meta_data.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'marco@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Marco Bianchi"}', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'sofia@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Sofia Alves"}', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'liam@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Liam O''Connor"}', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'yuki@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Yuki Tanaka"}', now(), now()),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'amara@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Amara Nwosu"}', now(), now()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'diego@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"coach","full_name":"Diego Fernández"}', now(), now())
on conflict (id) do nothing;

-- Ensure roles are set (in case profiles pre-existed).
update public.profiles set role = 'coach'
where id in (
  '11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555','66666666-6666-6666-6666-666666666666'
);

-- Coach listings.
insert into public.coach_profiles
  (id, profile_id, headline, bio, cover_image_url, certifications, languages,
   years_experience, price_per_session, currency, mode, country, region, city,
   gallery, rating_avg, rating_count, is_published, onboarding_step)
values
  ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   'UEFA-A Football Coach','Former academy coach helping players sharpen technique, tactics and game intelligence.',
   'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200',
   '{"UEFA-A","First Aid"}','{"English","Italian","Spanish"}',12,60,'EUR','both',
   'Italy','Lombardy','Milan',
   '{"https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200","https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200"}',
   0,0,true,99),
  ('aaaaaaa1-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',
   'Pro Padel & Tennis Coach','WPT-experienced coach. I build well-rounded players with a love for the game.',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
   '{"RPT Certified"}','{"Portuguese","English","Spanish"}',8,45,'EUR','in_person',
   'Portugal','Lisbon','Lisbon',
   '{"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200"}',
   0,0,true,99),
  ('aaaaaaa1-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333',
   'Strength & Conditioning Coach','CSCS coach specialising in athletic performance and injury prevention.',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
   '{"CSCS","NASM-CPT"}','{"English"}',10,55,'USD','both',
   'Ireland','Leinster','Dublin',
   '{"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200"}',
   0,0,true,99),
  ('aaaaaaa1-0000-0000-0000-000000000004','44444444-4444-4444-4444-444444444444',
   'Competitive Swimming Coach','Ex-national swimmer coaching stroke technique and race strategy for all levels.',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
   '{"ASCA Level 3"}','{"English","Japanese"}',15,70,'USD','in_person',
   'Japan','Tokyo','Tokyo',
   '{"https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200"}',
   0,0,true,99),
  ('aaaaaaa1-0000-0000-0000-000000000005','55555555-5555-5555-5555-555555555555',
   'Basketball Skills Trainer','Player-development specialist. Ball-handling, shooting mechanics and IQ.',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
   '{"FIBA Level 2"}','{"English","French"}',7,50,'USD','both',
   'United Kingdom','England','London',
   '{"https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1200"}',
   0,0,true,99),
  ('aaaaaaa1-0000-0000-0000-000000000006','66666666-6666-6666-6666-666666666666',
   'Running & Marathon Coach','Boston-qualified coach building personalised plans from 5K to marathon.',
   'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200',
   '{"UESCA Endurance"}','{"Spanish","English"}',9,40,'EUR','online',
   'Spain','Catalonia','Barcelona',
   '{"https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200"}',
   0,0,true,99)
on conflict (id) do nothing;

-- Sports (link each coach to their sport(s) by slug).
insert into public.coach_sports (coach_id, sport_id)
select c.id, s.id from (values
  ('aaaaaaa1-0000-0000-0000-000000000001','football'),
  ('aaaaaaa1-0000-0000-0000-000000000001','fitness'),
  ('aaaaaaa1-0000-0000-0000-000000000002','padel'),
  ('aaaaaaa1-0000-0000-0000-000000000002','tennis'),
  ('aaaaaaa1-0000-0000-0000-000000000003','fitness'),
  ('aaaaaaa1-0000-0000-0000-000000000004','swimming'),
  ('aaaaaaa1-0000-0000-0000-000000000005','basketball'),
  ('aaaaaaa1-0000-0000-0000-000000000006','running')
) as m(coach_id, slug)
join public.coach_profiles c on c.id = m.coach_id::uuid
join public.sports s on s.slug = m.slug
on conflict do nothing;

-- Weekly availability: Mon–Fri, 09:00–17:00, 60-min slots for every coach.
insert into public.availability_rules (coach_id, weekday, start_time, end_time, slot_minutes)
select c.id, d.weekday, '09:00', '17:00', 60
from public.coach_profiles c
cross join (values (1),(2),(3),(4),(5)) as d(weekday)
where c.id in (
  'aaaaaaa1-0000-0000-0000-000000000001','aaaaaaa1-0000-0000-0000-000000000002',
  'aaaaaaa1-0000-0000-0000-000000000003','aaaaaaa1-0000-0000-0000-000000000004',
  'aaaaaaa1-0000-0000-0000-000000000005','aaaaaaa1-0000-0000-0000-000000000006')
on conflict do nothing;

-- A demo athlete + a couple of reviews (rating aggregates update via trigger).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'athlete@coachly.dev', crypt('coachly123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"role":"athlete","full_name":"Alex Rivera"}', now(), now())
on conflict (id) do nothing;

insert into public.reviews (coach_id, athlete_id, rating, comment) values
  ('aaaaaaa1-0000-0000-0000-000000000001','99999999-9999-9999-9999-999999999999',5,'Transformed my first touch in weeks. Incredible coach.'),
  ('aaaaaaa1-0000-0000-0000-000000000003','99999999-9999-9999-9999-999999999999',5,'Structured, professional and genuinely cares about progress.')
on conflict (coach_id, athlete_id) do nothing;
