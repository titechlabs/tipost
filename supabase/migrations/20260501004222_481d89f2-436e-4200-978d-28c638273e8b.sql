-- Standardize plan limits: Free=1, Starter=5, Pro=10
UPDATE public.access_codes SET daily_limit = 10 WHERE plan = 'pro';
UPDATE public.access_codes SET daily_limit = 5 WHERE plan = 'starter';
UPDATE public.access_codes SET daily_limit = 1 WHERE plan = 'free';

-- Change default for new codes
ALTER TABLE public.access_codes ALTER COLUMN daily_limit SET DEFAULT 5;