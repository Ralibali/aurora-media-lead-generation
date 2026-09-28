create table public.guardian_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 160),
  url text not null unique check (length(url) <= 1000),
  expected_text text not null default '' check (length(expected_text) <= 300),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.guardian_checks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.guardian_sites(id) on delete cascade,
  slot timestamptz not null,
  status text not null check (status in ('running','healthy','degraded','down')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(site_id, slot)
);
create index guardian_checks_history on public.guardian_checks(site_id, created_at desc);
alter table public.guardian_sites enable row level security;
alter table public.guardian_checks enable row level security;
revoke all on public.guardian_sites, public.guardian_checks from anon, authenticated;
grant all on public.guardian_sites, public.guardian_checks to service_role;
-- Admin access is mediated by the existing Aurora Media admin secret protocol.
