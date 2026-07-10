# Coachly 🏋️

**The global marketplace for booking sports coaches.** _Airbnb + Booking.com + Calendly, for sports coaching._

Athletes discover, compare, and instantly book personal coaches across any sport — online or in person. Coaches manage a rich profile, set Calendly-style availability, and get booked with zero double-booking risk.

---

## Tech stack

| Layer      | Choice                                                           |
| ---------- | --------------------------------------------------------------- |
| Framework  | **Next.js 15** (App Router, React 19, Server Components/Actions) |
| Language   | **TypeScript** (strict)                                          |
| Styling    | **TailwindCSS** + CSS-variable design tokens (light/dark)       |
| Data       | **Supabase** (PostgreSQL, Auth, Storage, RLS)                   |
| Server state | **React Query** (@tanstack/react-query)                      |
| Forms      | **React Hook Form** + **Zod**                                   |
| Animation  | **Framer Motion**                                              |
| Icons      | **Lucide**                                                     |

---

## Folder structure

```
coachly/
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_initial_schema.sql   # tables, indexes, booking engine, triggers
│  │  └─ 0002_rls_policies.sql     # role-based Row Level Security
│  ├─ seed.sql                     # sports catalogue
│  └─ config.toml                  # local Supabase config
│
├─ src/
│  ├─ app/                         # Next.js App Router (routing only)
│  │  ├─ (marketing)/              # public shell: landing, browse  → nav + footer
│  │  ├─ (auth)/                   # login / register (split-screen shell)
│  │  ├─ (app)/                    # authenticated shell: dashboard, bookings…
│  │  ├─ auth/callback/            # OAuth / email confirmation handler
│  │  ├─ layout.tsx                # root: fonts, providers, metadata
│  │  ├─ loading.tsx  not-found.tsx
│  │  └─ globals.css               # design tokens (HSL CSS vars, light+dark)
│  │
│  ├─ features/                    # ★ feature-based architecture
│  │  ├─ auth/                     # actions, schema, forms, get-user, oauth
│  │  └─ marketing/                # hero search, landing widgets
│  │     (Phase 2+: coaches/, bookings/, availability/, reviews/, admin/…)
│  │
│  ├─ components/
│  │  ├─ ui/                       # design system primitives (Button, Card…)
│  │  ├─ layout/                   # Navbar, Footer, mobile nav, user menu, logo
│  │  └─ providers.tsx             # React Query provider
│  │
│  ├─ lib/
│  │  ├─ supabase/                 # client, server, admin, middleware, types
│  │  ├─ constants.ts              # routes, options, enums for UI
│  │  └─ utils.ts                  # cn(), price/date formatting, initials
│  │
│  └─ middleware.ts                # session refresh + protected-route guard
│
├─ .env.example                    # required environment variables
└─ (config: next, tailwind, postcss, tsconfig, eslint, prettier)
```

### Why this structure

- **`features/` over `pages/` logic** — each domain (auth, coaches, bookings) owns its actions, schemas, components, and hooks. Scales to millions of LOC without a tangled `components/` dump.
- **Route groups** `(marketing)` / `(auth)` / `(app)` give each area its own layout shell without affecting the URL.
- **`app/` holds routing only** — real logic lives in `features/`, so pages stay thin and testable.
- **Supabase clients are separated** — `client.ts` (browser, anon key), `server.ts` (RSC/actions, cookie-bound) and `createAdminClient` (service role, server-only). This prevents the service key ever reaching the client bundle.
- **Design tokens as CSS variables** — re-brand or theme without touching a single component.

---

## The booking engine (core)

Double-booking is **impossible by construction**, not by application logic:

```sql
-- bookings table
slot tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,

alter table bookings add constraint bookings_no_overlap
  exclude using gist (coach_id with =, slot with &&)
  where (status in ('pending','confirmed','completed'));
```

A Postgres **exclusion constraint** rejects any overlapping active booking for the same coach at the database level — even under race conditions. Cancelled / no-show slots are automatically freed (excluded from the constraint), so they instantly become bookable again.

---

## Data model highlights

- **Unlimited sports** — `sports` is a data table; adding a sport is an `INSERT`, never a migration.
- **Availability** — recurring weekly `availability_rules` + explicit `availability_blocks` (vacations/closures) → generated bookable slots.
- **Denormalized ratings** — `coach_profiles.rating_avg/count` kept fresh by a trigger for fast sorting/filtering at scale.
- **Payment-ready** — `payments` table + `stripe_*` / `commission_*` columns exist now so Stripe drops in later with **no migration** (Phase 5).
- **Auth → profile** — a trigger auto-creates a `profiles` row on signup, seeding role + name from signup metadata.

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # fill in your Supabase project values

# 3. Database (with the Supabase CLI)
supabase start
supabase db reset            # runs migrations + seed

# 4. Run
npm run dev                  # http://localhost:3000
```

Scripts: `dev` · `build` · `start` · `lint` · `typecheck` · `format` · `db:types`

---

## Roadmap

- **Phase 1 — Foundation** ✅ project setup · auth (email + Google) · database + RLS · navigation · responsive layout
- **Phase 2 — Discovery** ✅ coach & athlete profiles · onboarding wizard · search · advanced filters · favorites
- **Phase 3 — Booking** ✅ booking engine · availability editor · slot generation · session lifecycle · reviews
- **Phase 4 — Ops** ✅ role-aware dashboards · admin panel (users/coaches/bookings/sports/reports) · favorites page
- **Phase 5 — Infrastructure** ✅ scaffolds for Stripe · notifications · web push · chat · AI recommendations

### Phase 5 infrastructure (ready to wire, not yet live)

These are built against stable interfaces so turning them on requires no changes at the call sites:

| Service | Location | Enable by |
| ------- | -------- | --------- |
| `PaymentService` | `features/payments/` | Implementing `StripeProvider`, setting `STRIPE_SECRET_KEY` |
| Stripe webhook | `app/api/webhooks/stripe/route.ts` | Setting `STRIPE_WEBHOOK_SECRET` |
| `NotificationService` | `features/notifications/` | Adding email/push transports |
| `PushService` | `features/notifications/push-service.ts` | Setting `VAPID_PRIVATE_KEY` |
| `ChatService` | `features/chat/` | Adding `conversations`/`messages` tables + Realtime |
| AI recommendations | `features/recommendations/` | Swapping the heuristic for embeddings |

## Key flows

- **Book a session** — `/coaches` → filter → open a coach → pick a real free slot → confirm. The DB exclusion constraint guarantees no double-booking; booked slots vanish on refresh.
- **Coach onboarding** — sign up as coach → 5-step wizard → publish → set availability → receive bookings.
- **Admin** — sign in as an `admin` role user → `/admin` for KPIs, user/coach/booking management and the data-driven sports catalogue.
