-- Add post_credits and full_name columns to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS post_credits integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS full_name text;

-- Backfill existing users (everyone with no code gets 1 credit; those who already have a code keep 0)
UPDATE public.users
SET post_credits = CASE WHEN code_id IS NULL THEN 1 ELSE 0 END
WHERE post_credits IS NULL OR true;

-- Update the new-user handler to set plan='free', credits=1, capture full_name from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.users (id, email, full_name, referral_code, plan, post_credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    new_ref,
    'free',
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Wire trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- New RPC for free-tier credit consumption
CREATE OR REPLACE FUNCTION public.consume_post_credit(_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _credits int;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;
  SELECT post_credits INTO _credits FROM public.users WHERE id = _uid FOR UPDATE;
  IF _credits IS NULL OR _credits < _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No credits left. Upgrade to continue.', 'credits', COALESCE(_credits, 0), 'upgrade', true);
  END IF;
  UPDATE public.users SET post_credits = post_credits - _amount WHERE id = _uid;
  RETURN jsonb_build_object('ok', true, 'credits', _credits - _amount);
END;
$function$;