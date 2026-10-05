-- Browser monitoring extends the existing service-only Guardian admin boundary.
create table public.guardian_flows (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.guardian_sites(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 2 and 8),
  active boolean not null default true,
  check_interval_minutes integer not null default 1440 check (check_interval_minutes in (60,360,1440)),
  next_run_at timestamptz not null default now(),
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.guardian_flow_runs (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.guardian_flows(id) on delete cascade,
  lease_token uuid not null default gen_random_uuid(),
  lease_expires_at timestamptz not null,
  steps_snapshot jsonb not null,
  status text not null default 'running' check (status in ('running','passed','failed','flaky','inconclusive')),
  incident_state text not null default 'unknown' check (incident_state in ('unknown','healthy','first_failure','confirmed_failure','recovered','flaky')),
  attempts integer not null default 0 check (attempts between 0 and 2),
  duration_ms integer check (duration_ms between 0 and 600000),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create unique index guardian_flow_one_running on public.guardian_flow_runs(flow_id) where status = 'running';
create index guardian_flows_due on public.guardian_flows(next_run_at) where active;
create index guardian_flows_site on public.guardian_flows(site_id);
create index guardian_flow_runs_history on public.guardian_flow_runs(flow_id,created_at desc);
alter table public.guardian_flows enable row level security;
alter table public.guardian_flow_runs enable row level security;
revoke all on public.guardian_flows, public.guardian_flow_runs from public, anon, authenticated;
grant all on public.guardian_flows, public.guardian_flow_runs to service_role;

-- No browser role has a storage policy. Only the edge function can write evidence
-- or issue short-lived signed URLs after the existing admin check.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('aurora-watch-evidence','aurora-watch-evidence',false,512000,array['image/jpeg']);
-- Existing installations may have broad policies for their public media buckets.
-- A restrictive policy prevents those permissive rules from exposing this bucket.
create policy aurora_watch_evidence_service_only on storage.objects as restrictive
  for all to anon,authenticated
  using (bucket_id <> 'aurora-watch-evidence')
  with check (bucket_id <> 'aurora-watch-evidence');

create function public.guardian_claim_flows(p_limit integer default 1,p_origins text[] default '{}')
returns table(run_id uuid,lease_token uuid,lease_expires_at timestamptz,flow_id uuid,
  name text,site_id uuid,site_url text,steps jsonb)
language plpgsql security invoker set search_path = public
as $$
declare f record; r public.guardian_flow_runs%rowtype;
begin
  -- Reap expired leases even when a daily flow is not due again yet. Never block
  -- a concurrent completion: use the same flow-first lock order with SKIP LOCKED.
  for f in select gf.id from public.guardian_flows gf where exists (
    select 1 from public.guardian_flow_runs gr where gr.flow_id = gf.id
      and gr.status = 'running' and gr.lease_expires_at <= now())
    for update of gf skip locked
  loop
    update public.guardian_flow_runs gr set status = 'inconclusive', completed_at = now(),
      details = jsonb_build_object('error','Köraren slutförde inte kontrollen inom tio minuter.')
      where gr.flow_id = f.id and gr.status = 'running' and gr.lease_expires_at <= now();
  end loop;
  -- Lock the flow before changing runs: completion and editing use this same order.
  for f in
    select gf.*, gs.url as site_url from public.guardian_flows gf
    join public.guardian_sites gs on gs.id = gf.site_id
    where gf.active and gs.active and gf.next_run_at <= now()
      and (split_part(gs.url,'/',1) || '//' || split_part(gs.url,'/',3)) = any(p_origins)
      and not exists (select 1 from public.guardian_flow_runs gr
        where gr.flow_id = gf.id and gr.status = 'running' and gr.lease_expires_at > now())
    order by gf.next_run_at, gf.id limit greatest(1,least(coalesce(p_limit,1),5))
    for update of gf skip locked
  loop
    update public.guardian_flow_runs gr set status = 'inconclusive', completed_at = now(),
      details = jsonb_build_object('error','Köraren slutförde inte kontrollen inom tio minuter.')
      where gr.flow_id = f.id and gr.status = 'running' and gr.lease_expires_at <= now();
    insert into public.guardian_flow_runs(flow_id,lease_expires_at,steps_snapshot)
      values(f.id, now() + interval '10 minutes', f.steps) returning * into r;
    update public.guardian_flows gf set last_run_at = now(),
      next_run_at = now() + make_interval(mins => f.check_interval_minutes) where gf.id = f.id;
    run_id := r.id; lease_token := r.lease_token; lease_expires_at := r.lease_expires_at;
    flow_id := f.id; name := f.name; site_id := f.site_id; site_url := f.site_url; steps := f.steps;
    return next;
  end loop;
end $$;

create function public.guardian_complete_flow(p_run_id uuid,p_lease_token uuid,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path = public
as $$
declare r public.guardian_flow_runs%rowtype; previous public.guardian_flow_runs%rowtype;
  parent_id uuid; state text;
begin
  select gr.flow_id into parent_id from public.guardian_flow_runs gr where gr.id = p_run_id;
  if parent_id is null then raise exception 'GUARDIAN_RUN_NOT_FOUND'; end if;
  perform 1 from public.guardian_flows gf where gf.id = parent_id for update;
  select * into r from public.guardian_flow_runs gr where gr.id = p_run_id for update;
  if r.lease_token <> p_lease_token then raise exception 'GUARDIAN_LEASE_INVALID'; end if;
  if r.status in ('passed','failed','flaky') or (r.status = 'inconclusive' and r.details->>'reported' = 'true') then
    return jsonb_build_object('ok',true,'idempotent',true,'incident_state',r.incident_state);
  end if;
  if r.status <> 'running' or r.lease_expires_at <= now() then raise exception 'GUARDIAN_LEASE_EXPIRED'; end if;
  if (p_result->>'status' not in ('passed','failed','flaky','inconclusive'))
    or (p_result->>'status' = 'inconclusive' and (p_result->>'attempts')::integer <> 0)
    or (p_result->>'status' <> 'inconclusive' and coalesce((p_result->>'attempts')::integer,0) not in (1,2))
    then raise exception 'GUARDIAN_RESULT_INVALID'; end if;
  select * into previous from public.guardian_flow_runs gr where gr.flow_id = parent_id
    and gr.status in ('passed','failed','flaky') order by gr.created_at desc limit 1;
  state := case
    when p_result->>'status' = 'inconclusive' then 'unknown'
    when p_result->>'status' = 'flaky' then 'flaky'
    when p_result->>'status' = 'failed' and previous.status = 'failed' then 'confirmed_failure'
    when p_result->>'status' = 'failed' then 'first_failure'
    when previous.status in ('failed','flaky') then 'recovered'
    else 'healthy' end;
  update public.guardian_flow_runs gr set status = p_result->>'status',
    incident_state = state, attempts = (p_result->>'attempts')::integer,
    duration_ms = (p_result->>'duration_ms')::integer,
    details = (p_result - 'status' - 'attempts' - 'duration_ms') || '{"reported":true}'::jsonb, completed_at = now() where gr.id = p_run_id;
  return jsonb_build_object('ok',true,'idempotent',false,'incident_state',state);
end $$;

-- Atomic edit/queue prevents an active runner using a different definition than its snapshot.
create function public.guardian_edit_flow(p_id uuid,p_changes jsonb)
returns void language plpgsql security invoker set search_path = public
as $$
declare f public.guardian_flows%rowtype;
begin
  select * into f from public.guardian_flows where id = p_id for update;
  if not found then raise exception 'GUARDIAN_FLOW_NOT_FOUND'; end if;
  if exists(select 1 from public.guardian_flow_runs where flow_id = p_id and status = 'running' and lease_expires_at > now())
    then raise exception 'GUARDIAN_FLOW_BUSY'; end if;
  if p_changes ? 'queue' and (not f.active or not exists(select 1 from public.guardian_sites where id = f.site_id and active))
    then raise exception 'GUARDIAN_FLOW_PAUSED'; end if;
  update public.guardian_flows set
    name = case when p_changes ? 'name' then p_changes->>'name' else name end,
    steps = case when p_changes ? 'steps' then p_changes->'steps' else steps end,
    check_interval_minutes = case when p_changes ? 'check_interval_minutes' then (p_changes->>'check_interval_minutes')::integer else check_interval_minutes end,
    active = case when p_changes ? 'active' then (p_changes->>'active')::boolean else active end,
    next_run_at = case when p_changes ? 'queue' or p_changes ? 'steps' or (p_changes->>'active')::boolean then now() else next_run_at end,
    updated_at = now() where id = p_id;
end $$;
revoke all on function public.guardian_claim_flows(integer,text[]) from public,anon,authenticated;
revoke all on function public.guardian_complete_flow(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.guardian_edit_flow(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.guardian_claim_flows(integer,text[]) to service_role;
grant execute on function public.guardian_complete_flow(uuid,uuid,jsonb) to service_role;
grant execute on function public.guardian_edit_flow(uuid,jsonb) to service_role;
