-- ════════════════════════════════════════════════════════════
-- CFO Pack AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════

-- ── 1. Profiles table ────────────────────────────────────────
-- Extends Supabase's built-in auth.users table with extra info.
-- One row per user, automatically created on signup.

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  company       text,
  plan          text not null default 'free' check (plan in ('free','starter','professional')),
  reports_used  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 2. Security: Row Level Security (RLS) ────────────────────
-- RLS means each user can ONLY see their OWN data.
-- Without this, any logged-in user could read everyone's data.

alter table public.profiles enable row level security;

-- Policy: users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── 3. Auto-create profile on signup ─────────────────────────
-- When a new user signs up, automatically create a profile row.
-- This fires immediately after Supabase creates the auth.users row.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',  -- from signUp options.data
    new.raw_user_meta_data ->> 'company'
  );
  return new;
end;
$$;

-- Attach the function to fire on every new signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 4. Auto-update the updated_at timestamp ───────────────────
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- ── 5. Helper: increment report usage counter ─────────────────
-- Called from your app each time a user generates a report.
create or replace function public.increment_reports_used(user_id uuid)
returns void language sql security definer as $$
  update public.profiles
  set reports_used = reports_used + 1
  where id = user_id;
$$;

-- ── Done! ─────────────────────────────────────────────────────
-- To verify, run: select * from public.profiles;
-- It will be empty now, but will populate as users sign up.
