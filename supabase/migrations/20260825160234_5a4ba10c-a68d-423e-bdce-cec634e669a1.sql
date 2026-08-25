-- AI-KONTORET: commercial launch infrastructure (server-only tables)

create table if not exists public.ai_kontoret_purchases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  product text not null check (product in ('guide','vault','bundle')),
  amount integer not null check (amount > 0),
  currency text not null default 'sek',
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_event_id text,
  delivered_at timestamptz,
  last_delivery_at timestamptz,
  delivery_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.ai_kontoret_purchases is
  'AI-KONTORET: verified Stripe purchases (guide/vault/bundle). Server-only.';

create table if not exists public.ai_kontoret_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product text not null check (product in ('guide','vault')),
  version text not null,
  storage_path text not null,
  label text not null,
  file_bytes bigint,
  uploaded_at timestamptz,
  active boolean not null default true,
  unique (product, version)
);

comment on table public.ai_kontoret_assets is
  'AI-KONTORET: versioned product files stored in the PRIVATE ai-kontoret-assets bucket.';

create table if not exists public.ai_kontoret_launch (
  id boolean primary key default true check (id),
  legal_confirmed boolean not null default false,
  legal_confirmed_at timestamptz,
  legal_confirmed_by text,
  notes text,
  updated_at timestamptz not null default now()
);

comment on table public.ai_kontoret_launch is
  'AI-KONTORET: owner launch gate. legal_confirmed must be true before live sales.';

create table if not exists public.ai_kontoret_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now(),
  event_type text not null,
  handled boolean not null default false,
  note text
);

insert into public.ai_kontoret_launch (id) values (true) on conflict (id) do nothing;

insert into public.ai_kontoret_assets (product, version, storage_path, label) values
  ('guide', '1.0', 'ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf', 'AI-KONTORET – guiden (PDF), v1.0'),
  ('vault', '1.0', 'ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf', 'AI-KONTORET – Prompt Vault (PDF), v1.0')
on conflict (product, version) do nothing;

alter table public.ai_kontoret_purchases enable row level security;
alter table public.ai_kontoret_assets enable row level security;
alter table public.ai_kontoret_launch enable row level security;
alter table public.ai_kontoret_webhook_events enable row level security;

-- Server-only: no anon/authenticated grants, no policies (fail closed by design).
revoke all on public.ai_kontoret_purchases from anon, authenticated;
revoke all on public.ai_kontoret_assets from anon, authenticated;
revoke all on public.ai_kontoret_launch from anon, authenticated;
revoke all on public.ai_kontoret_webhook_events from anon, authenticated;

grant all on public.ai_kontoret_purchases to service_role;
grant all on public.ai_kontoret_assets to service_role;
grant all on public.ai_kontoret_launch to service_role;
grant all on public.ai_kontoret_webhook_events to service_role;

create index if not exists ai_kontoret_purchases_email_idx on public.ai_kontoret_purchases (lower(email));