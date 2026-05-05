CREATE TABLE public.ai_map_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  pain_areas TEXT[] NOT NULL DEFAULT '{}',
  consent BOOLEAN NOT NULL DEFAULT false,
  total_score NUMERIC NOT NULL DEFAULT 0,
  total_potential TEXT NOT NULL DEFAULT 'Låg',
  user_agent TEXT,
  ip TEXT
);

CREATE TABLE public.ai_map_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES public.ai_map_leads(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  process_name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  weekly_time TEXT NOT NULL,
  systems TEXT,
  rule_based TEXT NOT NULL,
  data_available TEXT NOT NULL,
  business_value TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  potential TEXT NOT NULL,
  recommended_solution TEXT NOT NULL
);

CREATE INDEX idx_ai_map_leads_created_at ON public.ai_map_leads(created_at DESC);
CREATE INDEX idx_ai_map_processes_lead ON public.ai_map_processes(lead_id);

ALTER TABLE public.ai_map_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_map_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit ai_map_leads"
ON public.ai_map_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can submit ai_map_processes"
ON public.ai_map_processes FOR INSERT TO anon, authenticated WITH CHECK (true);