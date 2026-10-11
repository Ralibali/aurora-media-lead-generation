-- Aurora PriceWatch: internal agency pilot, one monitored URL per store target.
-- The provider performs automated checks; Aurora stores identifiers and state only.
create table if not exists public.commerce_ops_price_watches (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.commerce_ops_stores(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  target_url text not null check (char_length(target_url) between 12 and 1000),
  provider_watch_id uuid not null unique,
  created_at timestamptz not null default now(),
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  last_error text,
  unique (store_id, target_url)
);
create index if not exists commerce_ops_price_watches_store_idx on public.commerce_ops_price_watches(store_id);
alter table public.commerce_ops_price_watches enable row level security;
-- The existing Commerce Ops Edge Function is protected by its own secret-based
-- admin authorization. Only service_role can access this internal table.
revoke all on public.commerce_ops_price_watches from public, anon, authenticated;
grant select, insert, update, delete on public.commerce_ops_price_watches to service_role;
