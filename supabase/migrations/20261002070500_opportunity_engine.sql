-- Aurora Opportunity Engine: evidence-backed website audits for prospecting leads.
-- Server-only. Browser roles never access these rows directly.

create table if not exists public.prospecting_audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.prospecting_leads(id) on delete cascade,
  campaign_id uuid not null references public.prospecting_campaigns(id) on delete cascade,
  status text not null default 'completed' check (status in ('completed','failed')),
  opportunity_score integer not null default 0 check (opportunity_score between 0 and 100),
  http_status integer,
  page_title text,
  meta_description text,
  robots text,
  screenshot_url text,
  screenshot_expires_at timestamptz,
  audit_signals jsonb not null default '[]'::jsonb,
  opportunity_summary text,
  pitch_draft text,
  demo_brief jsonb not null default '[]'::jsonb,
  source_url text,
  error_message text,
  audited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prospecting_audits_campaign_score_idx
  on public.prospecting_audits(campaign_id, opportunity_score desc, audited_at desc);

alter table public.prospecting_audits enable row level security;
revoke all on public.prospecting_audits from anon, authenticated;
grant all on public.prospecting_audits to service_role;

comment on table public.prospecting_audits is
  'Evidence-backed Opportunity Engine audits. Pitch and demo brief are drafts; no outreach is sent automatically.';
