-- Aurora Accessibility Care: commercial monitoring and remediation layer.
-- The GitHub Accessibility Guard remains the technical scanner/issue source.

create table if not exists public.accessibility_accounts (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 160),
  site_name text not null check (char_length(site_name) between 2 and 160),
  base_url text not null check (base_url ~ '^https://'),
  plan text not null default 'monitor' check (plan in ('audit','monitor','monitor_plus')),
  monthly_price_sek integer not null default 495 check (monthly_price_sek between 0 and 100000),
  scan_frequency text not null default 'weekly' check (scan_frequency in ('manual','weekly','daily')),
  status text not null default 'onboarding' check (status in ('onboarding','active','paused','churned')),
  onboarding_status text not null default 'scope' check (onboarding_status in ('scope','configured','baseline','live')),
  manual_review_due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(base_url)
);

create table if not exists public.accessibility_scan_runs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accessibility_accounts(id) on delete cascade,
  source text not null default 'guard' check (source in ('guard','manual','import')),
  external_run_id text,
  generated_at timestamptz not null default now(),
  pages_scanned integer not null default 0 check (pages_scanned >= 0),
  critical_count integer not null default 0 check (critical_count >= 0),
  serious_count integer not null default 0 check (serious_count >= 0),
  moderate_count integer not null default 0 check (moderate_count >= 0),
  minor_count integer not null default 0 check (minor_count >= 0),
  scan_errors integer not null default 0 check (scan_errors >= 0),
  report_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.accessibility_remediation_tasks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accessibility_accounts(id) on delete cascade,
  finding_key text not null,
  title text not null check (char_length(title) between 3 and 300),
  severity text not null check (severity in ('critical','serious','moderate','minor','manual')),
  status text not null default 'open' check (status in ('open','triaged','in_progress','verify','done','wont_fix')),
  issue_url text,
  owner_name text,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 10000),
  notes text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_id, finding_key)
);

create index if not exists accessibility_scans_account_time_idx
  on public.accessibility_scan_runs(account_id, generated_at desc);
create index if not exists accessibility_tasks_account_status_idx
  on public.accessibility_remediation_tasks(account_id, status, severity, updated_at desc);

alter table public.accessibility_accounts enable row level security;
alter table public.accessibility_scan_runs enable row level security;
alter table public.accessibility_remediation_tasks enable row level security;

revoke all on public.accessibility_accounts from anon, authenticated;
revoke all on public.accessibility_scan_runs from anon, authenticated;
revoke all on public.accessibility_remediation_tasks from anon, authenticated;

grant all on public.accessibility_accounts to service_role;
grant all on public.accessibility_scan_runs to service_role;
grant all on public.accessibility_remediation_tasks to service_role;

comment on table public.accessibility_scan_runs is
  'Technical scan history only. Automated results never constitute a legal compliance determination.';
