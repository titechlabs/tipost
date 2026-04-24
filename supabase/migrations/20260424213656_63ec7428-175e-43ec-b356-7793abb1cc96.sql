
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.plan_type AS ENUM ('free', 'starter', 'pro');

-- ============ ACCESS CODES (created first; users.code_id references it) ============
CREATE TABLE public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  plan plan_type NOT NULL DEFAULT 'free',
  active boolean NOT NULL DEFAULT true,
  daily_limit int NOT NULL DEFAULT 2,
  daily_used int NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  linked_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  referred_by uuid
);

-- ============ USERS (profile table mirroring auth.users) ============
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  code_id uuid REFERENCES public.access_codes(id) ON DELETE SET NULL,
  plan plan_type,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  referral_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Now add FKs back to users for access_codes
ALTER TABLE public.access_codes
  ADD CONSTRAINT access_codes_linked_user_id_fkey FOREIGN KEY (linked_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT access_codes_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============ USER ROLES (separate table — security best practice) ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ POST HISTORY ============
CREATE TABLE public.post_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  post_text text NOT NULL,
  is_favorite boolean NOT NULL DEFAULT false,
  style text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ REFERRALS ============
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ REVENUE ENTRIES ============
CREATE TABLE public.revenue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  plan plan_type NOT NULL,
  amount_pkr int NOT NULL,
  note text,
  paid_at timestamptz NOT NULL DEFAULT now()
);

-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL,
  discount_value int NOT NULL,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ APP SETTINGS ============
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- ============ TOPIC ANALYTICS ============
CREATE TABLE public.topic_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  topic text NOT NULL,
  plan plan_type,
  posts_count int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ ENABLE RLS ============
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_analytics ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- USERS: each user reads/updates their own row; admins read all
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES: only admins manage; users can read their own roles
CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ACCESS_CODES: authenticated users can read codes (to validate during redemption); only admins or edge functions modify; users can update their own linked code
CREATE POLICY "codes_select_authenticated" ON public.access_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "codes_update_own_link" ON public.access_codes FOR UPDATE TO authenticated USING (linked_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR (linked_user_id IS NULL AND active = true));
CREATE POLICY "codes_admin_all" ON public.access_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- POST_HISTORY: users see their own; admins see all
CREATE POLICY "history_select_own" ON public.post_history FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "history_insert_own" ON public.post_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_update_own" ON public.post_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "history_delete_own" ON public.post_history FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- REFERRALS: users see referrals they're part of; admins manage
CREATE POLICY "referrals_select_involved" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "referrals_insert_authenticated" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id);
CREATE POLICY "referrals_admin_all" ON public.referrals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REVENUE_ENTRIES: admin only
CREATE POLICY "revenue_admin_all" ON public.revenue_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COUPONS: anyone authed reads (to validate); admin writes
CREATE POLICY "coupons_select_authenticated" ON public.coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ANNOUNCEMENTS: anyone (incl. anon for landing) reads active; admin writes
CREATE POLICY "announcements_select_all" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "announcements_admin_all" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- APP_SETTINGS: anyone reads (needed for pricing on landing); admin writes
CREATE POLICY "settings_select_all" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_admin_all" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TOPIC_ANALYTICS: users insert their own; admin reads all
CREATE POLICY "analytics_insert_own" ON public.topic_analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_admin_select" ON public.topic_analytics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ HELPER FUNCTIONS ============

-- Generate a random 8-char uppercase alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Auto-create users row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_ref text;
  attempts int := 0;
BEGIN
  LOOP
    new_ref := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_ref);
    attempts := attempts + 1;
    IF attempts > 10 THEN RAISE EXCEPTION 'Could not generate unique referral code'; END IF;
  END LOOP;

  INSERT INTO public.users (id, email, referral_code)
  VALUES (NEW.id, NEW.email, new_ref);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Daily reset for an access code (called from app when fetching code)
CREATE OR REPLACE FUNCTION public.reset_daily_if_needed(_code_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.access_codes
  SET daily_used = 0, last_reset_date = CURRENT_DATE
  WHERE id = _code_id AND last_reset_date < CURRENT_DATE;
END;
$$;

-- Atomic redemption: link code to user, increment users.plan, create referral if applicable
CREATE OR REPLACE FUNCTION public.redeem_access_code(_code text, _ref_code text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user_id uuid := auth.uid();
  _code_row public.access_codes%ROWTYPE;
  _existing_code uuid;
  _referrer_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  -- Already has a code?
  SELECT code_id INTO _existing_code FROM public.users WHERE id = _user_id;
  IF _existing_code IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Account already has an active code');
  END IF;

  -- Find code
  SELECT * INTO _code_row FROM public.access_codes
    WHERE upper(code) = upper(_code) AND active = true AND linked_user_id IS NULL
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid or already used code');
  END IF;

  -- Link
  UPDATE public.access_codes
    SET linked_user_id = _user_id
    WHERE id = _code_row.id;

  UPDATE public.users
    SET code_id = _code_row.id, plan = _code_row.plan
    WHERE id = _user_id;

  -- Referral handling
  IF _ref_code IS NOT NULL AND length(trim(_ref_code)) > 0 THEN
    SELECT id INTO _referrer_id FROM public.users WHERE upper(referral_code) = upper(trim(_ref_code)) AND id <> _user_id;
    IF _referrer_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_user_id, status)
      VALUES (_referrer_id, _user_id, 'pending')
      ON CONFLICT DO NOTHING;
      UPDATE public.users SET referred_by = _referrer_id WHERE id = _user_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'plan', _code_row.plan);
END;
$$;

-- Atomic increment of daily usage; returns new used count or error
CREATE OR REPLACE FUNCTION public.consume_daily_quota(_amount int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user_id uuid := auth.uid();
  _code_id uuid;
  _row public.access_codes%ROWTYPE;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT code_id INTO _code_id FROM public.users WHERE id = _user_id;
  IF _code_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No active code');
  END IF;

  -- Reset if needed
  UPDATE public.access_codes SET daily_used = 0, last_reset_date = CURRENT_DATE
    WHERE id = _code_id AND last_reset_date < CURRENT_DATE;

  SELECT * INTO _row FROM public.access_codes WHERE id = _code_id FOR UPDATE;

  IF NOT _row.active THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Code is inactive');
  END IF;

  IF _row.daily_used + _amount > _row.daily_limit THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Daily limit reached', 'used', _row.daily_used, 'limit', _row.daily_limit);
  END IF;

  UPDATE public.access_codes SET daily_used = daily_used + _amount WHERE id = _code_id;

  RETURN jsonb_build_object('ok', true, 'used', _row.daily_used + _amount, 'limit', _row.daily_limit);
END;
$$;

-- ============ SEED DATA ============
INSERT INTO public.app_settings (key, value) VALUES
  ('whatsapp_number', '923175982953'),
  ('webhook_url', 'https://n8n.titechlabs.dev/webhook/post-generator'),
  ('starter_price', '500'),
  ('pro_price', '1000')
ON CONFLICT (key) DO NOTHING;

-- Seed test access codes
INSERT INTO public.access_codes (code, plan, daily_limit) VALUES
  ('TIPOST-FREE-001', 'free', 2),
  ('TIPOST-STARTER-001', 'starter', 5),
  ('TIPOST-PRO-001', 'pro', 10)
ON CONFLICT (code) DO NOTHING;
