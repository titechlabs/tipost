## Goal

Fix two things:
1. **Google-signed-up users can't use email/password login or change password** — because they never set a password. Add a way for them to set one.
2. **Auth pages (Login / Signup / Reset / Change Password) look plain** — give them a more eye-catching, branded look while staying minimal.

---

## 1. Password handling for Google users

### Problem
- A user who signs up with Google has no password in their account.
- If they later try to "Sign in with email + password" → fails (they never set one).
- If they open "Change password" → the dialog requires the **current** password, which they don't have → blocked.
- "Forgot password?" technically works, but it's not obvious to a Google user that this is the path to *set* a password for the first time.

### Fix

**A. Smart Change Password dialog** (`src/components/app/ChangePasswordDialog.tsx`)
- Detect if the signed-in user has a password by inspecting the session user's `identities` (look for an `email` identity vs only a `google` identity).
- Two modes inside the same dialog:
  - **Set password mode** (Google-only users): only show "New password" + "Confirm new password" fields. Calls `supabase.auth.updateUser({ password })` directly (no current-password re-auth needed — the user already has an active session). Title: "Set a password". Helper text explains: "Your account uses Google sign-in. Set a password to also sign in with email."
  - **Change password mode** (users with an existing password): keep the current 3-field flow (current + new + confirm) with re-auth via `signInWithPassword`.
- After success, show a toast: "Password set — you can now sign in with email and password."

**B. Topbar dropdown label** (`src/components/app/TopBar.tsx`)
- Show "Set password" instead of "Change password" when the user has no email/password identity. Same menu item, dynamic label.

**C. Login page hint** (`src/pages/Login.tsx`)
- Under the "Forgot password?" link, when a sign-in attempt fails with "Invalid login credentials", show a small inline hint: "Signed up with Google? Use 'Continue with Google' below, or reset your password to set one."

No DB changes needed — Supabase already supports `updateUser({ password })` for an authenticated session, including OAuth-only users.

---

## 2. Visual refresh for auth pages

Goal: make Login / Signup / Reset Password / AdminLogin feel premium and on-brand (matches the existing dark theme with `--accent` purple `#6c63ff` and `--accent-2` teal `#00d4aa` already defined in `src/index.css`).

### Changes to `src/components/auth/AuthShell.tsx`
- **Two-column layout on desktop** (≥md):
  - **Left panel (hero)**: gradient background using existing `--gradient-brand`, with a subtle radial glow + grid/dot overlay. Contains:
    - The TiPost logo (large)
    - A rotating tagline / value prop (static text is fine): "Generate scroll-stopping LinkedIn posts in 60 seconds."
    - 3 small bullet features with check icons (e.g. "AI-tuned hooks", "Your voice, amplified", "1 free post to start")
    - A small testimonial-style quote at the bottom
  - **Right panel**: the form card (current `AuthShell` content), centered.
- **Mobile (<md)**: single column — only the form card, with a compact gradient logo header on top so it still feels branded.
- Card styling: keep `ti-card ti-card-glow`, add a soft outer glow ring using `--accent`.

### Changes to `AuthHeader`
- Bigger, bolder display title with a **gradient highlight word** using the existing `.gradient-text` class, e.g.:
  - Login: "Welcome **back**" → "back" rendered in gradient
  - Signup: "Create your **account**" → "account" in gradient
- Subtitle: punchier copy
  - Login: "Pick up where you left off — your next post is one click away."
  - Signup: "Join writers shipping LinkedIn posts that actually get read."
- Add a small "1 free post included" pill (using existing `.pill` class) above the title on Signup.

### Buttons
- Primary submit button: switch from flat white to the existing `.btn-gradient` class so it matches the landing page CTAs (purple→violet gradient with glow).
- Google button: keep outline style but add hover lift (`hover:-translate-y-0.5 transition-transform`).
- Add subtle loading spinner inside buttons instead of just text swap.

### Inputs
- Slightly taller (`h-11`), rounded-xl, soft inner shadow, focus ring uses `--accent`.
- Floating-style labels not required — keep current `<Label>` above input but increase visual hierarchy (smaller, uppercase tracking-wider muted label).

### Files touched
- `src/components/auth/AuthShell.tsx` — new two-column layout, gradient hero panel, updated `AuthHeader`, restyled `AuthField`.
- `src/pages/Login.tsx` — gradient submit button, updated copy, inline Google hint on failed login.
- `src/pages/Signup.tsx` — gradient submit button, "1 free post" pill, updated copy.
- `src/pages/ResetPassword.tsx` — match new visual style.
- `src/pages/AdminLogin.tsx` — match new visual style (with an "Admin" badge in the hero panel).

---

## Out of scope
- No backend / DB / migration changes.
- No new routes.
- Email template branding (separate task).

---

## Acceptance criteria
- A user who signed up with Google can open the user menu → "Set password", set one without entering a current password, then log out and sign in with email + that password.
- A user with an existing password still sees the 3-field "Change password" flow and re-auth still happens.
- Login / Signup pages show a branded two-column layout on desktop, single-column on mobile, with gradient submit buttons and refined copy.
- All existing functionality (forgot password, Google OAuth, redirects) keeps working.
