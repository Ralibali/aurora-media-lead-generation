-- Aurora Opportunity Hunter buildout:
-- shared OpenConnector integration layer, internal AI coworkers and a grounded
-- commerce-agent catalog. All tables remain internal-only behind admin Edge Functions.

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 120),
  service text not null check (service ~ '^[a-z0-9][a-z0-9_-]{1,79}$'),
  connection_alias text not null default 'default'
    check (connection_alias ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  allowed_actions text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending','connected','error','disabled')),
  account_label text,
  last_verified_at timestamptz,
  last_error text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_runs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.integration_connections(id) on delete cascade,
  action_id text not null check (action_id ~ '^[a-z0-9_-]+\.[A-Za-z0-9_.-]+$'),
  input jsonb not null default '{}'::jsonb check (jsonb_typeof(input) = 'object'),
  status text not null default 'staged'
    check (status in ('staged','approved','running','succeeded','failed','cancelled')),
  idempotency_key uuid not null default gen_random_uuid() unique,
  output_summary jsonb,
  execution_id text,
  approved_at timestamptz,
  executed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integration_runs_status_idx
  on public.integration_runs(status, created_at desc);
create index if not exists integration_runs_connection_idx
  on public.integration_runs(connection_id, created_at desc);

create table if not exists public.coworker_profiles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_-]{1,79}$'),
  name text not null,
  description text not null,
  system_role text not null,
  allowed_action_prefixes text[] not null default '{}',
  approval_mode text not null default 'always'
    check (approval_mode in ('always','read_only_auto')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coworker_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.coworker_profiles(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 180),
  goal text not null check (char_length(goal) between 5 and 4000),
  status text not null default 'queued'
    check (status in ('queued','prepared','approved','executing','done','failed','cancelled')),
  requires_approval boolean not null default true,
  plan jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  last_error text,
  approved_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coworker_tasks_profile_idx
  on public.coworker_tasks(profile_id, created_at desc);
create index if not exists coworker_tasks_status_idx
  on public.coworker_tasks(status, created_at desc);

insert into public.coworker_profiles (key, name, description, system_role, allowed_action_prefixes, approval_mode)
values
  ('lead-worker','Lead Worker','Kvalificerar och sammanfattar inkommande affärsmöjligheter.','Arbeta bara med lead-, CRM- och uppföljningsuppgifter. Skriv aldrig till externa system utan ett godkänt integrationsjobb.',array['hubspot.','pipedrive.','gmail.','google_calendar.'],'always'),
  ('marketing-worker','Marketing Worker','Förbereder research, innehåll och kampanjuppföljning.','Förbered analyser och utkast. Extern publicering eller annonseringsändring kräver alltid separat godkännande.',array['google_search_console.','google_analytics.','mailchimp.','klaviyo.'],'always'),
  ('commerce-worker','Commerce Worker','Analyserar butik, katalog och konvertering och föreslår verifierbara åtgärder.','Använd bara verifierad butik/katalogdata. Hitta aldrig på pris, lager, produkt eller effekt. Alla ändringar kräver mänskligt godkännande.',array['shopify.','woocommerce.'],'always'),
  ('ops-worker','Operations Worker','Sammanställer driftstatus och förbereder säkra rutinåtgärder.','Prioritera read-only. Skrivande actions måste alltid godkännas.',array['github.','slack.','notion.'],'always')
on conflict (key) do nothing;

create table if not exists public.commerce_ops_catalog (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.commerce_ops_stores(id) on delete cascade,
  external_id text not null,
  title text not null,
  description text,
  product_url text,
  price numeric check (price is null or price >= 0),
  inventory integer check (inventory is null or inventory >= 0),
  category text,
  active boolean not null default true,
  source text not null default 'manual' check (source in ('manual','shopify','woocommerce','import')),
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(store_id, external_id)
);

create table if not exists public.commerce_agent_sessions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.commerce_ops_stores(id) on delete cascade,
  question text not null check (char_length(question) between 2 and 1200),
  answer text,
  recommended_product_ids uuid[] not null default '{}',
  status text not null default 'completed' check (status in ('completed','failed')),
  model text,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists commerce_ops_catalog_store_idx
  on public.commerce_ops_catalog(store_id, active, updated_at desc);
create index if not exists commerce_agent_sessions_store_idx
  on public.commerce_agent_sessions(store_id, created_at desc);

alter table public.integration_connections enable row level security;
alter table public.integration_runs enable row level security;
alter table public.coworker_profiles enable row level security;
alter table public.coworker_tasks enable row level security;
alter table public.commerce_ops_catalog enable row level security;
alter table public.commerce_agent_sessions enable row level security;

revoke all on public.integration_connections from anon, authenticated;
revoke all on public.integration_runs from anon, authenticated;
revoke all on public.coworker_profiles from anon, authenticated;
revoke all on public.coworker_tasks from anon, authenticated;
revoke all on public.commerce_ops_catalog from anon, authenticated;
revoke all on public.commerce_agent_sessions from anon, authenticated;

grant all on public.integration_connections to service_role;
grant all on public.integration_runs to service_role;
grant all on public.coworker_profiles to service_role;
grant all on public.coworker_tasks to service_role;
grant all on public.commerce_ops_catalog to service_role;
grant all on public.commerce_agent_sessions to service_role;
