CREATE TABLE public.ai_kontoret_asset_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  product text NOT NULL CHECK (product IN ('guide','vault')),
  revision integer NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  archive_path text NOT NULL,
  original_filename text,
  file_bytes bigint,
  note text,
  uploaded_by text,
  is_current boolean NOT NULL DEFAULT false,
  restored_at timestamptz,
  UNIQUE (product, revision)
);

GRANT ALL ON public.ai_kontoret_asset_revisions TO service_role;

ALTER TABLE public.ai_kontoret_asset_revisions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER ai_kontoret_asset_revisions_updated_at
BEFORE UPDATE ON public.ai_kontoret_asset_revisions
FOR EACH ROW EXECUTE FUNCTION public.tg_text_library_set_updated_at();