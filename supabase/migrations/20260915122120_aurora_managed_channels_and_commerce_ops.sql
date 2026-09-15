-- Aurora managed services: a WACRM control layer and a staged Commerce Ops ledger.
-- Both modules are internal-only and are reached through admin-authenticated Edge
-- Functions using the service role. Provider credentials stay in Edge Function secrets.

create extension if not exists pgcrypto;

create table if not exists public.managed_channel_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null default 'wacrm' check (provider in ('wacrm')),
  base_url text not null check (base_url ~ '^https://'),
  credential_env_name text not null default 'WACRM_API_KEY'
    check (credential_env_name ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  status text not null default 'pending'
    check (status in ('pending','connected','error','disabled')),
  external_account_id text,
  external_account_name text,
  scopes text[] not null default '{}',
  active boolean not null default true,
  last_verified_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name, provider)
);

create table if not exists public.managed_channel_outbox (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.managed_channel_workspaces(id) on delete cascade,
  recipient_e164 text not null check (recipient_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  message_type text not null default 'text' check (message_type in ('text')),
  message_body text not null check (char_length(message_body) between 1 and 4096),
  status text not null default 'staged'
    check (status in ('staged','approved','sending','sent','failed','cancelled')),
  provider_message_id text,
  conversation_id text,
  approved_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists managed_channel_workspaces_status_idx
  on public.managed_channel_workspaces(status, active);
create index if not exists managed_channel_outbox_workspace_idx
  on public.managed_channel_outbox(workspace_id, created_at desc);
create index if not exists managed_channel_outbox_status_idx
  on public.managed_channel_outbox(status, created_at desc);

create table if not exists public.commerce_ops_stores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  platform text not null default 'manual'
    check (platform in ('manual','shopify','woocommerce','other')),
  shop_domain text,
  currency text not null default 'SEK' check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commerce_ops_snapshots (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.commerce_ops_stores(id) on delete cascade,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  sales numeric not null default 0 check (sales >= 0),
  orders integer not null default 0 check (orders >= 0),
  traffic integer check (traffic is null or traffic >= 0),
  conversion_rate numeric check (conversion_rate is null or conversion_rate between 0 and 1),
  average_order_value numeric check (average_order_value is null or average_order_value >= 0),
  sales_change_pct numeric,
  low_stock_count integer not null default 0 check (low_stock_count >= 0),
  slow_movers_count integer not null default 0 check (slow_movers_count >= 0),
  order_issues_count integer not null default 0 check (order_issues_count >= 0),
  source text not null default 'manual' check (source in ('manual','shopify','woocommerce','import')),
  note text check (note is null or char_length(note) <= 500),
  captured_at timestamptz not null default now(),
  unique(store_id, period_start, period_end, source)
);

create table if not exists public.commerce_ops_changes (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.commerce_ops_stores(id) on delete cascade,
  kind text not null check (kind in ('listing_update','price_update','inventory_action','promotion','campaign')),
  summary text not null check (char_length(summary) between 1 and 500),
  rationale text check (rationale is null or char_length(rationale) <= 2000),
  items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 10),
  status text not null default 'staged'
    check (status in ('staged','approved','applied','discarded','failed')),
  guardrail_notes text[] not null default '{}',
  source text not null default 'operator' check (source in ('operator','ai','import')),
  approved_at timestamptz,
  applied_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commerce_ops_snapshots_store_idx
  on public.commerce_ops_snapshots(store_id, period_end desc);
create index if not exists commerce_ops_changes_store_idx
  on public.commerce_ops_changes(store_id, status, created_at desc);

alter table public.managed_channel_workspaces enable row level security;
alter table public.managed_channel_outbox enable row level security;
alter table public.commerce_ops_stores enable row level security;
alter table public.commerce_ops_snapshots enable row level security;
alter table public.commerce_ops_changes enable row level security;

revoke all on public.managed_channel_workspaces from anon, authenticated;
revoke all on public.managed_channel_outbox from anon, authenticated;
revoke all on public.commerce_ops_stores from anon, authenticated;
revoke all on public.commerce_ops_snapshots from anon, authenticated;
revoke all on public.commerce_ops_changes from anon, authenticated;

grant all on public.managed_channel_workspaces to service_role;
grant all on public.managed_channel_outbox to service_role;
grant all on public.commerce_ops_stores to service_role;
grant all on public.commerce_ops_snapshots to service_role;
grant all on public.commerce_ops_changes to service_role;
