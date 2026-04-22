-- Text library for Aurora Media's Gemini text generator
CREATE TABLE public.text_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  target_keyword TEXT,
  context TEXT,
  generated_content JSONB NOT NULL,
  word_count INT,
  character_count INT,
  regeneration_count INT NOT NULL DEFAULT 0,
  blocked_phrases_found TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  used_on_page TEXT,
  quality_rating INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT text_library_status_check CHECK (status IN ('draft','published','archived')),
  CONSTRAINT text_library_rating_check CHECK (quality_rating IS NULL OR (quality_rating BETWEEN 1 AND 5))
);

-- Enable RLS – we lock the table down entirely; all access is via edge function with service role
ALTER TABLE public.text_library ENABLE ROW LEVEL SECURITY;

-- No public policies = no public access. Service role bypasses RLS.

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_text_library_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER text_library_set_updated_at
BEFORE UPDATE ON public.text_library
FOR EACH ROW
EXECUTE FUNCTION public.tg_text_library_set_updated_at();

-- Index for filtering/sorting in admin UI
CREATE INDEX idx_text_library_type_created ON public.text_library(text_type, created_at DESC);
CREATE INDEX idx_text_library_status ON public.text_library(status);