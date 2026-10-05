alter type public.vertical add value if not exists 'hantverk';
alter type public.vertical add value if not exists 'bilverkstad';
alter type public.vertical add value if not exists 'salong';
alter type public.vertical add value if not exists 'klinik';

do $$ begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type public.org_role as enum ('owner', 'admin', 'sales', 'agent_viewer');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'delivery_status') then
    create type public.delivery_status as enum ('pending', 'sent', 'failed', 'skipped');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'suggestion_status') then
    create type public.suggestion_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;
