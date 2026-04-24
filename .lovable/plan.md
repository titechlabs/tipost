## Goal

- `/admin` login page → Google sign-in (admins only) **plus** email + password
- `/app` login page → email + password only (with "Forgot password" link)
- All users can change their password while signed in
- "Back to home" link on every login page

---

## 1. Two distinct login screens

Refactor `src/components/app/LoginGate.tsx` into a flexible component that accepts a `variant` prop:

- `variant="user"` (used on `/app`)
  - Tabs: **Sign in** / **Sign up**
  - Email + password fields
  - "Forgot password?" link → opens reset flow
  - "← Back to home" link at the bottom
- `variant="admin"` (used on `/admin`)
  - Tabs: **Sign in** / **Sign up**
  - Email + password fields (same as user)
  - **"Continue with Google"** button on top, with divider "or continue with email"
  - Uses `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" })`
  - "← Back to home" link at the bottom
  - After sign-in, if the account is **not** an admin → show a friendly error ("This account isn't an admin") and sign them out
  - Note: anyone can attempt Google sign-in, but only admins can actually access `/admin` (already enforced by `useIsAdmin` redirecting non-admins to `/`). The Google button is *shown* on `/admin` only; non-admin users on `/app` will not see it.

`src/pages/admin/AdminLayout.tsx` will pass `variant="admin"`; `src/pages/AppPage.tsx` will pass `variant="user"`.

---

## 2. Forgot password flow

- "Forgot password?" link in the user login tab opens a small inline form (email field + "Send reset link" button)
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" })`
- New page **`/reset-password`** (`src/pages/ResetPassword.tsx`)
  - Public route added in `src/App.tsx`
  - Detects the recovery token in the URL hash (Supabase auto-applies it via `onAuthStateChange` → `PASSWORD_RECOVERY` event)
  - Shows a "New password" + "Confirm password" form
  - Calls `supabase.auth.updateUser({ password })`
  - On success → toast + redirect to `/app`

---

## 3. Change password (signed-in users & admins)

New reusable component **`src/components/app/ChangePasswordDialog.tsx`**:

- Triggered from a menu item
- Fields: Current password, New password, Confirm new password
- Re-authenticates by calling `signInWithPassword` with the current password, then `supabase.auth.updateUser({ password: newPassword })`
- Min 6 chars, both new fields must match

Wired in two places:
- **User app**: add "Change password" item in the existing avatar dropdown in `src/components/app/TopBar.tsx` (above "Sign out")
- **Admin console**: add a small user menu in the `AdminLayout` header (currently only has the sidebar trigger + title) with "Change password" and "Sign out"

Note: Google-only accounts have no password. If `updateUser` returns an error indicating no password set, the dialog will show: "This account uses Google sign-in and has no password to change."

---

## 4. "Back to home" link

Added to the bottom of `LoginGate` (both variants) as a subtle text link → navigates to `/`.

---

## Files

**New**
- `src/pages/ResetPassword.tsx` — recovery page
- `src/components/app/ChangePasswordDialog.tsx` — reusable dialog

**Edited**
- `src/components/app/LoginGate.tsx` — add `variant` prop, Google button (admin only), forgot-password link, back-to-home link
- `src/App.tsx` — add `/reset-password` route
- `src/pages/admin/AdminLayout.tsx` — pass `variant="admin"` to LoginGate; add user menu in header with Change password + Sign out
- `src/pages/AppPage.tsx` — pass `variant="user"` to LoginGate
- `src/components/app/TopBar.tsx` — add "Change password" dropdown item

No database or edge-function changes needed. Google OAuth is already wired via `src/integrations/lovable/index.ts`.

Approve and I'll implement.