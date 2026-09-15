-- Aurora Media commercial delivery layers: client approvals + persistent rank tracking.
-- Access is service-role only through authenticated Edge Functions. No anon/authenticated
-- RLS policies are intentionally created for these internal agency tables.

create extension if not exists pgcrypto;

create table if not exists public.content_approval_items (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text,
  title text not null,
  channel text not null default 'social',
  body text not null,
  media_url text,
  status text not null default 'awaiting_approval'
    check (status in ('draft','awaiting_approval','changes_requested','approved','cancelled')),
  approval_token_hash text unique,
  expires_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_approval_comments (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.content_approval_items(id) on delete cascade,
  author_name text not null default 'Kund',
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists content_approval_items_status_idx
  on public.content_approval_items(status, created_at desc);
create index if not exists content_approval_comments_item_idx
  on public.content_approval_comments(approval_id, created_at);

alter table public.content_approval_items enable row level security;
alter table public.content_approval_comments enable row level security;

create table if not exists public.seo_rank_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_url text not null unique,
  domain text not null,
  location_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_rank_keywords (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.seo_rank_projects(id) on delete cascade,
  keyword text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(project_id, keyword)
);

create table if not exists public.seo_rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references public.seo_rank_keywords(id) on delete cascade,
  checked_on date not null,
  position numeric,
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  source text not null default 'gsc',
  created_at timestamptz not null default now(),
  unique(keyword_id, checked_on, source)
);

create index if not exists seo_rank_keywords_project_idx
  on public.seo_rank_keywords(project_id, active);
create index if not exists seo_rank_snapshots_keyword_idx
  on public.seo_rank_snapshots(keyword_id, checked_on desc);

alter table public.seo_rank_projects enable row level security;
alter table public.seo_rank_keywords enable row level security;
alter table public.seo_rank_snapshots enable row level security;

-- Seed Aurora Media itself without overwriting future edits.
insert into public.seo_rank_projects (name, site_url, domain, location_name)
values ('Aurora Media', 'https://auroramedia.se/', 'auroramedia.se', 'Sverige')
on conflict (site_url) do nothing;
