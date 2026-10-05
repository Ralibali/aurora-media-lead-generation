-- ============ enums ============
create type public.app_role as enum ('aurora_admin', 'aurora_operator', 'client_user');
create type public.vertical as enum ('trafikskola', 'hospitality');
create type public.org_status as enum ('prospect', 'onboarding', 'active', 'paused', 'churned');
create type public.agent_status as enum ('draft', 'testing', 'live', 'paused');
create type public.call_direction as enum ('inbound', 'outbound_return');
create type public.call_outcome as enum ('answered', 'qualified_lead', 'booked', 'transferred', 'voicemail', 'abandoned', 'failed', 'unknown');
create type public.lead_status as enum ('new', 'qualified', 'contacted', 'booked', 'won', 'lost');
create type public.integration_kind as enum ('telephony', 'stt', 'tts', 'llm', 'booking', 'crm', 'calendar', 'email');
create type public.integration_status as enum ('not_configured', 'configured', 'healthy', 'degraded', 'failing');
create type public.usage_kind as enum ('telephony', 'stt', 'tts', 'llm');
create type public.voice_test_status as enum ('planned', 'running', 'passed', 'failed', 'blocked');

-- ============ profiles ============
create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ============ roles ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_aurora_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('aurora_admin','aurora_operator')
  )
$$;

-- ============ organizations ============
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_number text,
  vertical public.vertical not null,
  status public.org_status not null default 'onboarding',
  contact_email text,
  contact_phone text,
  city text,
  demo_mode boolean not null default true,
  onboarding_step integer not null default 0,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
grant select, insert, delete on public.org_members to authenticated;
grant all on public.org_members to service_role;
alter table public.org_members enable row level security;

create or replace function public.is_org_member(_user_id uuid, _org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.org_members where user_id = _user_id and org_id = _org_id)
$$;

create or replace function public.can_read_org(_user_id uuid, _org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_aurora_staff(_user_id) or public.is_org_member(_user_id, _org_id)
$$;

-- ============ agents & configuration ============
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  vertical public.vertical not null,
  status public.agent_status not null default 'draft',
  language text not null default 'sv-SE',
  persona text,
  greeting text,
  disclosure_text text not null default 'Hej, du talar med en AI-assistent. Samtalet kan spelas in för kvalitet.',
  consent_required boolean not null default true,
  fallback_number text,
  max_call_seconds integer not null default 600,
  provider text not null default 'demo',
  provider_agent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.agents to authenticated;
grant all on public.agents to service_role;
alter table public.agents enable row level security;

create table public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens time,
  closes time,
  closed boolean not null default false,
  unique (org_id, weekday)
);
grant select, insert, update, delete on public.opening_hours to authenticated;
grant all on public.opening_hours to service_role;
alter table public.opening_hours enable row level security;

create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  question text not null,
  answer text not null,
  tags text[] not null default '{}',
  source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.knowledge_items to authenticated;
grant all on public.knowledge_items to service_role;
alter table public.knowledge_items enable row level security;

create table public.qualification_questions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  position integer not null default 0,
  field_key text not null,
  question text not null,
  required boolean not null default true
);
grant select, insert, update, delete on public.qualification_questions to authenticated;
grant all on public.qualification_questions to service_role;
alter table public.qualification_questions enable row level security;

create table public.handoff_rules (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  condition_key text not null,
  action text not null,
  target text,
  requires_approval boolean not null default false,
  is_active boolean not null default true
);
grant select, insert, update, delete on public.handoff_rules to authenticated;
grant all on public.handoff_rules to service_role;
alter table public.handoff_rules enable row level security;

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind public.integration_kind not null,
  provider text not null,
  status public.integration_status not null default 'not_configured',
  config jsonb not null default '{}'::jsonb,
  requires_approval boolean not null default true,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.integrations to authenticated;
grant all on public.integrations to service_role;
alter table public.integrations enable row level security;

-- ============ calls ============
create table public.calls (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  provider text not null default 'demo',
  external_id text,
  direction public.call_direction not null default 'inbound',
  from_number text,
  to_number text,
  language text not null default 'sv-SE',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  outcome public.call_outcome not null default 'unknown',
  transferred_to text,
  avg_latency_ms integer,
  cost_sek numeric(12,4) not null default 0,
  is_demo boolean not null default true,
  summary text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.calls to authenticated;
grant all on public.calls to service_role;
alter table public.calls enable row level security;
create index calls_org_started_idx on public.calls (org_id, started_at desc);

create table public.call_messages (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  position integer not null default 0,
  speaker text not null,
  content text not null,
  offset_ms integer,
  confidence numeric(5,4),
  is_demo boolean not null default true
);
grant select, insert, delete on public.call_messages to authenticated;
grant all on public.call_messages to service_role;
alter table public.call_messages enable row level security;
create index call_messages_call_idx on public.call_messages (call_id, position);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  call_id uuid references public.calls(id) on delete set null,
  name text,
  phone text,
  email text,
  status public.lead_status not null default 'new',
  score integer not null default 0,
  intent text,
  answers jsonb not null default '{}'::jsonb,
  notes text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;

create table public.qa_scorecards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  call_id uuid not null references public.calls(id) on delete cascade,
  reviewer_id uuid,
  criteria jsonb not null default '{}'::jsonb,
  total_score integer not null default 0,
  max_score integer not null default 25,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.qa_scorecards to authenticated;
grant all on public.qa_scorecards to service_role;
alter table public.qa_scorecards enable row level security;

-- ============ usage, cost, billing ============
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  call_id uuid references public.calls(id) on delete set null,
  kind public.usage_kind not null,
  provider text not null default 'demo',
  units numeric(14,4) not null default 0,
  unit text not null default 'minute',
  cost_sek numeric(12,4) not null default 0,
  is_demo boolean not null default true,
  occurred_at timestamptz not null default now()
);
grant select, insert on public.usage_events to authenticated;
grant all on public.usage_events to service_role;
alter table public.usage_events enable row level security;
create index usage_events_org_idx on public.usage_events (org_id, occurred_at desc);

create table public.cost_guardrails (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade unique,
  monthly_budget_sek numeric(12,2) not null default 2000,
  alert_threshold_pct integer not null default 80,
  hard_stop boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.cost_guardrails to authenticated;
grant all on public.cost_guardrails to service_role;
alter table public.cost_guardrails enable row level security;

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  setup_fee_sek numeric(12,2) not null default 0,
  monthly_fee_sek numeric(12,2) not null default 0,
  included_minutes integer not null default 0,
  overage_sek_per_minute numeric(8,2) not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  position integer not null default 0
);
grant select on public.plans to authenticated, anon;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "plans readable by everyone" on public.plans for select using (true);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active',
  started_at date not null default current_date,
  ended_at date,
  mrr_sek numeric(12,2) not null default 0,
  setup_invoiced boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;

-- ============ audit & voice tests ============
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  actor_id uuid,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create index audit_log_created_idx on public.audit_log (created_at desc);

create table public.voice_test_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  scenario_key text not null,
  status public.voice_test_status not null default 'planned',
  is_real_call boolean not null default false,
  metrics jsonb not null default '{}'::jsonb,
  verdict text,
  notes text,
  executed_by uuid,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.voice_test_runs to authenticated;
grant all on public.voice_test_runs to service_role;
alter table public.voice_test_runs enable row level security;

create table public.vertical_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  vertical public.vertical not null,
  name text not null,
  description text,
  payload jsonb not null default '{}'::jsonb
);
grant select on public.vertical_templates to authenticated;
grant all on public.vertical_templates to service_role;
alter table public.vertical_templates enable row level security;
create policy "templates readable by signed in users" on public.vertical_templates
  for select to authenticated using (true);

-- ============ policies ============
create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_aurora_staff(auth.uid()));
create policy "own profile insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid());

create policy "read own roles or staff" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_aurora_staff(auth.uid()));

create policy "orgs readable" on public.organizations for select to authenticated
  using (public.can_read_org(auth.uid(), id));
create policy "orgs staff insert" on public.organizations for insert to authenticated
  with check (public.is_aurora_staff(auth.uid()));
create policy "orgs staff update" on public.organizations for update to authenticated
  using (public.is_aurora_staff(auth.uid()));
create policy "orgs admin delete" on public.organizations for delete to authenticated
  using (public.has_role(auth.uid(), 'aurora_admin'));

create policy "members readable" on public.org_members for select to authenticated
  using (user_id = auth.uid() or public.is_aurora_staff(auth.uid()));
create policy "members staff insert" on public.org_members for insert to authenticated
  with check (public.is_aurora_staff(auth.uid()));
create policy "members staff delete" on public.org_members for delete to authenticated
  using (public.is_aurora_staff(auth.uid()));

do $$
declare t text;
begin
  foreach t in array array[
    'agents','opening_hours','knowledge_items','qualification_questions','handoff_rules',
    'integrations','calls','call_messages','leads','qa_scorecards','usage_events',
    'cost_guardrails','subscriptions','voice_test_runs'
  ] loop
    execute format($f$
      create policy "read org scoped" on public.%1$I for select to authenticated
        using (public.can_read_org(auth.uid(), org_id));
    $f$, t);
    execute format($f$
      create policy "staff insert" on public.%1$I for insert to authenticated
        with check (public.is_aurora_staff(auth.uid()));
    $f$, t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'agents','opening_hours','knowledge_items','qualification_questions','handoff_rules',
    'integrations','calls','leads','qa_scorecards','cost_guardrails','subscriptions','voice_test_runs'
  ] loop
    execute format($f$
      create policy "staff update" on public.%1$I for update to authenticated
        using (public.is_aurora_staff(auth.uid()));
    $f$, t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'agents','opening_hours','knowledge_items','qualification_questions','handoff_rules',
    'integrations','calls','call_messages','leads','qa_scorecards','voice_test_runs'
  ] loop
    execute format($f$
      create policy "staff delete" on public.%1$I for delete to authenticated
        using (public.is_aurora_staff(auth.uid()));
    $f$, t);
  end loop;
end $$;

-- clients may update their own leads pipeline status and knowledge base
create policy "client update own leads" on public.leads for update to authenticated
  using (public.is_org_member(auth.uid(), org_id));
create policy "client manage own knowledge" on public.knowledge_items for insert to authenticated
  with check (public.is_org_member(auth.uid(), org_id));
create policy "client update own knowledge" on public.knowledge_items for update to authenticated
  using (public.is_org_member(auth.uid(), org_id));

create policy "audit readable" on public.audit_log for select to authenticated
  using (public.is_aurora_staff(auth.uid()) or (org_id is not null and public.is_org_member(auth.uid(), org_id)));
create policy "audit insert authenticated" on public.audit_log for insert to authenticated
  with check (actor_id = auth.uid());

-- ============ profile trigger ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ seed reference data (plans + vertical templates) ============
insert into public.plans (key, name, setup_fee_sek, monthly_fee_sek, included_minutes, overage_sek_per_minute, features, position) values
('pilot', 'Pilot', 4995, 1495, 200, 3.90,
 '["AI-receptionist på svenska","Kunskapsbas och öppettider","Leadkvalificering","Överkoppling till människa","Samtalshistorik och transkript","E-postsammanfattning"]'::jsonb, 1),
('integration', 'Integration', 9995, 2995, 600, 3.50,
 '["Allt i Pilot","Bokning i externt system","CRM-koppling","Kalendersynk","QA-granskning varje vecka","Prioriterad support"]'::jsonb, 2);

insert into public.vertical_templates (key, vertical, name, description, payload) values
('trafikskola_bas', 'trafikskola', 'Trafikskola – bas',
 'Receptionist för trafikskola: priser, paket, lediga tider, riskettan, körkortstillstånd.',
 '{
   "greeting": "Hej och välkommen till {{org_name}}. Jag är skolans AI-assistent. Hur kan jag hjälpa dig?",
   "persona": "Vänlig, tydlig och effektiv. Svarar kort på svenska. Gissar aldrig priser eller tider – hänvisar till personal när uppgiften saknas.",
   "knowledge": [
     {"question":"Vad kostar en körlektion?","answer":"Fyll i skolans pris per lektion här innan agenten går live."},
     {"question":"Vad ingår i riskettan?","answer":"Fyll i innehåll och pris för riskutbildning del 1."},
     {"question":"Hur bokar jag körlektion?","answer":"Beskriv hur bokning går till hos skolan."},
     {"question":"Vilka öppettider har ni?","answer":"Hämtas automatiskt från öppettiderna i Aurora."}
   ],
   "qualification": [
     {"field_key":"namn","question":"Vad heter du?","required":true},
     {"field_key":"telefon","question":"Vilket telefonnummer når vi dig på?","required":true},
     {"field_key":"korkortstillstand","question":"Har du körkortstillstånd sedan tidigare?","required":false},
     {"field_key":"behorighet","question":"Vilken behörighet gäller det, till exempel B?","required":true},
     {"field_key":"onskad_start","question":"När vill du helst börja?","required":false}
   ],
   "handoff": [
     {"description":"Klagomål eller uppsägning","condition_key":"complaint","action":"transfer","requires_approval":false},
     {"description":"Fråga om pris som saknas i kunskapsbasen","condition_key":"unknown_price","action":"take_message","requires_approval":false},
     {"description":"Bokning av intensivkurs","condition_key":"intensive_course","action":"transfer","requires_approval":false}
   ]
 }'::jsonb),
('hospitality_glamping', 'hospitality', 'Hospitality / Glamping – bas',
 'Receptionist för glamping och mindre boenden: tillgänglighet, priser, incheckning, husdjur, avbokning.',
 '{
   "greeting": "Hej och välkommen till {{org_name}}. Jag är vår AI-assistent. Vill du boka eller ställa en fråga?",
   "persona": "Varm, gästvänlig och koncis. Svarar på svenska. Lovar aldrig en bokning som inte är bekräftad i bokningssystemet.",
   "knowledge": [
     {"question":"Vad kostar en natt?","answer":"Fyll i prisintervall per boendetyp och säsong."},
     {"question":"Får man ta med hund?","answer":"Fyll i husdjurspolicy."},
     {"question":"När är incheckning och utcheckning?","answer":"Fyll i tider för in- och utcheckning."},
     {"question":"Vad gäller vid avbokning?","answer":"Fyll i avbokningsvillkor."}
   ],
   "qualification": [
     {"field_key":"namn","question":"Vad heter du?","required":true},
     {"field_key":"telefon","question":"Vilket nummer når vi dig på?","required":true},
     {"field_key":"datum","question":"Vilka datum är du intresserad av?","required":true},
     {"field_key":"antal_gaster","question":"Hur många gäster är ni?","required":true},
     {"field_key":"boendetyp","question":"Vilken typ av boende vill du ha?","required":false}
   ],
   "handoff": [
     {"description":"Grupp över 10 personer","condition_key":"group_booking","action":"transfer","requires_approval":false},
     {"description":"Bekräfta bokning i bokningssystem","condition_key":"confirm_booking","action":"integration_action","requires_approval":true},
     {"description":"Klagomål under pågående vistelse","condition_key":"complaint","action":"transfer","requires_approval":false}
   ]
 }'::jsonb);
