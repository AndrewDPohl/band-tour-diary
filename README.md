# Tour Diary

A shared logbook for a band's shows: attendance, merch sales, gas/food spend, door
money, promoter/venue contact info, a diary entry for the night, and photos.

Built with React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, and
Supabase (Postgres + Auth + Storage).

## Setup

1. **Set up Supabase** — follow [supabase/README.md](./supabase/README.md) to create a
   project, run the schema migration, and get your API keys. This is required before
   the app will run.
2. **Configure env vars**:
   ```bash
   cp .env.example .env.local
   # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
3. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```
4. Open the printed local URL. Sign up, create (or join) a band, and start logging shows.

## How it's organized

- A **band** is a shared account — invite bandmates with the invite code shown in
  Settings, and everyone sees the same tours and shows.
- A **tour** groups shows together (name + date range).
- A **show** holds all the per-night data: venue + address, day-of contact, promoter,
  payment type (flat guarantee or door deal), attendance, merch sales, gas/food spend,
  door total, diary notes, and photos. Net cash (door + merch − gas − food) is
  calculated automatically.

## Project structure

- `src/routes/` — page components (one per route)
- `src/components/` — shared UI (layout/nav, cards, money summary, photo gallery)
- `src/hooks/` — data-fetching/mutation hooks (React Query + Supabase)
- `src/context/AuthContext.tsx` — auth session state
- `src/types/database.ts` — types mirroring the database schema
- `supabase/migrations/0001_init.sql` — full schema, RLS policies, storage bucket

## Notes for future work

- Currently assumes one band per user account; the data model (`band_members`) already
  supports a user belonging to multiple bands if that's ever needed.
- Not yet deployed anywhere — runs locally via `npm run dev`. When you're ready to put
  it on the real internet (e.g. for bandmates to use from their phones on the road),
  a static host like Vercel or Netlify works well since there's no custom backend.
