-- Add free-text observations to bookings (instructions for the driver, access, etc.).
--   NULL = no observations
-- Observations are internal notes visible only to admin/superadmin. The API
-- (FastAPI, service-role key) enforces this and the 1000-char limit.
-- Independent from service_reason_notes (reason detail / cancellation reason).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS observations TEXT NULL;

-- -----------------------------------------------------------------
-- bookings: API-only access
-- The frontend never queries bookings through Supabase directly; everything
-- goes through the FastAPI backend, which uses the service-role key (bypasses
-- RLS). Remove every client-side policy and privilege so an authenticated user
-- cannot read or modify bookings (including observations) via PostgREST.
-- -----------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.bookings', pol.policyname);
  END LOOP;
END
$$;

REVOKE ALL ON TABLE public.bookings FROM anon, authenticated;
