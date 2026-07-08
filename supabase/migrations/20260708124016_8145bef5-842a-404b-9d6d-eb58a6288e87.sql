ALTER TABLE public.ai_map_processes
  ADD COLUMN IF NOT EXISTS next_step text,
  ADD COLUMN IF NOT EXISTS saved_hours_per_week numeric;

ALTER TABLE public.ai_map_leads
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb;