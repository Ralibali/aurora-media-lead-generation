REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_aurora_staff(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_org_member(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.can_read_org(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_aurora_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_read_org(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
