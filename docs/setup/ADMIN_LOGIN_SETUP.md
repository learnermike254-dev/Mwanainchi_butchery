# Admin Login Setup Guide

## Problem: Admin Login Stuck at "Signing in..."

The admin login page gets stuck because **`SUPABASE_SERVICE_ROLE_KEY` is missing** from environment variables.

---

## Quick Fix (3 Steps)

### Step 1: Get Service Role Key from Supabase

1. Go to [Supabase Console](https://app.supabase.com)
2. Select your **Mwanainchi Butchery** project
3. Click **Settings** → **API**
4. Find **Service Role Secret** (or **Service Role Key**)
5. Click the copy icon next to it

**⚠️ SECURITY:** This key is SECRET - never commit it to git!

---

### Step 2: Create/Update `.env.local`

In your project root, create or open `.env.local`:

```env
# Supabase Client (Public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Admin (Server-side only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

⚠️ Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are **server-side** variables (not prefixed with `VITE_`)

---

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart
npm run dev
```

---

## Test Admin Login

**Credentials:**
- **Email:** `admin@mwanainchi.co.ke`
- **Password:** `MwanainchiAdmin2026!`

**Expected Result:** Should navigate to `/admin` dashboard with no errors

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| Still stuck at "Signing in..." | Check that `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`, then restart dev server |
| "Invalid credentials" error | Ensure admin account exists in Supabase auth (should auto-create on first login attempt) |
| Can't find service role key | In Supabase: Settings → API → Look for "Service Role" (not Anon Key) |
| Error shows in console | Check terminal output for Supabase error messages |

---

## File Locations

- **Login Page:** `src/routes/admin-login.tsx`
- **Admin Functions:** `src/lib/admin.functions.ts`
- **Supabase Config:** `src/integrations/supabase/client.server.ts`
- **Environment File:** `.env.local` (create at project root)

---

## Additional Notes

1. The admin account (`admin@mwanainchi.co.ke`) is automatically created on first bootstrap
2. All admin server functions require the service role key for admin operations
3. The service role key should NEVER be exposed to client-side code
4. `.env.local` is in `.gitignore` - it won't be committed to git

---

**Last Updated:** June 1, 2026
