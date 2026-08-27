-- AI-KONTORET: withdrawal requests + purchase payment/delivery status

alter table public.ai_kontoret_purchases
  add column if not exists payment_status text not null default 'pending',
  add column if not exists delivery_status text not null default 'pending';

alter table public.ai_kontoret_purchases
  drop constraint if exists ai_kontoret_purchases_payment_status_check;
alter table public.ai_kontoret_purchases
  add constraint ai_kontoret_purchases_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed'));

alter table public.ai_kontoret_purchases
  drop constraint if exists ai_kontoret_purchases_delivery_status_check;
alter table public.ai_kontoret_purchases
  add constraint ai_kontoret_purchases_delivery_status_check
  check (delivery_status in ('pending', 'failed', 'delivered'));

create table if not exists public.ai_kontoret_withdrawals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  name text not null,
  email text not null,
  session_id text,
  product text,
  description text,
  status text not null default 'received'
    check (status in ('received', 'reviewing', 'accepted', 'rejected', 'refunded')),
  receipt_emailed boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.ai_kontoret_withdrawals is
  'AI-KONTORET: consumer withdrawal requests (DAL 2 kap. 10 a). Receipt of request only — no automatic legal decision.';

alter table public.ai_kontoret_withdrawals enable row level security;
revoke all on public.ai_kontoret_withdrawals from anon, authenticated;
grant all on public.ai_kontoret_withdrawals to service_role;

create index if not exists ai_kontoret_withdrawals_email_idx
  on public.ai_kontoret_withdrawals (lower(email));
create index if not exists ai_kontoret_withdrawals_session_idx
  on public.ai_kontoret_withdrawals (session_id);
