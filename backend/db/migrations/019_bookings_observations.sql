-- Add free-text observations to bookings (instructions for the driver, access, etc.).
--   NULL = no observations
-- Max length (1000 chars) is enforced in the API, not in the database.
-- Independent from service_reason_notes (reason detail / cancellation reason).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS observations TEXT NULL;
