-- Add gender to prms (service user profile).
--   NULL          = not specified
--   'M'           = male
--   'F'           = female
--   'Other'       = other
--   'Undisclosed' = prefers not to say
-- Age is NOT stored: it is derived from birth_date in the frontend.
ALTER TABLE public.prms
  ADD COLUMN IF NOT EXISTS gender TEXT NULL;

ALTER TABLE public.prms
  DROP CONSTRAINT IF EXISTS prms_gender_check;

ALTER TABLE public.prms
  ADD CONSTRAINT prms_gender_check
  CHECK (gender IS NULL OR gender IN ('M', 'F', 'Other', 'Undisclosed'));
