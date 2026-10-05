-- One fixed, read-only Titan mailbox. No password is stored in an application table.
create schema if not exists support_mailbox_private;
revoke all on schema support_mailbox_private from public,anon,authenticated;
grant usage on schema support_mailbox_private to service_role;

create table public.support_mailbox_connection (
  id boolean primary key default true check(id),
  address text not null default 'info@auroramedia.se' check(address='info@auroramedia.se'),
  source_id uuid references public.support_sources(id),
  credential_secret_id uuid,
  worker_token_sha256 text not null check(worker_token_sha256 ~ '^[a-f0-9]{64}$'),
  enabled boolean not null default false,
  uid_validity text check(uid_validity ~ '^[0-9]{1,10}$'),
  last_uid bigint not null default 0 check(last_uid between 0 and 4294967295),
  initial_since timestamptz,
  initial_through_uid bigint check(initial_through_uid between 0 and 4294967295),
  lease_token uuid,
  lease_until timestamptz,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_error text check(last_error in ('auth','timeout','connection','storage')),
  last_imported_count integer not null default 0 check(last_imported_count between 0 and 20),
  more_pending boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.support_mailbox_connection enable row level security;
revoke all on public.support_mailbox_connection from public,anon,authenticated;
grant select,insert,update on public.support_mailbox_connection to service_role;

-- Generated inside the database; only pg_cron reads this worker token from Vault.
do $$ declare worker_secret text; begin
  worker_secret:=encode(extensions.gen_random_bytes(32),'hex');
  perform vault.create_secret(worker_secret,'support_mailbox_worker','Internal mailbox worker; not a mailbox password');
  insert into public.support_mailbox_connection(id,worker_token_sha256)
    values(true,encode(extensions.digest(worker_secret,'sha256'),'hex'));
end $$;

create function public.support_mailbox_status()
returns jsonb language sql stable security invoker set search_path=''
as $$ select jsonb_build_object('address',address,'configured',credential_secret_id is not null,
  'enabled',enabled,'syncing',coalesce(lease_until>clock_timestamp(),false),'last_attempt_at',last_attempt_at,
  'last_success_at',last_success_at,'last_error',last_error,'last_imported_count',last_imported_count,
  'more_pending',more_pending) from public.support_mailbox_connection where id $$;

-- Vault access lives outside the exposed schema. The invoker wrapper below is service-only.
create function support_mailbox_private.configure(p_password text,p_enabled boolean)
returns jsonb language plpgsql security definer set search_path=''
as $$ declare cfg public.support_mailbox_connection%rowtype; secret_id uuid; src uuid;
begin
  select * into cfg from public.support_mailbox_connection where id for update;
  if cfg.lease_until>clock_timestamp() then raise exception 'MAILBOX_BUSY'; end if;
  if p_password is not null and (length(p_password)<1 or length(p_password)>1024) then raise exception 'MAILBOX_INVALID_PASSWORD'; end if;
  secret_id:=cfg.credential_secret_id;
  if p_password is not null then
    if secret_id is null then
      select vault.create_secret(p_password,'support_mailbox_titan_password','Owner-entered Titan credential') into secret_id;
    else perform vault.update_secret(secret_id,p_password); end if;
  end if;
  if p_enabled and secret_id is null then raise exception 'MAILBOX_NOT_CONFIGURED'; end if;
  src:=cfg.source_id;
  if p_enabled and src is null then
    insert into public.support_sources(project_id,source_key,label,token_sha256,active,original_url)
      values('auroramedia-se','titan:info@auroramedia.se:inbox','info@auroramedia.se',
        encode(extensions.digest(extensions.gen_random_bytes(32),'sha256'),'hex'),true,'https://app.titan.email/')
      on conflict(source_key) do update set active=true
      returning id into src;
  end if;
  update public.support_mailbox_connection set credential_secret_id=secret_id,source_id=src,enabled=p_enabled,
    last_error=null,updated_at=clock_timestamp() where id;
  update public.support_sources set active=p_enabled,connection_state=case when p_enabled then 'pending' else 'paused' end,last_error=null where id=src;
  return public.support_mailbox_status();
end $$;

create function public.support_mailbox_configure(p_password text default null,p_enabled boolean default true)
returns jsonb language sql security invoker set search_path=''
as $$ select support_mailbox_private.configure(p_password,p_enabled) $$;

create function support_mailbox_private.claim()
returns jsonb language plpgsql security definer set search_path=''
as $$ declare cfg public.support_mailbox_connection%rowtype; token uuid:=gen_random_uuid(); password text; source_hash text;
begin
  select * into cfg from public.support_mailbox_connection where id for update;
  if not cfg.enabled or cfg.credential_secret_id is null or cfg.source_id is null then return null; end if;
  if cfg.lease_until>clock_timestamp() or cfg.last_attempt_at>clock_timestamp()-interval '20 seconds' then return null; end if;
  select decrypted_secret into password from vault.decrypted_secrets where id=cfg.credential_secret_id;
  select token_sha256 into source_hash from public.support_sources where id=cfg.source_id and active;
  if password is null or source_hash is null then raise exception 'MAILBOX_NOT_CONFIGURED'; end if;
  update public.support_mailbox_connection set lease_token=token,lease_until=clock_timestamp()+interval '2 minutes',
    last_attempt_at=clock_timestamp(),updated_at=clock_timestamp() where id;
  return jsonb_build_object('lease_token',token,'password',password,'source_id',cfg.source_id,
    'source_hash',source_hash,'uid_validity',cfg.uid_validity,'last_uid',cfg.last_uid,
    'initial_since',cfg.initial_since,'initial_through_uid',cfg.initial_through_uid);
end $$;

create function public.support_mailbox_claim()
returns jsonb language sql security invoker set search_path=''
as $$ select support_mailbox_private.claim() $$;

create function public.support_mailbox_finish(p_lease_token uuid,p_uid_validity text,p_last_uid bigint,
  p_initial_since timestamptz,p_initial_through_uid bigint,p_imported integer,p_more boolean,p_error text default null)
returns boolean language plpgsql security invoker set search_path=''
as $$ declare cfg public.support_mailbox_connection%rowtype;
begin
  select * into cfg from public.support_mailbox_connection where id and lease_token=p_lease_token
    and lease_until>clock_timestamp() for update;
  if not found then return false; end if;
  if p_error is not null and p_error not in ('auth','timeout','connection','storage') then raise exception 'MAILBOX_INVALID_ERROR'; end if;
  if p_error is null and (not cfg.enabled or p_uid_validity is null or p_last_uid is null
    or (cfg.uid_validity=p_uid_validity and p_last_uid<cfg.last_uid)) then raise exception 'MAILBOX_INVALID_CHECKPOINT'; end if;
  update public.support_mailbox_connection set lease_token=null,lease_until=null,
    uid_validity=case when p_error is null then p_uid_validity else uid_validity end,
    last_uid=case when p_error is null then p_last_uid else last_uid end,
    initial_since=case when p_error is null then p_initial_since else initial_since end,
    initial_through_uid=case when p_error is null then p_initial_through_uid else initial_through_uid end,
    last_success_at=case when p_error is null then clock_timestamp() else last_success_at end,
    last_error=p_error,last_imported_count=case when p_error is null then p_imported else last_imported_count end,
    more_pending=case when p_error is null then p_more else more_pending end,updated_at=clock_timestamp() where id;
  if p_error is not null then
    update public.support_sources set connection_state='error',last_error='Mejlen kunde inte uppdateras. Kontrollera anslutningen under E-post.' where id=cfg.source_id;
  end if;
  return true;
end $$;

revoke all on function public.support_mailbox_status() from public,anon,authenticated;
revoke all on function public.support_mailbox_configure(text,boolean) from public,anon,authenticated;
revoke all on function public.support_mailbox_claim() from public,anon,authenticated;
revoke all on function public.support_mailbox_finish(uuid,text,bigint,timestamptz,bigint,integer,boolean,text) from public,anon,authenticated;
revoke all on function support_mailbox_private.configure(text,boolean) from public,anon,authenticated;
revoke all on function support_mailbox_private.claim() from public,anon,authenticated;
grant execute on function public.support_mailbox_status(),public.support_mailbox_configure(text,boolean),public.support_mailbox_claim(),
  public.support_mailbox_finish(uuid,text,bigint,timestamptz,bigint,integer,boolean,text),
  support_mailbox_private.configure(text,boolean),support_mailbox_private.claim() to service_role;

-- pg_cron and pg_net already power existing Aurora background jobs. Password stays in Vault.
create function support_mailbox_private.enqueue_sync()
returns void language plpgsql security invoker set search_path=''
as $$ begin
  if exists(select 1 from public.support_mailbox_connection where id and enabled and credential_secret_id is not null
      and (lease_until is null or lease_until<clock_timestamp())) then
    perform net.http_post(
      url:='https://cyymcdqkpvcvwjoqxbco.supabase.co/functions/v1/admin-support-mailbox',
      headers:=jsonb_build_object('Content-Type','application/json','x-support-mailbox-worker',
        (select decrypted_secret from vault.decrypted_secrets where name='support_mailbox_worker')),
      body:='{"action":"sync"}'::jsonb,timeout_milliseconds:=85000);
  end if;
end $$;
revoke all on function support_mailbox_private.enqueue_sync() from public,anon,authenticated,service_role;
select cron.schedule('support-mailbox-sync','*/5 * * * *','select support_mailbox_private.enqueue_sync();');
