-- Defense-in-depth: these tables are only ever accessed server-side by edge
-- functions using the service role. RLS is enabled with zero policies
-- (fail-closed), so anon/authenticated already had no access; revoking the
-- unused table grants removes the remaining latent surface.
REVOKE ALL ON public.leads FROM anon, authenticated;
REVOKE ALL ON public.ai_map_leads FROM anon, authenticated;
REVOKE ALL ON public.genomlysning_leads FROM anon, authenticated;
REVOKE ALL ON public.prospecting_leads FROM anon, authenticated;
REVOKE ALL ON public.prospecting_campaigns FROM anon, authenticated;
REVOKE ALL ON public.email_templates FROM anon, authenticated;

GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.ai_map_leads TO service_role;
GRANT ALL ON public.genomlysning_leads TO service_role;
GRANT ALL ON public.prospecting_leads TO service_role;
GRANT ALL ON public.prospecting_campaigns TO service_role;
GRANT ALL ON public.email_templates TO service_role;