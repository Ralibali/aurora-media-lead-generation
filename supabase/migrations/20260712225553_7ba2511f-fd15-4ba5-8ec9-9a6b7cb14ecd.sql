
-- Final idempotent migration for admin prospecting (tables, indexes, RLS, triggers, rate-limit RPC).

-- === Tables =================================================================

CREATE TABLE IF NOT EXISTS public.prospecting_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  name text NOT NULL,
  query text NOT NULL,
  location text NOT NULL DEFAULT 'Sweden',
  need_type text NOT NULL CHECK (need_type IN ('webb','ehandel','ai','valfritt')),
  industry text,
  result_limit integer NOT NULL DEFAULT 10 CHECK (result_limit BETWEEN 1 AND 20),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','completed','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

UPDATE public.prospecting_campaigns
SET admin_id = '00000000-0000-0000-0000-000000000000'
WHERE admin_id IS NULL;

ALTER TABLE public.prospecting_campaigns ALTER COLUMN admin_id SET NOT NULL;

GRANT ALL ON public.prospecting_campaigns TO service_role;
ALTER TABLE public.prospecting_campaigns ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.prospecting_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.prospecting_campaigns(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  domain text NOT NULL,
  website_url text NOT NULL,
  source_url text NOT NULL,
  city text,
  industry text,
  description text,
  fit_score integer NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  observed_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_page_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','contacted','replied','qualified','converted','rejected','do_not_contact')),
  outreach_note text,
  contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prospecting_leads_campaign_domain_key UNIQUE (campaign_id, domain)
);

-- Drop default on fit_score in case an older migration created it.
ALTER TABLE public.prospecting_leads ALTER COLUMN fit_score DROP DEFAULT;

GRANT ALL ON public.prospecting_leads TO service_role;
ALTER TABLE public.prospecting_leads ENABLE ROW LEVEL SECURITY;

-- === Indexes ================================================================

CREATE INDEX IF NOT EXISTS prospecting_leads_campaign_idx ON public.prospecting_leads(campaign_id);
CREATE INDEX IF NOT EXISTS prospecting_leads_status_idx ON public.prospecting_leads(status);
CREATE INDEX IF NOT EXISTS prospecting_leads_score_idx ON public.prospecting_leads(fit_score DESC);
CREATE INDEX IF NOT EXISTS prospecting_leads_domain_idx ON public.prospecting_leads(domain);
CREATE INDEX IF NOT EXISTS prospecting_campaigns_created_idx ON public.prospecting_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS prospecting_campaigns_admin_status_created_idx
  ON public.prospecting_campaigns (admin_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS prospecting_campaigns_admin_created_idx
  ON public.prospecting_campaigns (admin_id, created_at DESC);

-- === updated_at triggers ====================================================

CREATE OR REPLACE FUNCTION public.tg_prospecting_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prospecting_campaigns_updated_at ON public.prospecting_campaigns;
CREATE TRIGGER prospecting_campaigns_updated_at
BEFORE UPDATE ON public.prospecting_campaigns
FOR EACH ROW EXECUTE FUNCTION public.tg_prospecting_set_updated_at();

DROP TRIGGER IF EXISTS prospecting_leads_updated_at ON public.prospecting_leads;
CREATE TRIGGER prospecting_leads_updated_at
BEFORE UPDATE ON public.prospecting_leads
FOR EACH ROW EXECUTE FUNCTION public.tg_prospecting_set_updated_at();

-- === Persistent, race-safe rate limit =======================================
-- Counts prospecting_campaigns rows for the given admin_id created within the
-- window and returns true when count < max. Uses a per-admin transaction-scoped
-- advisory lock so concurrent callers serialize; the caller must issue the
-- follow-up INSERT immediately (same edge invocation) — the acceptable race
-- window is limited to that single request.

CREATE OR REPLACE FUNCTION public.try_prospecting_rate_limit(
  p_admin_id uuid,
  p_max integer DEFAULT 5,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_lock_key bigint;
BEGIN
  IF p_admin_id IS NULL THEN
    RAISE EXCEPTION 'admin_id required';
  END IF;
  v_lock_key := hashtextextended('prospecting_rl:' || p_admin_id::text, 0);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  SELECT count(*) INTO v_count
  FROM public.prospecting_campaigns
  WHERE admin_id = p_admin_id
    AND created_at > now() - make_interval(secs => p_window_seconds);

  RETURN v_count < p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) TO service_role;
