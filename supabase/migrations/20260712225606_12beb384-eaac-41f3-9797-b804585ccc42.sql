
REVOKE ALL ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.try_prospecting_rate_limit(uuid, integer, integer) TO service_role;
