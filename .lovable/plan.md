## Goal

Move TiPost from a "code-first" flow to a standard SaaS flow:

```text
Landing → /login or /signup → /app (1 free post) → /pricing → upgrade
```

- Dedicated `/login` and `/signup` routes (no more in-app login gate)
- `/app` requires auth, redirects to `/login` if not authenticated
- New users get **1 free post credit** automatically
- Quota system uses `post_credits` for the Free plan (paid plans keep their daily limits)
- New `/pricing` page (separate from the landing section)
- `/admin` = login only (no signup); Google + Email/Password; admin role required
- Access-code redemption is moved out of the default flow into `/pricing` as an optional "I have a code" panel

---

## 1. Routing changes (`src/App.tsx`)

Add new public routes:
- `/login` → `Login.tsx` (sign-in form)
- `/signup` → `Signup.tsx` (sign-up form with name)
- `/pricing` → `Pricing.tsx` (full standalone page)
- `/admin/login` → `AdminLogin.tsx` (Google + email/password, no signup tab)

Keep: `/`, `/app`, `/reset-password`, `/admin/*`, `*`

---

## 2. Landing button fixes

- `src/components/landing/Hero.tsx` — both CTA buttons (`Start Free`, `See how it works` stays as anchor) → `Start Free` now links to `/signup`
- `src/components/landing/Navbar.tsx` — `Try Free →` button → navigates to `/signup`; add a secondary `Sign in` link → `/login`
- `src/components/landing/Pricing.tsx` (landing section) — `Get Started Free` button → `/signup`; "Get Access via WhatsApp" buttons remain
- Footer / any other `/app` link audited and pointed to `/signup` where it represents a CTA

---

## 3. New auth pages

**`src/pages/Login.tsx`**
- Email + password form
- Helper text: "New here? Create an account"
- Links: `Forgot password?`, `Create account` → `/signup`, `← Back to home`
- On success → redirect to `/app`
- If already signed in → auto redirect to `/app`

**`src/pages/Signup.tsx`**
- Fields: **Name**, Email, Password (min 6)
- Calls `supabase.auth.signUp` with `options.data: { full_name }` and `emailRedirectTo: window.location.origin + "/app"`
- After signup → toast + redirect to `/app`
- Links: `Already have an account? Sign in` → `/login`, `← Back to home`

**`src/pages/AdminLogin.tsx`**
- Sign-in only (no signup tab)
- Top: `Continue with Google` button (uses existing `lovable.auth.signInWithOAuth`)
- Below: Email + password form + `Forgot password?`
- After auth → redirect to `/admin`; if not admin, show error and sign out (existing `useIsAdmin` already redirects non-admins, but we also surface a friendly toast)
- Link: `← Back to home`

The current `LoginGate.tsx` component is **deleted** (its logic is split into the three pages above; shared `CenteredCard` + `Field` extracted to a small `src/components/auth/AuthShell.tsx`).

---

## 4. Route guards

**`src/pages/AppPage.tsx`**
- Replace inline `<LoginGate />` with `<Navigate to="/login" replace state={{ from: "/app" }} />` when no session.
- Remove the `AccessCodeGate` flow from the default path. Free users without a code automatically get a synthetic "free" access entry (see §5) so the app loads immediately.

**`src/pages/admin/AdminLayout.tsx`**
- Replace inline `<LoginGate variant="admin" />` with `<Navigate to="/admin/login" replace />` when no session.
- Keep existing `useIsAdmin` non-admin → redirect to `/`.

---

## 5. Free trial credits (database)

Add a per-user credit balance for the Free plan. Keep the existing `access_codes` daily-quota system intact for paid plans.

**Migration:**
```sql
ALTER TABLE public.users
  ADD COLUMN post_credits integer NOT NULL DEFAULT 1,
  ADD COLUMN full_name text;

-- Update handle_new_user trigger to default plan='free' and post_credits=1
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  INSERT INTO public.users (id, email, full_name, referral_code, plan, post_credits)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', new_ref, 'free', 1);

-- New RPC for free-tier credit consumption
CREATE OR REPLACE FUNCTION public.consume_post_credit(_amount integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _credits int;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated'); END IF;
  SELECT post_credits INTO _credits FROM public.users WHERE id = _uid FOR UPDATE;
  IF _credits IS NULL OR _credits < _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No credits left', 'credits', COALESCE(_credits,0));
  END IF;
  UPDATE public.users SET post_credits = post_credits - _amount WHERE id = _uid;
  RETURN jsonb_build_object('ok', true, 'credits', _credits - _amount);
END $$;
```

Backfill: existing users without `post_credits` default to 1.

**Edge function `generate-posts`:**
- Read user's `plan` and `code_id` first.
- If `code_id IS NOT NULL` → use existing `consume_daily_quota` (paid behavior unchanged).
- Else (free trial) → call `consume_post_credit(_amount)`. If `ok: false` → return `402` with `{ error: "Upgrade to continue", upgrade: true }`.

---

## 6. App page UX (`src/pages/AppPage.tsx`)

- Remove `AccessCodeGate` import & branch.
- Always render the app once signed in.
- Compute display values:
  - If user has `code_id` → existing plan/used/limit logic.
  - Else (free trial) → `plan: "free"`, `used: 1 - post_credits`, `limit: 1`, `maxPerRun: 1`.
- Pass `post_credits` to `Generator`. When `post_credits === 0` and no `code_id`, show an "Upgrade to continue" banner with a button → `/pricing` instead of (or above) the generate button.
- `Generator.tsx` — handle `402` / `upgrade: true` from the edge function: show toast + inline upgrade CTA linking to `/pricing`.

---

## 7. New `/pricing` page (`src/pages/Pricing.tsx`)

A full page (Navbar + content + Footer) that:
- Reuses the landing `Pricing` section component (already shows Free / Starter / Pro)
- Adds a small collapsible **"Have an access code?"** panel at the bottom that mounts `AccessCodeGate` (refactored to be embeddable; on success → toast + navigate to `/app`).
- Page title: "Pricing — TiPost"

---

## 8. Logout + UI polish

- `TopBar.tsx` already has Sign out in the dropdown — add an explicit visible logout icon button next to the avatar on desktop for clarity. Mobile keeps it inside the dropdown.
- `Navbar.tsx` (landing) — add `Sign in` text link before `Try Free →` button.
- Login/Signup pages: minimal centered card (reuse `AuthShell`), helper text under the title (e.g. "Generate LinkedIn posts in under 60 seconds — start free, no card needed.")

---

## 9. Files

**New**
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/AdminLogin.tsx`
- `src/pages/Pricing.tsx`
- `src/components/auth/AuthShell.tsx` (shared `CenteredCard` + `Field`)

**Edited**
- `src/App.tsx` — add `/login`, `/signup`, `/pricing`, `/admin/login` routes
- `src/components/landing/Hero.tsx` — CTA → `/signup`
- `src/components/landing/Navbar.tsx` — `Try Free` → `/signup`, add `Sign in` link
- `src/components/landing/Pricing.tsx` — Free CTA → `/signup`
- `src/components/landing/Footer.tsx` — audit links
- `src/pages/AppPage.tsx` — redirect to `/login`, remove access-code gate, free-credit logic
- `src/pages/admin/AdminLayout.tsx` — redirect to `/admin/login`
- `src/components/app/Generator.tsx` — handle `upgrade` response, show CTA to `/pricing`
- `src/components/app/TopBar.tsx` — visible logout button
- `src/components/app/AccessCodeGate.tsx` — make embeddable (accept `compact` prop, drop `CenteredCard` wrapper)
- `supabase/functions/generate-posts/index.ts` — branch on `code_id` for credit vs quota

**Deleted**
- `src/components/app/LoginGate.tsx` (replaced by dedicated pages)

**Database migration**
- `users.post_credits` (default 1) + `users.full_name`
- Updated `handle_new_user` trigger (sets plan=free, credits=1, full_name from metadata)
- New `consume_post_credit` RPC
- Note: the `handle_new_user` trigger already exists as a function — verify it's wired to `auth.users` insert; if not, the migration adds the trigger.

---

## Final flows

**User:** Landing → `/signup` → `/app` (1 free post) → generate → credits hit 0 → "Upgrade" CTA → `/pricing` → WhatsApp → admin issues code → user redeems via `/pricing` "Have a code?" panel → paid plan active.

**Admin:** Landing → `/admin` → not signed in → `/admin/login` → Google or email/password → admin role check → `/admin` console.

Approve and I'll implement.