
create table if not exists public.ai_map_email_sequence (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.ai_map_leads(id) on delete cascade,
  email text not null,
  unsubscribe_token text not null unique default encode(gen_random_bytes(24), 'base64'),
  unsubscribed_at timestamptz,
  unsubscribed_reason text,
  step_2_sent_at timestamptz,
  step_5_sent_at timestamptz,
  step_9_sent_at timestamptz,
  step_14_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_map_email_sequence_lead on public.ai_map_email_sequence(lead_id);
create index if not exists idx_ai_map_email_sequence_email on public.ai_map_email_sequence(email);
create index if not exists idx_ai_map_email_sequence_active on public.ai_map_email_sequence(unsubscribed_at) where unsubscribed_at is null;

alter table public.ai_map_email_sequence enable row level security;

create policy "service role only - no public access"
on public.ai_map_email_sequence
for all
to anon, authenticated
using (false)
with check (false);
