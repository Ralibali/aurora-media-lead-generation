-- Aurora Sight / AI Visibility: internal commercial monitoring layer.
-- Provider-agnostic by design: observations may come from Elmo, another engine or verified manual checks.

create table if not exists public.ai_visibility_projects (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 160),
  brand_name text not null check (char_length(brand_name) between 2 and 160),
  domain text not null check (domain ~ '^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  locale text not null default 'sv-SE',
  plan text not null default 'monitor' check (plan in ('scan','monitor','managed')),
  monthly_price_sek integer not null default 499 check (monthly_price_sek between 0 and 100000),
  status text not null default 'onboarding' check (status in ('onboarding','active','paused','churned')),
  competitor_domains text[] not null default '{}',
  notes text,
  active boolean not null default true,
  last_measured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(domain)
);

create table if not exists public.ai_visibility_prompts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ai_visibility_projects(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 5 and 1000),
  category text not null default 'commercial'
    check (category in ('commercial','comparison','local','brand','problem','informational')),
  weight integer not null default 1 check (weight between 1 and 5),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(project_id, prompt)
);

create table if not exists public.ai_visibility_observations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ai_visibility_projects(id) on delete cascade,
  prompt_id uuid not null references public.ai_visibility_prompts(id) on delete cascade,
  engine text not null check (engine in ('chatgpt','perplexity','google_ai','copilot','other')),
  observed_at timestamptz not null default now(),
  brand_mentioned boolean not null default false,
  position integer check (position is null or position between 1 and 50),
  cited_urls text[] not null default '{}',
  competitor_mentions text[] not null default '{}',
  answer_excerpt text check (answer_excerpt is null or char_length(answer_excerpt) <= 4000),
  source text not null default 'manual' check (source in ('manual','import','provider')),
  provider_run_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_visibility_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ai_visibility_projects(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 240),
  rationale text check (rationale is null or char_length(rationale) <= 3000),
  kind text not null default 'content'
    check (kind in ('content','technical','schema','source','local','measurement')),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  status text not null default 'proposed' check (status in ('proposed','approved','in_progress','done','rejected')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_visibility_prompts_project_idx
  on public.ai_visibility_prompts(project_id, active, created_at);
create index if not exists ai_visibility_observations_project_time_idx
  on public.ai_visibility_observations(project_id, observed_at desc);
create index if not exists ai_visibility_observations_prompt_engine_idx
  on public.ai_visibility_observations(prompt_id, engine, observed_at desc);
create index if not exists ai_visibility_actions_project_status_idx
  on public.ai_visibility_actions(project_id, status, priority, created_at desc);

alter table public.ai_visibility_projects enable row level security;
alter table public.ai_visibility_prompts enable row level security;
alter table public.ai_visibility_observations enable row level security;
alter table public.ai_visibility_actions enable row level security;

revoke all on public.ai_visibility_projects from anon, authenticated;
revoke all on public.ai_visibility_prompts from anon, authenticated;
revoke all on public.ai_visibility_observations from anon, authenticated;
revoke all on public.ai_visibility_actions from anon, authenticated;

grant all on public.ai_visibility_projects to service_role;
grant all on public.ai_visibility_prompts to service_role;
grant all on public.ai_visibility_observations to service_role;
grant all on public.ai_visibility_actions to service_role;

comment on table public.ai_visibility_observations is
  'Verified AI-answer observations. Aurora must not infer or fabricate measurements that were not actually observed.';
