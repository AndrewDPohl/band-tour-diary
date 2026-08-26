-- Band Tour Diary — initial schema, RLS policies, and storage bucket.
-- Run this once in your Supabase project's SQL editor (or via `supabase db push`
-- if you're using the Supabase CLI). See supabase/README.md for full setup steps.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles — mirrors auth.users, created automatically on signup
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- bands
-- ============================================================================
create table if not exists public.bands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.band_members (
  band_id uuid not null references public.bands (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (band_id, user_id)
);

-- Helper: is the current user a member of this band?
create or replace function public.is_band_member(target_band_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.band_members
    where band_id = target_band_id and user_id = auth.uid()
  );
$$;

alter table public.bands enable row level security;
alter table public.band_members enable row level security;

-- `created_by = auth.uid()` lets the creator see (and get back via RETURNING)
-- the band they just made, before the band_members row exists — Postgres
-- applies this SELECT policy to INSERT ... RETURNING as well as plain SELECT,
-- so without this fallback the very insert that creates the band would fail.
create policy "members can view their band"
  on public.bands for select
  to authenticated
  using (public.is_band_member(id) or created_by = auth.uid());

create policy "authenticated users can create a band"
  on public.bands for insert
  to authenticated
  with check (created_by = auth.uid());

-- Joining a band means looking it up by invite code *before* you're a member,
-- which the SELECT policy above (deliberately) doesn't allow — it would let
-- any signed-in user browse every band's invite code otherwise. This function
-- is a narrow, security-definer exception: given a code, it returns only the
-- one matching band's id/name, nothing else about the bands table.
create or replace function public.find_band_by_invite_code(code text)
returns table (id uuid, name text)
language sql
security definer set search_path = public
stable
as $$
  select b.id, b.name from public.bands b where b.invite_code = upper(trim(code));
$$;

grant execute on function public.find_band_by_invite_code(text) to authenticated;

create policy "members can view their band's membership rows"
  on public.band_members for select
  to authenticated
  using (public.is_band_member(band_id));

create policy "users can add themselves to a band"
  on public.band_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- ============================================================================
-- tours
-- ============================================================================
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands (id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.tours enable row level security;

create policy "members can view their band's tours"
  on public.tours for select
  to authenticated
  using (public.is_band_member(band_id));

create policy "members can create tours for their band"
  on public.tours for insert
  to authenticated
  with check (public.is_band_member(band_id) and created_by = auth.uid());

create policy "members can update their band's tours"
  on public.tours for update
  to authenticated
  using (public.is_band_member(band_id));

create policy "members can delete their band's tours"
  on public.tours for delete
  to authenticated
  using (public.is_band_member(band_id));

-- ============================================================================
-- shows
-- ============================================================================
create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  band_id uuid not null references public.bands (id) on delete cascade,
  date date not null,
  venue_name text not null,
  venue_address text,
  city text,
  region text,
  contact_name text,
  contact_phone text,
  promoter_name text,
  payment_type text not null default 'door_deal' check (payment_type in ('guarantee', 'door_deal')),
  guarantee_amount numeric(10, 2),
  attendance_count integer,
  merch_sales_total numeric(10, 2) not null default 0,
  gas_spent numeric(10, 2) not null default 0,
  food_spent numeric(10, 2) not null default 0,
  door_total numeric(10, 2) not null default 0,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shows_tour_id_idx on public.shows (tour_id);
create index if not exists shows_band_id_idx on public.shows (band_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shows_set_updated_at on public.shows;
create trigger shows_set_updated_at
  before update on public.shows
  for each row execute function public.set_updated_at();

alter table public.shows enable row level security;

create policy "members can view their band's shows"
  on public.shows for select
  to authenticated
  using (public.is_band_member(band_id));

create policy "members can create shows for their band"
  on public.shows for insert
  to authenticated
  with check (public.is_band_member(band_id) and created_by = auth.uid());

create policy "members can update their band's shows"
  on public.shows for update
  to authenticated
  using (public.is_band_member(band_id));

create policy "members can delete their band's shows"
  on public.shows for delete
  to authenticated
  using (public.is_band_member(band_id));

-- ============================================================================
-- show_photos
-- ============================================================================
create table if not exists public.show_photos (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows (id) on delete cascade,
  band_id uuid not null references public.bands (id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists show_photos_show_id_idx on public.show_photos (show_id);

alter table public.show_photos enable row level security;

create policy "members can view their band's show photos"
  on public.show_photos for select
  to authenticated
  using (public.is_band_member(band_id));

create policy "members can add show photos for their band"
  on public.show_photos for insert
  to authenticated
  with check (public.is_band_member(band_id) and uploaded_by = auth.uid());

create policy "members can delete their band's show photos"
  on public.show_photos for delete
  to authenticated
  using (public.is_band_member(band_id));

-- ============================================================================
-- Storage bucket for show photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('show-photos', 'show-photos', false)
on conflict (id) do nothing;

-- Storage object paths are structured as `{band_id}/{show_id}/{filename}`, so the
-- first path segment (storage.foldername(name))[1] is the band_id.
create policy "members can view photos in their band's folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'show-photos'
    and public.is_band_member(((storage.foldername(name))[1])::uuid)
  );

create policy "members can upload photos to their band's folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'show-photos'
    and public.is_band_member(((storage.foldername(name))[1])::uuid)
  );

create policy "members can delete photos in their band's folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'show-photos'
    and public.is_band_member(((storage.foldername(name))[1])::uuid)
  );
