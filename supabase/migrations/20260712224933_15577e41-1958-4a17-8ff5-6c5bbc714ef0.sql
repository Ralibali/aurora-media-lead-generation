-- Idempotent tightening of prospecting tables per updated spec.

-- 1) admin_id NOT NULL. Backfill any existing NULLs first with the nil UUID
--    (represents the shared-admin identity used by the current password-auth model).
UPDATE public.prospecting_campaigns
SET admin_id = '00000000-0000-0000-0000-000000000000'
WHERE admin_id IS NULL;

ALTER TABLE public.prospecting_campaigns
  ALTER COLUMN admin_id SET NOT NULL;

-- 2) Drop DEFAULT on fit_score (server always sets it).
ALTER TABLE public.prospecting_leads
  ALTER COLUMN fit_score DROP DEFAULT;

-- 3) Composite index for campaign listing.
CREATE INDEX IF NOT EXISTS prospecting_campaigns_admin_status_created_idx
  ON public.prospecting_campaigns (admin_id, status, created_at DESC);