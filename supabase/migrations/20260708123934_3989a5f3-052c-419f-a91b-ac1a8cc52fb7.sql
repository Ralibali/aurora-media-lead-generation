ALTER TABLE public.ai_map_leads
  ADD COLUMN IF NOT EXISTS share_token text;

UPDATE public.ai_map_leads
SET share_token = encode(gen_random_bytes(16), 'hex')
WHERE share_token IS NULL;

ALTER TABLE public.ai_map_leads
  ALTER COLUMN share_token SET DEFAULT encode(gen_random_bytes(16), 'hex'),
  ALTER COLUMN share_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ai_map_leads_share_token_key
  ON public.ai_map_leads(share_token);