-- Separate requested AI-map delivery from optional marketing email follow-up.
-- Existing leads have no evidence of a separate opt-in and remain false.
ALTER TABLE public.ai_map_leads
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;

COMMENT ON COLUMN public.ai_map_leads.marketing_consent IS
  'Explicit optional consent to AI/automation tips and offers by email, separate from requested AI-map delivery. Existing leads default to false.';
COMMENT ON COLUMN public.ai_map_leads.marketing_consent_at IS
  'Server-recorded time of the optional email marketing choice; null without an affirmative choice.';

ALTER TABLE public.ai_map_leads
  ADD CONSTRAINT ai_map_marketing_consent_has_timestamp
  CHECK ((marketing_consent AND marketing_consent_at IS NOT NULL)
    OR (NOT marketing_consent AND marketing_consent_at IS NULL));
