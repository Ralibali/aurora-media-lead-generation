CREATE TABLE public.ai_karta_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  button TEXT NOT NULL,
  session_id TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_ai_karta_clicks_created_at ON public.ai_karta_clicks(created_at DESC);
CREATE INDEX idx_ai_karta_clicks_session ON public.ai_karta_clicks(session_id);

ALTER TABLE public.ai_karta_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ai karta clicks"
ON public.ai_karta_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);