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

## Deploying to GitHub Pages

[.github/workflows/deploy.yml](./.github/workflows/deploy.yml) builds and deploys the
app automatically on every push to `main`. Two one-time steps to turn it on:

1. **Enable Pages**: repo → **Settings → Pages** → set **Source** to **GitHub Actions**.
2. **Add your Supabase keys as repo secrets** (the build needs them, and `.env.local`
   is gitignored on purpose — it never reaches GitHub): repo → **Settings → Secrets and
   variables → Actions → New repository secret**, add both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (The Supabase **anon** key is meant to be public — it's safe in a client bundle as
   long as your RLS policies are correct, which they are here. Never put the
   `service_role` key anywhere in this app.)

After that, push to `main` and the Actions tab will show the deploy running; the app
will be live at `https://<your-username>.github.io/<repo-name>/`.

**Moving to a custom domain later**: drop the `--base=/${{ github.event.repository.name
}}/` flag in the workflow, add a `public/CNAME` file containing your domain, point its
DNS at GitHub Pages, and change `pathSegmentsToKeep` from `1` to `0` in
[public/404.html](./public/404.html) (its comment explains why).

## End-to-end tests

[e2e/](./e2e) has Playwright tests covering the core flows: sign up/log in/log out,
create a band, create a tour and a show (checking the net-cash math), a second user
joining by invite code, uploading a photo, dark mode, and changing your password.
They drive the real app against a real backend — no mocking — so they need their
**own, separate Supabase project**, never your real one, since they create and modify
actual bands/tours/shows on every run.

**One-time setup:**

1. Create a second Supabase project (same as [supabase/README.md](./supabase/README.md):
   run the schema migration, and turn **Confirm email** OFF — tests sign up fresh users
   through the real UI and need an active session immediately, not an email link).
2. Copy `.env.e2e.example` to `.env.e2e.local` and fill in that **test** project's URL
   and anon key.
3. Install the Playwright browser once: `npx playwright install --with-deps chromium`.

**Run locally:**

```bash
npm run test:e2e
```

(`npm run test:e2e:ui` opens Playwright's UI mode for debugging a failing spec.)

**In CI**: [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) runs the full
suite as a required `e2e` job before `build`/`deploy` — a failing test blocks the
deploy. It needs two repo secrets (**Settings → Secrets and variables → Actions**),
distinct from the production `VITE_SUPABASE_*` ones used for the actual deploy:

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`

## Notes for future work

- Currently assumes one band per user account; the data model (`band_members`) already
  supports a user belonging to multiple bands if that's ever needed.
