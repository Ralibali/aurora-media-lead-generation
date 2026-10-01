-- Aurora Media portfolio dashboard. Browser roles have no direct access;
-- admin-portfolio verifies the existing admin token before using service_role.
create table public.portfolio_projects (
  project_id text primary key,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

create table public.portfolio_snapshots (
  project_id text not null,
  source text not null check (source in ('ga4', 'gsc')),
  range_days integer not null check (range_days in (7, 28, 90)),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (project_id, source, range_days)
);

create table public.portfolio_checks (
  project_id text primary key,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

create table public.portfolio_source_states (
  project_id text not null,
  source text not null check (source in ('ga4', 'gsc', 'health')),
  range_days integer not null default 0 check (range_days in (0, 7, 28, 90)),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (project_id, source, range_days)
);

alter table public.portfolio_snapshots enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_checks enable row level security;
alter table public.portfolio_source_states enable row level security;
revoke all on public.portfolio_projects, public.portfolio_snapshots, public.portfolio_checks, public.portfolio_source_states from public, anon, authenticated;
grant select, insert, update, delete on public.portfolio_projects, public.portfolio_snapshots, public.portfolio_checks, public.portfolio_source_states to service_role;

-- Atomic two-minute retry/concurrency guard, including sources that fail.
-- SECURITY INVOKER deliberately relies on the caller's table privileges.
create function public.portfolio_claim_refresh(p_project_id text, p_source text, p_attempted_at timestamptz, p_range_days integer default 0)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare claimed integer;
begin
  if p_source not in ('ga4', 'gsc', 'health') or length(p_project_id) not between 1 and 200 then
    raise exception 'Invalid portfolio refresh';
  end if;
  if (p_source = 'health' and p_range_days <> 0) or (p_source <> 'health' and p_range_days not in (7, 28, 90)) then
    raise exception 'Invalid portfolio range';
  end if;
  insert into public.portfolio_source_states(project_id, source, range_days, payload, updated_at)
  values (
    p_project_id, p_source, p_range_days,
    jsonb_build_object('projectId', p_project_id, 'source', p_source, 'rangeDays', p_range_days, 'attemptedAt', p_attempted_at, 'succeededAt', null, 'error', null),
    now()
  )
  on conflict (project_id, source, range_days) do update
    set payload = public.portfolio_source_states.payload || jsonb_build_object('attemptedAt', p_attempted_at), updated_at = now()
    where public.portfolio_source_states.updated_at < now() - interval '2 minutes';
  get diagnostics claimed = row_count;
  return claimed = 1;
end;
$$;
revoke all on function public.portfolio_claim_refresh(text, text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.portfolio_claim_refresh(text, text, timestamptz, integer) to service_role;
