-- Aurora Inbox commercial layer.
-- Productizes managed WACRM workspaces without exposing provider credentials to clients.

alter table public.managed_channel_workspaces
  add column if not exists customer_name text,
  add column if not exists plan text not null default 'starter',
  add column if not exists monthly_price_sek integer not null default 695,
  add column if not exists included_seats integer not null default 1,
  add column if not exists subscription_status text not null default 'trialing',
  add column if not exists trial_ends_at timestamptz,
  add column if not exists onboarding_status text not null default 'draft',
  add column if not exists commercial_notes text;

do $$ begin
  alter table public.managed_channel_workspaces
    add constraint managed_channel_workspaces_plan_check
    check (plan in ('starter','team','agency'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.managed_channel_workspaces
    add constraint managed_channel_workspaces_monthly_price_check
    check (monthly_price_sek >= 0 and monthly_price_sek <= 100000);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.managed_channel_workspaces
    add constraint managed_channel_workspaces_seats_check
    check (included_seats between 1 and 100);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.managed_channel_workspaces
    add constraint managed_channel_workspaces_subscription_status_check
    check (subscription_status in ('trialing','active','past_due','paused','canceled'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.managed_channel_workspaces
    add constraint managed_channel_workspaces_onboarding_status_check
    check (onboarding_status in ('draft','configuring','ready','live','paused'));
exception when duplicate_object then null; end $$;

create table if not exists public.managed_channel_pipeline (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.managed_channel_workspaces(id) on delete cascade,
  provider_conversation_id text not null,
  contact_name text,
  phone text,
  company text,
  last_message text,
  stage text not null default 'new'
    check (stage in ('new','qualified','followup','meeting','customer','lost')),
  owner_name text,
  followup_at timestamptz,
  last_provider_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, provider_conversation_id)
);

create index if not exists managed_channel_pipeline_workspace_stage_idx
  on public.managed_channel_pipeline(workspace_id, stage, updated_at desc);
create index if not exists managed_channel_pipeline_followup_idx
  on public.managed_channel_pipeline(followup_at)
  where followup_at is not null and stage not in ('customer','lost');

alter table public.managed_channel_pipeline enable row level security;
revoke all on public.managed_channel_pipeline from anon, authenticated;
grant all on public.managed_channel_pipeline to service_role;

comment on table public.managed_channel_pipeline is
  'Internal commercial pipeline for conversations synced from managed WhatsApp workspaces.';
comment on column public.managed_channel_workspaces.monthly_price_sek is
  'Commercial tracking only; Stripe remains the source of truth when billing is connected.';
