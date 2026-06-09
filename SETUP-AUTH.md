# CFO Pack AI — Authentication Setup Guide
### A step-by-step guide written for non-technical founders

---

## What You're Setting Up

Your app already has all the auth code written. What you need to do is:

1. Create a free Supabase account (the database + auth service)
2. Run one SQL script to create your database table
3. Add two environment variables (secret keys) to your project
4. Test that login, signup, and logout all work

Total time: about 20 minutes.

---

## Part 1 — Create Your Supabase Account and Project

**Supabase** is a free service that handles your database and user authentication. Think of it as the "backend" that stores your users' data securely.

### Step 1.1 — Sign Up

1. Go to **https://supabase.com**
2. Click the big **"Start your project"** button (it's free)
3. Sign up with GitHub (easiest) or your email
4. Confirm your email if prompted

### Step 1.2 — Create a New Project

1. You'll land on the Supabase dashboard
2. Click **"New project"**
3. Fill in:
   - **Project name:** `cfopack-ai` (or anything you like)
   - **Database password:** Create a strong password and **save it somewhere** — you'll need it if you ever connect directly to the database
   - **Region:** Pick the one closest to you (e.g., "West US" if you're in California)
4. Click **"Create new project"**
5. **Wait 1-2 minutes** while Supabase provisions everything. You'll see a progress bar.

---

## Part 2 — Create Your Database Table

### Step 2.1 — Open the SQL Editor

1. In your Supabase project, look at the left sidebar
2. Click **"SQL Editor"** (it looks like a database cylinder icon)
3. Click **"New query"** in the top-left

### Step 2.2 — Paste and Run the Schema

1. Open the file `supabase-schema.sql` that came with your project
2. Select ALL the text (Cmd+A on Mac, Ctrl+A on Windows)
3. Copy it (Cmd+C / Ctrl+C)
4. Click inside the Supabase SQL Editor text area
5. Paste (Cmd+V / Ctrl+V)
6. Click the green **"Run"** button (or press Cmd+Enter / Ctrl+Enter)

**Expected result:** You should see:
```
Success. No rows returned.
```
And then a table showing the column names of your new `profiles` table.

**If you get an error:** See the troubleshooting section at the bottom of this guide.

### Step 2.3 — Confirm the Table Exists

1. In the left sidebar, click **"Table Editor"**
2. You should see a table called **"profiles"**
3. Click on it — you'll see an empty table with columns: id, email, full_name, company, plan, reports_used, created_at, updated_at

✅ **Database is ready.**

---

## Part 3 — Get Your API Keys

These are like secret passwords that let your app talk to Supabase.

### Step 3.1 — Find Your Keys

1. In your Supabase project, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the submenu
3. You'll see two keys you need:

**Key 1 — Project URL:**
```
https://abcdefghijklmno.supabase.co
```
(yours will have different random letters)

**Key 2 — anon/public key:**
A long string starting with `eyJ...`

### Step 3.2 — Create Your .env.local File

1. Open your `cfopack-next` folder in VS Code (File → Open Folder)
2. Find the file named `.env.local.example` in the root of the project
3. Right-click it → **"Copy"**
4. Right-click in the same folder → **"Paste"**
5. Rename the copy to: `.env.local` (remove the `.example` part)
6. Open `.env.local`
7. Replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_ACTUAL_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...YOUR_ACTUAL_KEY...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Replace `https://YOUR_ACTUAL_URL.supabase.co` with your actual Project URL from Step 3.1
- Replace `eyJ...YOUR_ACTUAL_KEY...` with your actual anon key from Step 3.1
- Keep `http://localhost:3000` as-is for now (you'll change it when you deploy)
- Save the file (Cmd+S / Ctrl+S)

---

## Part 4 — Configure Supabase Auth Settings

### Step 4.1 — Set the Email Confirmation Redirect URL

When a user signs up, Supabase sends them a confirmation email. When they click the link, it needs to redirect back to your app.

1. In Supabase, go to **Authentication → URL Configuration**
2. Under **"Site URL"**, enter: `http://localhost:3000`
3. Under **"Redirect URLs"**, add: `http://localhost:3000/auth/callback`
4. Click **"Save"**

### Step 4.2 — (Optional) Disable Email Confirmation for Testing

For testing locally, it's easier to disable email confirmation so you can sign up and immediately sign in.

1. Go to **Authentication → Providers → Email**
2. Turn OFF **"Confirm email"**
3. Click **"Save"**

⚠️ **Turn this back ON before going live** — email confirmation prevents spam accounts.

---

## Part 5 — Install Dependencies and Start the App

### Step 5.1 — Install the Supabase packages

Open VS Code, open the Terminal (Ctrl+`), and run:

```bash
npm install
```

This installs `@supabase/ssr` and `@supabase/supabase-js` (they're already in package.json).

### Step 5.2 — Start the App

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
- Ready in 2.1s
```

---

## Part 6 — Test Every Auth Feature

Open **http://localhost:3000** in your browser.

### ✅ Test 1 — Signup

1. Click **"Get started →"** in the top right
2. Fill in: Full name, Company, Email, Password (at least 8 characters)
3. Click **"Create account →"**

**Expected result:**
- If email confirmation is OFF: you're redirected to sign in
- If email confirmation is ON: you see "Check your email" with the 📬 emoji

### ✅ Test 2 — Login

1. Go to `http://localhost:3000/auth/login`
2. Enter your email and password
3. Click **"Sign in →"**

**Expected result:** You're redirected to `http://localhost:3000/dashboard`

### ✅ Test 3 — Dashboard

You should see:
- "Welcome back, [Your Name] 👋"
- Stats showing "0 / 5 reports used"
- Two action cards: FP&A Suite and Financial Analysis
- Your email and account info

### ✅ Test 4 — Session Persistence

1. While logged in, close the browser tab
2. Open a new tab and go to `http://localhost:3000/dashboard`

**Expected result:** You should still be logged in (no login required again). This is "session persistence" working correctly.

### ✅ Test 5 — Protected Routes

1. Open an incognito/private window
2. Try to go directly to `http://localhost:3000/dashboard`

**Expected result:** You're redirected to `/auth/login?next=/dashboard`. After logging in, you'll be sent back to the dashboard.

### ✅ Test 6 — Forgot Password

1. Go to `http://localhost:3000/auth/login`
2. Click "Forgot password?"
3. Enter your email
4. Click "Send reset link →"

**Expected result:** You see the 📧 "Email sent!" screen. Check your inbox for the reset email.

### ✅ Test 7 — Logout

1. On the dashboard, click your avatar (circle with your initial) in the top right
2. Click **"Sign out"**

**Expected result:** You're redirected to `/auth/login` and can no longer access `/dashboard` without logging in again.

### ✅ Test 8 — Verify Profile in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor" → "profiles"**
3. You should see a row with your email, name, and company

---

## Common Mistakes and Fixes

### ❌ "Invalid API key" or "Project not found" error
**Cause:** Wrong values in `.env.local`
**Fix:** Double-check that you copied the URL and anon key exactly from Supabase Settings → API. Make sure there are no spaces before or after the values.

### ❌ The app shows but login doesn't work
**Cause:** `.env.local` file not being read
**Fix:** Stop the dev server (Ctrl+C in terminal), then restart: `npm run dev`. Next.js only reads `.env.local` on startup.

### ❌ "Email not confirmed" error when logging in
**Cause:** You signed up but haven't confirmed your email yet
**Fix:** Either check your email and click the confirmation link, OR turn off email confirmation in Supabase (Authentication → Providers → Email → turn off "Confirm email")

### ❌ Redirects to login when you're already logged in
**Cause:** The session cookie isn't being set correctly
**Fix:** Make sure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env.local`

### ❌ Profile not created after signup
**Cause:** The database trigger didn't run
**Fix:** Go to Supabase → Table Editor → profiles. If your row is missing, re-run the SQL in supabase-schema.sql. Also check that RLS is enabled (the SQL handles this).

### ❌ "Cannot find module '@supabase/ssr'"
**Cause:** Packages not installed
**Fix:** Run `npm install` in your project folder

### ❌ Dashboard shows but has no user data
**Cause:** The profile row exists but has null values
**Fix:** The trigger extracts `full_name` and `company` from signup metadata. Make sure you filled in both fields when signing up.

### ❌ "next: not found" when running npm run dev
**Cause:** node_modules not installed
**Fix:** Run `npm install` first, then `npm run dev`

---

## How Auth Works (Simple Explanation)

Here's what happens when a user signs up and logs in:

```
User fills out signup form
        ↓
Your app sends email + password to Supabase
        ↓
Supabase creates a user in auth.users table
        ↓
A "trigger" automatically creates a row in your profiles table
(with their name, company, and plan = 'free')
        ↓
Supabase sends a confirmation email (if enabled)
        ↓
User clicks the link → redirected to /auth/callback
        ↓
Your app exchanges the link code for a session
        ↓
A secure cookie is set in the user's browser
        ↓
Every future request: Next.js middleware reads the cookie,
refreshes it if needed, and decides if the user can access the page
```

---

## Deploying to Vercel (After Local Testing)

Once everything works locally:

### Step D.1 — Add Environment Variables to Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add these three variables (same values as your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` → change this to your Vercel URL, e.g. `https://cfopack.vercel.app`

### Step D.2 — Update Supabase Redirect URLs

1. Go to Supabase → Authentication → URL Configuration
2. Update **"Site URL"** to your Vercel URL: `https://cfopack.vercel.app`
3. Add to **"Redirect URLs"**: `https://cfopack.vercel.app/auth/callback`
4. Save

### Step D.3 — Redeploy

Push your code to GitHub (or drag-drop to Vercel again). The new environment variables will be picked up automatically.

---

## File Structure Reference

Here's which file does what in the auth system:

| File | What it does |
|------|-------------|
| `src/middleware.ts` | Runs on every page load; redirects unauthenticated users |
| `src/context/AuthContext.tsx` | Makes the logged-in user available everywhere |
| `src/lib/supabase/client.ts` | Supabase client for browser (interactive pages) |
| `src/lib/supabase/server.ts` | Supabase client for server (SSR pages) |
| `src/app/auth/login/page.tsx` | Login form |
| `src/app/auth/signup/page.tsx` | Signup form with password strength |
| `src/app/auth/forgot-password/page.tsx` | "Send reset link" form |
| `src/app/auth/reset-password/page.tsx` | "Set new password" form |
| `src/app/auth/callback/route.ts` | Handles email confirmation link clicks |
| `src/app/dashboard/page.tsx` | Protected dashboard (only logged-in users) |
| `src/components/auth/AuthCard.tsx` | The card wrapper on all auth pages |
| `src/components/auth/FormField.tsx` | Input fields with show/hide password |
| `src/components/auth/AlertBox.tsx` | Error and success message boxes |
| `supabase-schema.sql` | Run this once in Supabase SQL Editor |
| `.env.local.example` | Copy and rename to `.env.local`, fill in your keys |

