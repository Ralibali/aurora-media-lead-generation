
ALTER TABLE public.ai_map_leads
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ny',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS followup_at date;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS followup_at date;

UPDATE public.leads
SET status = CASE
  WHEN status = 'new' THEN 'ny'
  WHEN status = 'read' THEN 'kontaktad'
  WHEN status = 'archived' THEN 'förlorad'
  ELSE status
END
WHERE status IN ('new','read','archived');

ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'ny';

CREATE TABLE IF NOT EXISTS public.genomlysning_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text,
  status text NOT NULL DEFAULT 'ny',
  notes text,
  followup_at date
);

GRANT ALL ON public.genomlysning_leads TO service_role;
ALTER TABLE public.genomlysning_leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_genomlysning_leads_created_at
  ON public.genomlysning_leads (created_at DESC);
