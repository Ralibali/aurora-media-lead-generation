alter table public.guardian_sites
  add column if not exists check_interval_minutes integer not null default 60,
  add column if not exists notify_email text not null default '',
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_notified_state text not null default 'none',
  add column if not exists last_notified_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'guardian_sites_interval_check'
  ) then
    alter table public.guardian_sites
      add constraint guardian_sites_interval_check
      check (check_interval_minutes in (15, 60, 360, 1440));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'guardian_sites_notify_email_length'
  ) then
    alter table public.guardian_sites
      add constraint guardian_sites_notify_email_length
      check (length(notify_email) <= 320);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'guardian_sites_notification_state_check'
  ) then
    alter table public.guardian_sites
      add constraint guardian_sites_notification_state_check
      check (last_notified_state in ('none', 'incident', 'healthy'));
  end if;
end
$$;

create index if not exists guardian_sites_due
  on public.guardian_sites(active, last_checked_at, check_interval_minutes);
