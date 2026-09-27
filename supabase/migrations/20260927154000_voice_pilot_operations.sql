-- Aurora Voice: internal pilot operations and commercial runtime layer.
-- Public intake never provisions telephony. Provisioning is a separate approved admin action.

create table if not exists public.voice_pilots (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 160),
  vertical text not null check (vertical in ('traffic_school','stay','transport','service','other')),
  use_case text not null check (char_length(use_case) between 5 and 2000),
  status text not null default 'intake'
    check (status in ('intake','design','approved','provisioning','live','evaluating','paused','completed','rejected')),
  setup_price_sek integer not null default 14900 check (setup_price_sek between 0 and 500000),
  monthly_price_sek integer not null default 1995 check (monthly_price_sek between 0 and 100000),
  runtime_provider text not null default 'pipecat'
    check (runtime_provider in ('pipecat','aurora_connect','other')),
  integration_target text,
  opening_hours text,
  handoff_number text,
  disclosure_text text not null default 'Hej! Du har kommit till vår digitala assistent.',
  retention_days integer not null default 30 check (retention_days between 1 and 365),
  external_pilot_id text,
  provisioned_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_pilot_calls (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.voice_pilots(id) on delete cascade,
  external_call_id text,
  occurred_at timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  outcome text not null
    check (outcome in ('faq_resolved','lead_captured','booking_request','handoff','abandoned','failed','other')),
  automated boolean not null default false,
  handoff_reason text,
  summary text check (summary is null or char_length(summary) <= 3000),
  cost_ore integer check (cost_ore is null or cost_ore >= 0),
  created_at timestamptz not null default now(),
  unique(pilot_id, external_call_id)
);

create index if not exists voice_pilot_calls_pilot_time_idx
  on public.voice_pilot_calls(pilot_id, occurred_at desc);
create index if not exists voice_pilots_status_idx
  on public.voice_pilots(status, vertical, updated_at desc);

alter table public.voice_pilots enable row level security;
alter table public.voice_pilot_calls enable row level security;

revoke all on public.voice_pilots from anon, authenticated;
revoke all on public.voice_pilot_calls from anon, authenticated;

grant all on public.voice_pilots to service_role;
grant all on public.voice_pilot_calls to service_role;

comment on table public.voice_pilot_calls is
  'Operational pilot metrics. Avoid storing full transcripts or unnecessary personal data here.';
