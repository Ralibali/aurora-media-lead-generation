-- Shared support/feedback inbox in the existing Aurora Media database.
-- All browser access is mediated by admin-support; source credentials only ingest.
create table public.support_sources (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.portfolio_projects(project_id),
  source_key text not null unique check(length(source_key) between 1 and 160),
  label text not null check(length(label) between 1 and 160),
  token_sha256 text not null check(token_sha256 ~ '^[a-f0-9]{64}$'),
  active boolean not null default false,
  connection_state text not null default 'pending' check(connection_state in ('pending','connected','error','paused')),
  sync_received_at timestamptz,
  last_error text check(length(last_error)<=500),
  original_url text check(original_url is null or (original_url ~ '^https://' and length(original_url)<=1000)),
  pending_count integer not null default 0 check(pending_count>=0),
  failed_count integer not null default 0 check(failed_count>=0),
  created_at timestamptz not null default now()
);
create table public.support_cases (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.support_sources(id),
  project_id text not null references public.portfolio_projects(project_id),
  source_record_id text not null check(length(source_record_id) between 1 and 200),
  source_revision bigint not null check(source_revision>0),
  source_event_id uuid not null,
  kind text not null check(kind in ('support','feedback','email')),
  title text not null check(length(title) between 1 and 200),
  body text not null check(length(body)<=20000),
  requester_name text check(length(requester_name)<=160),
  requester_email text check(length(requester_email)<=320),
  requester_ref text check(length(requester_ref)<=200),
  source_status text check(length(source_status)<=100),
  source_priority text check(length(source_priority)<=100),
  source_reply text check(length(source_reply)<=20000),
  source_created_at timestamptz not null,
  source_updated_at timestamptz,
  source_deleted_at timestamptz,
  owner_status text not null default 'new' check(owner_status in ('new','in_progress','waiting','resolved')),
  owner_priority text not null default 'normal' check(owner_priority in ('low','normal','high','urgent')),
  assigned_to text check(length(assigned_to)<=120),
  followup_at timestamptz,
  private_notes text not null default '' check(length(private_notes)<=20000),
  reply_draft text not null default '' check(length(reply_draft)<=20000),
  version integer not null default 1 check(version>0),
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id,source_record_id)
);
create table public.support_case_events (
  id bigint generated always as identity primary key,
  case_id uuid not null references public.support_cases(id),
  actor text not null check(actor in ('source','admin')),
  event text not null check(event in ('created','updated','deleted','managed')),
  version integer not null,
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index support_sources_project on public.support_sources(project_id);
create index support_cases_project_queue on public.support_cases(project_id,owner_status,updated_at desc,id desc);
create index support_cases_recent on public.support_cases(updated_at desc,id desc);
create index support_cases_followup on public.support_cases(followup_at) where owner_status<>'resolved' and followup_at is not null;
create index support_case_events_case on public.support_case_events(case_id,created_at desc);
alter table public.support_sources enable row level security;
alter table public.support_cases enable row level security;
alter table public.support_case_events enable row level security;
revoke all on public.support_sources,public.support_cases,public.support_case_events from public,anon,authenticated;
grant select,insert,update,delete on public.support_sources,public.support_cases,public.support_case_events to service_role;
revoke all on sequence public.support_case_events_id_seq from public,anon,authenticated;
grant usage,select on sequence public.support_case_events_id_seq to service_role;

create function public.support_case_payload(p_id uuid)
returns jsonb language sql stable security invoker set search_path = ''
as $$ select (to_jsonb(c)-'source_event_id') || jsonb_build_object(
  'source_revision',c.source_revision::text,'source_key',s.source_key,'source_label',s.label)
  from public.support_cases c join public.support_sources s on s.id=c.source_id where c.id=p_id $$;

create function public.support_ingest_batch(p_source_id uuid,p_token_sha256 text,p_events jsonb,p_heartbeat jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare src public.support_sources%rowtype; current_case public.support_cases%rowtype;
  evt jsonb; rec jsonb; receipt jsonb; receipts jsonb:='[]'; outcome text; rev bigint;
  is_delete boolean; saved_id uuid; saved_version integer; stamp timestamptz:=clock_timestamp();
begin
  -- Source row serializes retry batches and authenticates again inside the transaction.
  select * into src from public.support_sources where id=p_source_id and active and token_sha256=p_token_sha256 for update;
  if not found then raise exception 'SUPPORT_SOURCE_UNAUTHORIZED'; end if;
  if jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events)>50 then raise exception 'SUPPORT_INVALID_EVENTS'; end if;
  for evt in select value from jsonb_array_elements(p_events) loop
    rev := (evt->>'revision')::bigint;
    if rev<1 or evt->>'event_type' not in ('upsert','deleted') then raise exception 'SUPPORT_INVALID_EVENT'; end if;
    is_delete := evt->>'event_type'='deleted'; rec := evt->'record';
    select * into current_case from public.support_cases where source_id=src.id and source_record_id=evt->>'record_id' for update;
    if found and rev<=current_case.source_revision then
      outcome := case when rev=current_case.source_revision then 'duplicate' else 'stale' end;
    elsif not found then
      insert into public.support_cases(source_id,project_id,source_record_id,source_revision,source_event_id,kind,title,body,
        requester_name,requester_email,requester_ref,source_status,source_priority,source_reply,source_created_at,source_updated_at,source_deleted_at)
      values(src.id,src.project_id,evt->>'record_id',rev,(evt->>'event_id')::uuid,
        case when is_delete then 'support' else rec->>'kind' end,
        case when is_delete then 'Raderat i källprojektet' else rec->>'title' end,
        case when is_delete then '' else rec->>'body' end,
        case when not is_delete then rec->>'requester_name' end,
        case when not is_delete then rec->>'requester_email' end,
        case when not is_delete then rec->>'requester_ref' end,
        case when not is_delete then rec->>'source_status' end,
        case when not is_delete then rec->>'source_priority' end,
        case when not is_delete then rec->>'source_reply' end,
        case when is_delete then stamp else (rec->>'created_at')::timestamptz end,
        case when not is_delete then (rec->>'updated_at')::timestamptz end,
        case when is_delete then stamp end)
      returning id,version into saved_id,saved_version;
      outcome:='created';
      insert into public.support_case_events(case_id,actor,event,version) values(saved_id,'source',case when is_delete then 'deleted' else 'created' end,saved_version);
    else
      -- Deliberately excludes project assignment and every private management field.
      update public.support_cases set source_revision=rev,source_event_id=(evt->>'event_id')::uuid,
        kind=case when is_delete then kind else rec->>'kind' end,
        title=case when is_delete then 'Raderat i källprojektet' else rec->>'title' end,
        body=case when is_delete then '' else rec->>'body' end,
        requester_name=case when not is_delete then rec->>'requester_name' end,
        requester_email=case when not is_delete then rec->>'requester_email' end,
        requester_ref=case when not is_delete then rec->>'requester_ref' end,
        source_status=case when not is_delete then rec->>'source_status' end,
        source_priority=case when not is_delete then rec->>'source_priority' end,
        source_reply=case when not is_delete then rec->>'source_reply' end,
        source_updated_at=case when not is_delete then (rec->>'updated_at')::timestamptz end,
        source_deleted_at=case when is_delete then stamp end,
        version=version+1,updated_at=stamp
        where id=current_case.id returning id,version into saved_id,saved_version;
      outcome:='updated';
      insert into public.support_case_events(case_id,actor,event,version) values(saved_id,'source',case when is_delete then 'deleted' else 'updated' end,saved_version);
    end if;
    receipt:=jsonb_build_object('event_id',evt->>'event_id','record_id',evt->>'record_id','revision',rev::text,'outcome',outcome);
    receipts:=receipts||jsonb_build_array(receipt);
  end loop;
  update public.support_sources set sync_received_at=stamp,
    pending_count=coalesce((p_heartbeat->>'pending_count')::integer,0),
    failed_count=coalesce((p_heartbeat->>'failed_count')::integer,0),
    connection_state=case when coalesce((p_heartbeat->>'failed_count')::integer,0)>0 or nullif(p_heartbeat->>'last_error','') is not null then 'error' else 'connected' end,
    last_error=case when coalesce((p_heartbeat->>'failed_count')::integer,0)>0 or nullif(p_heartbeat->>'last_error','') is not null then 'Källan rapporterar synkfel. Kontrollera anslutningen.' end
    where id=src.id;
  return jsonb_build_object('ok',true,'source_id',src.id,'received_at',stamp,'acknowledged',receipts);
end $$;

create function public.support_update_case(p_id uuid,p_expected_version integer,p_patch jsonb)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare current_case public.support_cases%rowtype; fields text[];
begin
  select * into current_case from public.support_cases where id=p_id for update;
  if not found then raise exception 'SUPPORT_CASE_NOT_FOUND'; end if;
  if current_case.version<>p_expected_version then raise exception 'SUPPORT_VERSION_CONFLICT'; end if;
  select array_agg(key) into fields from jsonb_object_keys(p_patch) key;
  if fields is null or not fields <@ array['project_id','owner_status','owner_priority','assigned_to','followup_at','private_notes','reply_draft'] then raise exception 'SUPPORT_INVALID_PATCH'; end if;
  update public.support_cases set
    project_id=case when p_patch?'project_id' then p_patch->>'project_id' else project_id end,
    owner_status=case when p_patch?'owner_status' then p_patch->>'owner_status' else owner_status end,
    owner_priority=case when p_patch?'owner_priority' then p_patch->>'owner_priority' else owner_priority end,
    assigned_to=case when p_patch?'assigned_to' then p_patch->>'assigned_to' else assigned_to end,
    followup_at=case when p_patch?'followup_at' then (p_patch->>'followup_at')::timestamptz else followup_at end,
    private_notes=case when p_patch?'private_notes' then p_patch->>'private_notes' else private_notes end,
    reply_draft=case when p_patch?'reply_draft' then p_patch->>'reply_draft' else reply_draft end,
    version=version+1,updated_at=clock_timestamp() where id=p_id;
  insert into public.support_case_events(case_id,actor,event,version,changed_fields) values(p_id,'admin','managed',current_case.version+1,fields);
  return public.support_case_payload(p_id);
end $$;

create function public.support_list_cases(p_filters jsonb default '{}')
returns jsonb language sql stable security invoker set search_path = ''
as $$
with filtered as (
  select c.* from public.support_cases c where
    (p_filters->>'project_id' is null or c.project_id=p_filters->>'project_id')
    and (p_filters->>'source_id' is null or c.source_id=(p_filters->>'source_id')::uuid)
    and (p_filters->>'owner_status' is null or c.owner_status=p_filters->>'owner_status')
    and (p_filters->>'kind' is null or c.kind=p_filters->>'kind')
    and (p_filters->>'query' is null or position(lower(p_filters->>'query') in lower(c.title||' '||c.body||' '||coalesce(c.requester_name,'')||' '||coalesce(c.requester_email,'')))>0)
), page as (
  select * from filtered where p_filters->'cursor' is null or
    (updated_at,id)<((p_filters->'cursor'->>'updated_at')::timestamptz,(p_filters->'cursor'->>'id')::uuid)
  order by updated_at desc,id desc limit least(50,greatest(1,coalesce((p_filters->>'limit')::integer,30)))+1
), project_totals as (
  select project_id,count(*) total,count(*) filter(where owner_status<>'resolved' and source_deleted_at is null) open from public.support_cases group by project_id
)
select jsonb_build_object(
  'cases',coalesce((select jsonb_agg(public.support_case_payload(id) order by updated_at desc,id desc) from page),'[]'::jsonb),
  'counts',(select jsonb_build_object('scope','all_matching_filters','total',count(*),
    'new',count(*) filter(where owner_status='new'),'in_progress',count(*) filter(where owner_status='in_progress'),
    'waiting',count(*) filter(where owner_status='waiting'),'resolved',count(*) filter(where owner_status='resolved'),
    'overdue',count(*) filter(where followup_at<now() and owner_status<>'resolved' and source_deleted_at is null)) from filtered),
  'project_counts',coalesce((select jsonb_object_agg(project_id,jsonb_build_object('total',total,'open',open)) from project_totals),'{}'::jsonb)
) $$;

revoke all on function public.support_case_payload(uuid) from public,anon,authenticated;
revoke all on function public.support_ingest_batch(uuid,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.support_update_case(uuid,integer,jsonb) from public,anon,authenticated;
revoke all on function public.support_list_cases(jsonb) from public,anon,authenticated;
grant execute on function public.support_case_payload(uuid) to service_role;
grant execute on function public.support_ingest_batch(uuid,text,jsonb,jsonb) to service_role;
grant execute on function public.support_update_case(uuid,integer,jsonb) to service_role;
grant execute on function public.support_list_cases(jsonb) to service_role;
