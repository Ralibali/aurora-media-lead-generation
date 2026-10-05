-- Operational notes stay inside the existing private project registry.
create function public.portfolio_update_management(p_project_id text,p_expected_version bigint,p_management jsonb)
returns jsonb language plpgsql security invoker set search_path=public
as $$
declare current_payload jsonb; current_version bigint; next_management jsonb; followup text;
begin
  if p_expected_version is null or p_expected_version < 0 or p_management is null or jsonb_typeof(p_management) <> 'object'
    or p_management - array['note','nextAction','followupDate'] <> '{}'::jsonb
    or jsonb_typeof(p_management->'note') is distinct from 'string'
    or jsonb_typeof(p_management->'nextAction') is distinct from 'string'
    or length(p_management->>'note') > 2000 or length(p_management->>'nextAction') > 500
    or not (p_management ? 'followupDate')
    or jsonb_typeof(p_management->'followupDate') not in ('string','null')
    then raise exception 'PORTFOLIO_MANAGEMENT_INVALID'; end if;
  followup := p_management->>'followupDate';
  if followup is not null and (followup !~ '^\d{4}-\d{2}-\d{2}$' or to_char(followup::date,'YYYY-MM-DD') <> followup)
    then raise exception 'PORTFOLIO_MANAGEMENT_INVALID'; end if;
  select payload into current_payload from public.portfolio_projects where project_id=p_project_id for update;
  if not found then raise exception 'PORTFOLIO_PROJECT_NOT_FOUND'; end if;
  current_version := coalesce((current_payload->'management'->>'version')::bigint,0);
  if current_version <> p_expected_version then raise exception 'PORTFOLIO_VERSION_CONFLICT'; end if;
  next_management := jsonb_build_object('note',btrim(p_management->>'note'),'nextAction',btrim(p_management->>'nextAction'),'followupDate',followup,'version',current_version+1);
  update public.portfolio_projects set payload=jsonb_set(payload,'{management}',next_management),updated_at=now() where project_id=p_project_id;
  return next_management;
end $$;
revoke all on function public.portfolio_update_management(text,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.portfolio_update_management(text,bigint,jsonb) to service_role;
