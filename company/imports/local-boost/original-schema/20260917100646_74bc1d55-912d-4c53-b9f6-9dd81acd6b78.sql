
-- Koordinater för geo-grid-center
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lng double precision;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

DO $$ BEGIN
  CREATE TYPE public.geo_scan_status AS ENUM ('queued','running','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.scan_cadence AS ENUM ('weekly','monthly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.geo_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  keyword_id uuid REFERENCES public.keywords(id) ON DELETE SET NULL,
  keyword_phrase text NOT NULL,
  grid_size smallint NOT NULL CHECK (grid_size IN (5,7,9,13)),
  radius_km numeric(6,2) NOT NULL CHECK (radius_km > 0 AND radius_km <= 100),
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  provider_key text NOT NULL DEFAULT 'dataforseo',
  provider_mode public.provider_mode NOT NULL DEFAULT 'not_configured',
  status public.geo_scan_status NOT NULL DEFAULT 'queued',
  is_demo boolean NOT NULL DEFAULT false,
  cost_estimate_sek numeric(10,4),
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.geo_scan_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.geo_scans(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  row_idx smallint NOT NULL,
  col_idx smallint NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  rank smallint,
  found boolean NOT NULL DEFAULT false,
  top_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scan_id, row_idx, col_idx)
);

CREATE TABLE IF NOT EXISTS public.tracked_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  place_id text,
  domain text,
  is_active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.geo_scan_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  keyword_id uuid REFERENCES public.keywords(id) ON DELETE CASCADE,
  keyword_phrase text NOT NULL,
  cadence public.scan_cadence NOT NULL DEFAULT 'monthly',
  grid_size smallint NOT NULL DEFAULT 7 CHECK (grid_size IN (5,7,9,13)),
  radius_km numeric(6,2) NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS geo_scans_location_idx ON public.geo_scans(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS geo_scan_points_scan_idx ON public.geo_scan_points(scan_id);
CREATE INDEX IF NOT EXISTS tracked_competitors_location_idx ON public.tracked_competitors(location_id);
CREATE INDEX IF NOT EXISTS geo_scan_schedules_location_idx ON public.geo_scan_schedules(location_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.geo_scans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geo_scan_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracked_competitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geo_scan_schedules TO authenticated;
GRANT ALL ON public.geo_scans TO service_role;
GRANT ALL ON public.geo_scan_points TO service_role;
GRANT ALL ON public.tracked_competitors TO service_role;
GRANT ALL ON public.geo_scan_schedules TO service_role;

ALTER TABLE public.geo_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_scan_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_scan_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "geo_scans read" ON public.geo_scans;
CREATE POLICY "geo_scans read" ON public.geo_scans FOR SELECT TO authenticated
  USING (public.can_read_org(public.location_org(location_id)));
DROP POLICY IF EXISTS "geo_scans staff write" ON public.geo_scans;
CREATE POLICY "geo_scans staff write" ON public.geo_scans FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "geo_scan_points read" ON public.geo_scan_points;
CREATE POLICY "geo_scan_points read" ON public.geo_scan_points FOR SELECT TO authenticated
  USING (public.can_read_org(public.location_org(location_id)));
DROP POLICY IF EXISTS "geo_scan_points staff write" ON public.geo_scan_points;
CREATE POLICY "geo_scan_points staff write" ON public.geo_scan_points FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "tracked_competitors read" ON public.tracked_competitors;
CREATE POLICY "tracked_competitors read" ON public.tracked_competitors FOR SELECT TO authenticated
  USING (public.can_read_org(public.location_org(location_id)));
DROP POLICY IF EXISTS "tracked_competitors staff write" ON public.tracked_competitors;
CREATE POLICY "tracked_competitors staff write" ON public.tracked_competitors FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "geo_scan_schedules read" ON public.geo_scan_schedules;
CREATE POLICY "geo_scan_schedules read" ON public.geo_scan_schedules FOR SELECT TO authenticated
  USING (public.can_read_org(public.location_org(location_id)));
DROP POLICY IF EXISTS "geo_scan_schedules staff write" ON public.geo_scan_schedules;
CREATE POLICY "geo_scan_schedules staff write" ON public.geo_scan_schedules FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP TRIGGER IF EXISTS update_geo_scans_updated_at ON public.geo_scans;
CREATE TRIGGER update_geo_scans_updated_at BEFORE UPDATE ON public.geo_scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_tracked_competitors_updated_at ON public.tracked_competitors;
CREATE TRIGGER update_tracked_competitors_updated_at BEFORE UPDATE ON public.tracked_competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_geo_scan_schedules_updated_at ON public.geo_scan_schedules;
CREATE TRIGGER update_geo_scan_schedules_updated_at BEFORE UPDATE ON public.geo_scan_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
