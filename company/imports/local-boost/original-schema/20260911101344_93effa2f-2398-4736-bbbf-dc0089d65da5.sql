
revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
revoke execute on function public.is_staff(uuid) from anon, public;
revoke execute on function public.is_org_member(uuid, uuid) from anon, public;
revoke execute on function public.can_read_org(uuid) from anon, public;
revoke execute on function public.location_org(uuid) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;
grant execute on function public.is_org_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_read_org(uuid) to authenticated, service_role;
grant execute on function public.location_org(uuid) to authenticated, service_role;
