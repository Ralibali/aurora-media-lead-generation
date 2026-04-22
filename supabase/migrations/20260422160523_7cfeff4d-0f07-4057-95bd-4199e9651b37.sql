-- Tabell för FAQ-sökhändelser
CREATE TABLE public.faq_search_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  opened_question TEXT,
  page_path TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index för analyser
CREATE INDEX idx_faq_search_events_query ON public.faq_search_events (query);
CREATE INDEX idx_faq_search_events_created_at ON public.faq_search_events (created_at DESC);
CREATE INDEX idx_faq_search_events_page_path ON public.faq_search_events (page_path);
CREATE INDEX idx_faq_search_events_session_id ON public.faq_search_events (session_id);

-- RLS
ALTER TABLE public.faq_search_events ENABLE ROW LEVEL SECURITY;

-- Vem som helst kan logga events (annars funkar inte tracking)
CREATE POLICY "Anyone can insert faq search events"
ON public.faq_search_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ingen offentlig läsning/ändring/radering — endast service role (admin via Cloud) kan se datan
-- (Service role bypassar RLS automatiskt, så inga SELECT/UPDATE/DELETE-policies behövs)