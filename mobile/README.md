# Coachly Mobile 📱

Native **iOS + Android** app for the Coachly marketplace, built with **Expo + React Native + Expo Router**. It talks to the **same Supabase backend** as the web app — same coaches, availability, bookings and auth.

Runs in **Expo Go** — no Xcode/Android Studio needed to try it.

## Features

- Email sign up / login (athlete or coach) via Supabase Auth
- Discover coaches with sport filters and city search
- Coach profile with bio, certifications, languages
- **Calendly-style booking** — real free slots, double-booking blocked by the DB
- My bookings with live status (pending / confirmed / completed / …)
- Profile + sign out

## Run it in Expo Go (2 minutes)

1. **Install the Expo Go app** on your phone (App Store / Google Play).

2. **Configure Supabase** — from the `mobile/` folder:
   ```bash
   cp .env.example .env
   ```
   Fill in the **same** Supabase URL + anon key you use for the web app:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Install & start:**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

4. **Scan the QR code** that appears in the terminal with:
   - iPhone → the **Camera** app
   - Android → the **Expo Go** app

The app opens on your phone. Edits reload live. 🎉

> Tip: phone and computer must be on the same Wi‑Fi. Behind a restrictive
> network? run `npx expo start --tunnel`.

## Project structure

```
mobile/
├─ app/                      # Expo Router (file-based navigation)
│  ├─ _layout.tsx            # root: auth provider + auth-gate redirects
│  ├─ (auth)/                # login, register
│  ├─ (tabs)/                # Discover · Bookings · Profile
│  └─ coach/[id].tsx         # coach profile + booking flow
├─ components/               # Button, CoachCard, Avatar, Loading
├─ contexts/AuthContext.tsx  # session + profile + auth actions
└─ lib/                      # supabase client, slot engine, theme, types
```

## Notes

- Uses **Expo SDK 52**. The booking slot engine mirrors the web app's logic.
- No native modules beyond what Expo Go ships — so it runs without a custom
  dev build. For push notifications / payments later, move to an EAS dev build.
