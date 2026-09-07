-- Standalone shows (not attached to any tour) + four new show fields.
-- Run this once in your Supabase project's SQL editor, after 0001_init.sql.

-- A show can now exist without a tour. RLS is unaffected — every policy on
-- `shows` already checks `band_id` directly, never `tour_id`.
alter table public.shows
  alter column tour_id drop not null;

alter table public.shows
  add column if not exists lodging_spent numeric(10, 2) not null default 0,
  add column if not exists equipment_spent numeric(10, 2) not null default 0,
  add column if not exists soft_merch_units integer not null default 0,
  add column if not exists hard_merch_units integer not null default 0;
