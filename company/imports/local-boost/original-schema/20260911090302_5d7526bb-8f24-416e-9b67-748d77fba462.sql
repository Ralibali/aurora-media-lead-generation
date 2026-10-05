
create type public.app_role as enum ('aurora_admin','operator','client');
create type public.location_status as enum ('onboarding','active','paused','churned');
create type public.checklist_status as enum ('todo','in_progress','done','blocked','not_applicable');
create type public.approval_status as enum ('draft','pending','approved','rejected','published');
create type public.action_status as enum ('open','in_progress','waiting_client','done');
create type public.nap_status as enum ('ok','mismatch','missing','unknown');
create type public.provider_mode as enum ('demo','not_configured','live');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_number text,
  contact_email text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('aurora_admin','operator'))
$$;

create or replace function public.is_org_member(_user_id uuid, _org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.org_members where user_id = _user_id and org_id = _org_id)
$$;

create or replace function public.can_read_org(_org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(auth.uid()) or public.is_org_member(auth.uid(), _org_id)
$$;

create table public.plans (
  code text primary key,
  name text not null,
  monthly_price_sek integer not null,
  onboarding_fee_sek integer not null default 0,
  description text not null,
  sort_order integer not null default 0
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  street text,
  postal_code text,
  city text,
  phone text,
  website text,
  gbp_place_id text,
  plan_code text references public.plans(code),
  status public.location_status not null default 'onboarding',
  health_score integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.location_org(_location_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.locations where id = _location_id
$$;

create table public.checklist_templates (
  key text primary key,
  title text not null,
  category text not null,
  weight integer not null default 1,
  help_text text,
  sort_order integer not null default 0
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  template_key text not null references public.checklist_templates(key),
  status public.checklist_status not null default 'todo',
  note text,
  updated_at timestamptz not null default now(),
  is_demo boolean not null default false,
  unique (location_id, template_key)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  source text not null default 'google',
  external_id text,
  author_name text,
  rating integer not null,
  body text,
  review_date timestamptz not null default now(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  draft_text text not null,
  status public.approval_status not null default 'pending',
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  publish_error text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  phrase text not null,
  geo text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references public.keywords(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  captured_at timestamptz not null default now(),
  position integer,
  local_pack_position integer,
  provider_key text not null default 'demo',
  is_demo boolean not null default false
);

create table public.citations (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  directory text not null,
  url text,
  status public.nap_status not null default 'unknown',
  found_name text,
  found_address text,
  found_phone text,
  checked_at timestamptz,
  is_demo boolean not null default false
);

create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  name text not null,
  gbp_rating numeric(2,1),
  review_count integer,
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ai_visibility_snapshots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  engine text not null,
  prompt text not null,
  mentioned boolean not null default false,
  rank_in_answer integer,
  captured_at timestamptz not null default now(),
  provider_key text not null default 'aurora_sight',
  is_demo boolean not null default false
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  title text not null,
  description text,
  priority integer not null default 2,
  status public.action_status not null default 'open',
  owner text not null default 'aurora',
  due_date date,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  period_month date not null,
  summary text,
  metrics jsonb not null default '{}'::jsonb,
  status public.approval_status not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.integration_settings (
  provider_key text primary key,
  provider_name text not null,
  kind text not null,
  mode public.provider_mode not null default 'not_configured',
  notes text,
  updated_at timestamptz not null default now()
);

create table public.usage_costs (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null,
  period_month date not null,
  units integer not null default 0,
  cost_sek numeric(10,2) not null default 0,
  monthly_cap_sek numeric(10,2) not null default 0,
  is_demo boolean not null default false,
  unique (provider_key, period_month)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  org_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select on public.plans to authenticated, anon;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.org_members to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.checklist_templates to authenticated;
grant select, insert, update, delete on public.locations to authenticated;
grant select, insert, update, delete on public.checklist_items to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.review_responses to authenticated;
grant select, insert, update, delete on public.keywords to authenticated;
grant select, insert, update, delete on public.rank_snapshots to authenticated;
grant select, insert, update, delete on public.citations to authenticated;
grant select, insert, update, delete on public.competitors to authenticated;
grant select, insert, update, delete on public.ai_visibility_snapshots to authenticated;
grant select, insert, update, delete on public.actions to authenticated;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.integration_settings to authenticated;
grant select, insert, update, delete on public.usage_costs to authenticated;
grant select, insert on public.audit_log to authenticated;
grant all on public.organizations, public.org_members, public.user_roles, public.profiles,
  public.plans, public.checklist_templates, public.locations, public.checklist_items, public.reviews,
  public.review_responses, public.keywords, public.rank_snapshots, public.citations,
  public.competitors, public.ai_visibility_snapshots, public.actions, public.reports,
  public.integration_settings, public.usage_costs, public.audit_log to service_role;

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.locations enable row level security;
alter table public.checklist_items enable row level security;
alter table public.reviews enable row level security;
alter table public.review_responses enable row level security;
alter table public.keywords enable row level security;
alter table public.rank_snapshots enable row level security;
alter table public.citations enable row level security;
alter table public.competitors enable row level security;
alter table public.ai_visibility_snapshots enable row level security;
alter table public.actions enable row level security;
alter table public.reports enable row level security;
alter table public.integration_settings enable row level security;
alter table public.usage_costs enable row level security;
alter table public.audit_log enable row level security;

create policy "plans readable" on public.plans for select to authenticated, anon using (true);
create policy "templates readable" on public.checklist_templates for select to authenticated using (true);

create policy "profiles own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid());

create policy "roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "roles admin write" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'aurora_admin')) with check (public.has_role(auth.uid(),'aurora_admin'));

create policy "orgs read" on public.organizations for select to authenticated using (public.can_read_org(id));
create policy "orgs staff write" on public.organizations for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "members read" on public.org_members for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "members admin write" on public.org_members for all to authenticated
  using (public.has_role(auth.uid(),'aurora_admin')) with check (public.has_role(auth.uid(),'aurora_admin'));

create policy "locations read" on public.locations for select to authenticated using (public.can_read_org(org_id));
create policy "locations staff write" on public.locations for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "checklist read" on public.checklist_items for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "checklist staff write" on public.checklist_items for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "reviews read" on public.reviews for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "reviews staff write" on public.reviews for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "review_responses read" on public.review_responses for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "review_responses staff write" on public.review_responses for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "keywords read" on public.keywords for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "keywords staff write" on public.keywords for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "ranks read" on public.rank_snapshots for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "ranks staff write" on public.rank_snapshots for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "citations read" on public.citations for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "citations staff write" on public.citations for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "competitors read" on public.competitors for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "competitors staff write" on public.competitors for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "aiv read" on public.ai_visibility_snapshots for select to authenticated using (public.can_read_org(public.location_org(location_id)));
create policy "aiv staff write" on public.ai_visibility_snapshots for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "actions read" on public.actions for select to authenticated using (public.can_read_org(org_id));
create policy "actions staff write" on public.actions for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "reports read" on public.reports for select to authenticated using (public.can_read_org(org_id));
create policy "reports staff write" on public.reports for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "integrations staff read" on public.integration_settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "integrations admin write" on public.integration_settings for all to authenticated
  using (public.has_role(auth.uid(),'aurora_admin')) with check (public.has_role(auth.uid(),'aurora_admin'));

create policy "usage staff read" on public.usage_costs for select to authenticated using (public.is_staff(auth.uid()));
create policy "usage admin write" on public.usage_costs for all to authenticated
  using (public.has_role(auth.uid(),'aurora_admin')) with check (public.has_role(auth.uid(),'aurora_admin'));

create policy "audit read" on public.audit_log for select to authenticated
  using (public.is_staff(auth.uid()) or (org_id is not null and public.is_org_member(auth.uid(), org_id)));
create policy "audit insert" on public.audit_log for insert to authenticated with check (actor_id = auth.uid());

insert into public.plans (code, name, monthly_price_sek, onboarding_fee_sek, description, sort_order) values
('bas','Bas',995,2995,'Google-företagsprofil, NAP-kontroll, recensionsbevakning och månadsrapport.',1),
('tillvaxt','Tillväxt',1495,3995,'Allt i Bas plus rankningsbevakning, citeringsarbete och svarsförslag på recensioner.',2),
('premium','Premium',2495,5995,'Allt i Tillväxt plus konkurrensbevakning, AI-synlighet och prioriterad åtgärdskö.',3);

insert into public.checklist_templates (key, title, category, weight, help_text, sort_order) values
('gbp_verified','Google-företagsprofil verifierad','Google-företagsprofil',3,'Profilen är verifierad och ägd av kunden.',1),
('gbp_categories','Kategorier och tjänster ifyllda','Google-företagsprofil',2,'Primär kategori matchar huvudtjänsten.',2),
('gbp_hours','Öppettider och helgdagar','Google-företagsprofil',2,'Inklusive avvikande öppettider.',3),
('gbp_photos','Minst 10 aktuella bilder','Google-företagsprofil',1,'Egna bilder, inga stockbilder.',4),
('gbp_posts','Inlägg publiceras månadsvis','Google-företagsprofil',1,null,5),
('nap_consistent','NAP konsekvent på webbplatsen','Lokal SEO',3,'Namn, adress och telefon identiska överallt.',6),
('local_landing','Lokal landningssida finns','Lokal SEO',2,'Egen sida för orten med unikt innehåll.',7),
('schema_localbusiness','LocalBusiness-strukturerad data','Lokal SEO',2,null,8),
('citations_core','Kärncitat inlagda','Citeringar',2,'Eniro, hitta.se, Google, Bing, Facebook.',9),
('review_flow','Rutin för recensionsinsamling','Recensioner',3,'Kunden ber aktivt om recensioner.',10),
('review_response','Svar på recensioner inom 5 dagar','Recensioner',2,null,11),
('tracking','Mätning av samtal och vägbeskrivningar','Mätning',2,null,12);

insert into public.integration_settings (provider_key, provider_name, kind, mode, notes) values
('demo_local','Demoleverantör (lokal data)','local_data','demo','Simulerad data för demonstration. Märks alltid DEMO.'),
('brightlocal','BrightLocal','local_data','not_configured','Ej konfigurerad. Kräver API-nyckel.'),
('dataforseo','DataForSEO','local_data','not_configured','Ej konfigurerad. Kräver inloggningsuppgifter.'),
('local_falcon','Local Falcon','local_data','not_configured','Ej konfigurerad.'),
('gbp_api','Google Business Profile API','gbp','not_configured','Ej konfigurerad. Kräver OAuth-godkännande från Google.'),
('aurora_sight','Aurora Sight','ai_visibility','not_configured','Ej konfigurerad. Kopplas när Aurora Sight är tillgängligt.');

insert into public.usage_costs (provider_key, period_month, units, cost_sek, monthly_cap_sek, is_demo) values
('demo_local', date_trunc('month', now())::date, 0, 0, 500, true),
('brightlocal', date_trunc('month', now())::date, 0, 0, 1500, false),
('aurora_sight', date_trunc('month', now())::date, 0, 0, 1000, false);

insert into public.organizations (id, name, org_number, contact_email, is_demo) values
('11111111-1111-4111-8111-111111111111','DEMO Nordlys Tandvård AB','556000-1111','demo@nordlys.example',true),
('22222222-2222-4222-8222-222222222222','DEMO Kaffebruket i Norr AB','556000-2222','demo@kaffebruket.example',true);

insert into public.locations (id, org_id, name, street, postal_code, city, phone, website, plan_code, status, health_score, is_demo) values
('aaaaaaaa-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','DEMO Nordlys Tandvård Umeå','Storgatan 12','903 21','Umeå','090-123 45 67','https://exempel.se/umea','tillvaxt','active',72,true),
('aaaaaaaa-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','DEMO Nordlys Tandvård Skellefteå','Nygatan 4','931 31','Skellefteå','0910-12 34 56','https://exempel.se/skelleftea','tillvaxt','onboarding',41,true),
('aaaaaaaa-0000-4000-8000-000000000003','22222222-2222-4222-8222-222222222222','DEMO Kaffebruket Luleå','Kungsgatan 8','972 31','Luleå','0920-11 22 33','https://exempel.se/lulea','premium','active',86,true);

insert into public.checklist_items (location_id, template_key, status, is_demo)
select l.id, t.key,
  (case when (abs(hashtext(l.id::text || t.key)) % 3) = 0 then 'done'
        when (abs(hashtext(l.id::text || t.key)) % 3) = 1 then 'in_progress'
        else 'todo' end)::public.checklist_status,
  true
from public.locations l cross join public.checklist_templates t where l.is_demo;

insert into public.reviews (id, location_id, author_name, rating, body, review_date, is_demo) values
('bbbbbbbb-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000001','DEMO Anna L.',5,'Mycket trevligt bemötande och kort väntetid.', now() - interval '3 days', true),
('bbbbbbbb-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-000000000001','DEMO Johan P.',2,'Svårt att komma fram på telefon.', now() - interval '6 days', true),
('bbbbbbbb-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-000000000003','DEMO Sara M.',4,'Gott kaffe, lite trångt på helgerna.', now() - interval '2 days', true);

insert into public.review_responses (review_id, location_id, draft_text, status, is_demo) values
('bbbbbbbb-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-000000000001','Hej Johan, tack för att du hör av dig. Vi beklagar att det var svårt att nå oss. Vi har utökat telefontiderna på förmiddagar och du är varmt välkommen att boka direkt via vår webbplats.','pending',true),
('bbbbbbbb-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000001','Tack Anna, vad roligt att höra! Vi ses nästa gång.','pending',true);

insert into public.keywords (id, location_id, phrase, geo, is_demo) values
('cccccccc-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000001','tandläkare umeå','Umeå',true),
('cccccccc-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-000000000001','akut tandvård umeå','Umeå',true),
('cccccccc-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-000000000003','kafé luleå','Luleå',true);

insert into public.rank_snapshots (keyword_id, location_id, captured_at, position, local_pack_position, provider_key, is_demo)
select k.id, k.location_id, now() - (g || ' days')::interval,
  3 + ((abs(hashtext(k.id::text)) + g) % 12), 1 + ((abs(hashtext(k.id::text)) + g) % 3), 'demo_local', true
from public.keywords k cross join generate_series(0, 5) g where k.is_demo;

insert into public.citations (location_id, directory, url, status, found_name, found_phone, checked_at, is_demo) values
('aaaaaaaa-0000-4000-8000-000000000001','hitta.se','https://exempel.se/hitta','ok','DEMO Nordlys Tandvård Umeå','090-123 45 67', now() - interval '1 day', true),
('aaaaaaaa-0000-4000-8000-000000000001','Eniro','https://exempel.se/eniro','mismatch','DEMO Nordlys Tandvard Umea','090-1234567', now() - interval '1 day', true),
('aaaaaaaa-0000-4000-8000-000000000001','Facebook',null,'missing',null,null, now() - interval '1 day', true),
('aaaaaaaa-0000-4000-8000-000000000003','hitta.se','https://exempel.se/hitta-lulea','ok','DEMO Kaffebruket Luleå','0920-11 22 33', now() - interval '1 day', true);

insert into public.competitors (location_id, name, gbp_rating, review_count, notes, is_demo) values
('aaaaaaaa-0000-4000-8000-000000000001','DEMO Tandvårdshuset Umeå',4.6,182,'Publicerar inlägg varje vecka.',true),
('aaaaaaaa-0000-4000-8000-000000000001','DEMO Citytandläkarna',4.2,97,'Starka på akuttider.',true),
('aaaaaaaa-0000-4000-8000-000000000003','DEMO Bryggeriet Kafé',4.7,311,'Många färska bilder.',true);

insert into public.ai_visibility_snapshots (location_id, engine, prompt, mentioned, rank_in_answer, captured_at, provider_key, is_demo) values
('aaaaaaaa-0000-4000-8000-000000000001','DEMO-motor','bästa tandläkaren i Umeå', true, 2, now() - interval '2 days','demo_local', true),
('aaaaaaaa-0000-4000-8000-000000000001','DEMO-motor','akut tandvård Umeå helg', false, null, now() - interval '2 days','demo_local', true),
('aaaaaaaa-0000-4000-8000-000000000003','DEMO-motor','mysigt kafé Luleå', true, 1, now() - interval '2 days','demo_local', true);

insert into public.actions (org_id, location_id, title, description, priority, status, owner, due_date, is_demo) values
('11111111-1111-4111-8111-111111111111','aaaaaaaa-0000-4000-8000-000000000001','Rätta NAP-avvikelse på Eniro','Telefonnummer och namn skiljer sig mot webbplatsen.',1,'open','aurora', current_date + 5, true),
('11111111-1111-4111-8111-111111111111','aaaaaaaa-0000-4000-8000-000000000002','Verifiera Google-företagsprofil','Kunden behöver ta emot verifieringskortet.',1,'waiting_client','client', current_date + 10, true),
('22222222-2222-4222-8222-222222222222','aaaaaaaa-0000-4000-8000-000000000003','Ladda upp 10 nya bilder','Bilder från nyrenoverade lokalen.',2,'in_progress','aurora', current_date + 14, true);

insert into public.reports (org_id, location_id, period_month, summary, metrics, status, is_demo) values
('11111111-1111-4111-8111-111111111111','aaaaaaaa-0000-4000-8000-000000000001', date_trunc('month', now() - interval '1 month')::date,'DEMO: Stabil utveckling i lokala sökresultat. Två NAP-avvikelser åtgärdade.','{"snittposition":6.4,"recensioner":3,"snittbetyg":4.1,"atgarder_klara":5}','approved', true),
('22222222-2222-4222-8222-222222222222','aaaaaaaa-0000-4000-8000-000000000003', date_trunc('month', now() - interval '1 month')::date,'DEMO: Höga betyg och stark synlighet. Fokus nästa månad på fler bilder.','{"snittposition":2.8,"recensioner":9,"snittbetyg":4.7,"atgarder_klara":7}','approved', true);
