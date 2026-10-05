-- ===== org roles =====
alter table public.org_members add column if not exists role public.org_role not null default 'admin';
update public.org_members set role = 'owner' where is_owner = true and role <> 'owner';

create or replace function public.org_role_of(_user_id uuid, _org_id uuid)
returns public.org_role language sql stable security definer set search_path = public as $$
  select role from public.org_members where user_id = _user_id and org_id = _org_id limit 1
$$;

create or replace function public.can_manage_org(_user_id uuid, _org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_aurora_staff(_user_id)
     or public.org_role_of(_user_id, _org_id) in ('owner','admin')
$$;

revoke execute on function public.org_role_of(uuid, uuid) from public, anon;
revoke execute on function public.can_manage_org(uuid, uuid) from public, anon;
grant execute on function public.org_role_of(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_manage_org(uuid, uuid) to authenticated, service_role;

-- ===== organization / guardrail additions =====
alter table public.organizations add column if not exists website_url text;
alter table public.cost_guardrails add column if not exists hard_cap_sek numeric(12,2);
alter table public.cost_guardrails add column if not exists included_minutes integer not null default 0;

-- ===== leads: follow-up flow =====
alter table public.leads add column if not exists follow_up_required boolean not null default false;
alter table public.leads add column if not exists sla_due_at timestamptz;
alter table public.leads add column if not exists delivered_at timestamptz;

-- ===== knowledge suggestions (must be approved before use) =====
create table if not exists public.knowledge_suggestions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  question text not null,
  answer text not null,
  source_url text,
  status public.suggestion_status not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.knowledge_suggestions to authenticated;
grant all on public.knowledge_suggestions to service_role;
alter table public.knowledge_suggestions enable row level security;
drop policy if exists "suggestions readable by org" on public.knowledge_suggestions;
create policy "suggestions readable by org" on public.knowledge_suggestions
  for select to authenticated using (public.can_read_org(auth.uid(), org_id));
drop policy if exists "suggestions managed by org managers" on public.knowledge_suggestions;
create policy "suggestions managed by org managers" on public.knowledge_suggestions
  for all to authenticated
  using (public.can_manage_org(auth.uid(), org_id))
  with check (public.can_manage_org(auth.uid(), org_id));

-- ===== lead delivery targets (secret never exposed to client) =====
create table if not exists public.lead_delivery_targets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('email','webhook','crm_webhook')),
  target text not null,
  secret text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select (id, org_id, kind, target, is_active, created_at) on public.lead_delivery_targets to authenticated;
grant all on public.lead_delivery_targets to service_role;
alter table public.lead_delivery_targets enable row level security;
drop policy if exists "delivery targets readable by managers" on public.lead_delivery_targets;
create policy "delivery targets readable by managers" on public.lead_delivery_targets
  for select to authenticated using (public.can_manage_org(auth.uid(), org_id));

create table if not exists public.lead_deliveries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  target_id uuid references public.lead_delivery_targets(id) on delete set null,
  kind text not null,
  status public.delivery_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  response_status integer,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.lead_deliveries to authenticated;
grant all on public.lead_deliveries to service_role;
alter table public.lead_deliveries enable row level security;
drop policy if exists "deliveries readable by org" on public.lead_deliveries;
create policy "deliveries readable by org" on public.lead_deliveries
  for select to authenticated using (public.can_read_org(auth.uid(), org_id));

-- ===== commercial plans =====
update public.plans set is_active = false where key in ('pilot','integration');
insert into public.plans (key, name, setup_fee_sek, monthly_fee_sek, included_minutes, overage_sek_per_minute, features, position, is_active)
values
  ('start', 'Start', 4995, 1495, 200, 3.90,
   '["Svensk AI-receptionist för inkommande samtal","Kunskapsbas och öppettider","Leads via e-post","Överkoppling till bemannat nummer","Månadsrapport"]'::jsonb, 1, true),
  ('pro', 'Pro', 9995, 2995, 600, 3.50,
   '["Allt i Start","Webhook-leverans av leads till CRM","Uppföljningskö med SLA","Fler kvalificeringsfält och handoff-regler","Kvalitetspoängkort och veckorapport"]'::jsonb, 2, true),
  ('integrerad', 'Integrerad', 0, 0, 0, 0,
   '["Allt i Pro","Bokningssystem eller CRM-integration","Fler nummer och verksamheter","Pris enligt offert"]'::jsonb, 3, true)
on conflict (key) do update set
  name = excluded.name,
  setup_fee_sek = excluded.setup_fee_sek,
  monthly_fee_sek = excluded.monthly_fee_sek,
  included_minutes = excluded.included_minutes,
  overage_sek_per_minute = excluded.overage_sek_per_minute,
  features = excluded.features,
  position = excluded.position,
  is_active = true;
