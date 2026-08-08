CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

INSERT INTO public.email_templates (key, subject, body_html, body_text)
VALUES (
  'ai_map_pdf',
  'Er AI-karta – {{company}}',
  '<p>Här är er AI-karta för <strong>{{company}}</strong> – bifogad som PDF. Den visar vad era processer kostar idag, vilken som bör automatiseras först och vad ett första bygge kostar med återbetalningstid.</p><p>Kartan finns också kvar online om du vill se den igen eller dela den med kollegor.</p>',
  'Här är er AI-karta för {{company}} – bifogad som PDF. Den visar vad era processer kostar idag, vilken som bör automatiseras först och vad ett första bygge kostar med återbetalningstid.'
) ON CONFLICT (key) DO NOTHING;