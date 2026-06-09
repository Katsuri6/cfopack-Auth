-- ═══════════════════════════════════════════════════════════════════════
-- CFO Pack AI — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════
-- HOW TO USE:
-- 1. Go to supabase.com → your project → SQL Editor
-- 2. Click "New query"
-- 3. Paste this ENTIRE file into the editor
-- 4. Click "Run" (green button, top right)
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Profiles table ─────────────────────────────────────────────────
-- Stores extra info about each user (name, company, plan, usage).
-- One row per user. Automatically created when someone signs up.
CREATE TABLE IF NOT EXISTS public.profiles (
  -- The user's unique ID (same as their Supabase Auth ID)
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  company       TEXT,
  -- Subscription plan: free (5 reports), starter (20), professional (100)
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional')),
  -- How many reports this user has run this month
  reports_used  INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Row Level Security ──────────────────────────────────────────────
-- This makes it so users can ONLY see and edit their OWN profile.
-- Without this, a logged-in user could theoretically read anyone's data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: "Users can read their own profile"
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: "Users can update their own profile"
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── 3. Auto-create profile on signup ──────────────────────────────────
-- When someone creates an account, this function automatically
-- creates a matching row in the profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company)
  VALUES (
    NEW.id,
    NEW.email,
    -- Pull name from signup metadata (if they filled it in)
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'company'
  );
  RETURN NEW;
END;
$$;

-- Attach the function to fire every time a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 4. Auto-update the "updated_at" timestamp ──────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── 5. Done! ──────────────────────────────────────────────────────────
-- You should see: "Success. No rows returned" in Supabase.
-- This means your database is ready.
