# Supabase setup

The app needs a Supabase project for auth, the database, and photo storage. This is a
one-time setup.

## 1. Create a project

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project**.
2. Pick any name/region and a database password (you won't need the password day-to-day).
3. Wait for the project to finish provisioning (~2 minutes).

## 2. Run the schema migrations

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Run each file in [`migrations/`](./migrations) **in order** (`0001_init.sql`
   first, then any later ones) — click **New query**, paste in a file's entire
   contents, click **Run**, then repeat for the next file. Each one is the
   historical record of a real schema change, so a fresh project needs all of them
   to end up with the current schema; skipping ahead to just the newest file will
   leave earlier tables/columns missing.
3. Together they create all the tables, row-level security policies, and the
   `show-photos` storage bucket used by the app.

## 3. Configure auth

1. Go to **Authentication → Providers** and confirm **Email** is enabled (it is by
   default).
2. Go to **Authentication → Settings**. For local development, it's much easier to
   turn **Confirm email** OFF, so signing up logs you straight in without needing to
   click a confirmation link. Turn it back on before letting real bandmates outside
   your control sign up, if you want that protection.

## 4. Get your API keys

1. Go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. In the app's root folder, copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` with the
   values you copied. Never commit `.env.local` (it's already gitignored).

## 5. Run the app

```bash
npm install
npm run dev
```

Sign up with an email/password, then either **Create a band** (you'll get an invite
code to share with bandmates) or **Join a band** with a code someone shared with you.
