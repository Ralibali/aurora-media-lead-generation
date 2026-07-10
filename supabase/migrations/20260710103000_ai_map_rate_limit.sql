-- Defense-in-depth rate limiting for public AI-map submissions.
-- The application should still reject abusive requests before paid AI calls;
-- this trigger prevents repeated database inserts and downstream mail/drip spam.

create or replace function public.enforce_ai_map_lead_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_ip_count integer := 0;
  recent_email_count integer := 0;
begin
  if new.ip is not null and new.ip <> '' and new.ip <> 'unknown' then
    select count(*) into recent_ip_count
    from public.ai_map_leads
    where ip = new.ip
      and created_at >= now() - interval '1 hour';
  end if;

  if new.email is not null and new.email <> '' then
    select count(*) into recent_email_count
    from public.ai_map_leads
    where lower(email) = lower(new.email)
      and created_at >= now() - interval '24 hours';
  end if;

  if recent_ip_count >= 5 then
    raise exception 'RATE_LIMIT_IP' using errcode = 'P0001';
  end if;

  if recent_email_count >= 3 then
    raise exception 'RATE_LIMIT_EMAIL' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ai_map_lead_rate_limit on public.ai_map_leads;
create trigger trg_ai_map_lead_rate_limit
before insert on public.ai_map_leads
for each row execute function public.enforce_ai_map_lead_rate_limit();

create index if not exists idx_ai_map_leads_ip_created_at
  on public.ai_map_leads (ip, created_at desc);

create index if not exists idx_ai_map_leads_lower_email_created_at
  on public.ai_map_leads (lower(email), created_at desc);
