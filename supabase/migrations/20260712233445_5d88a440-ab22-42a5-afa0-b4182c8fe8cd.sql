CREATE INDEX IF NOT EXISTS idx_leads_ip_created_at
  ON public.leads (ip, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_email_created_at
  ON public.leads (email, created_at DESC);

CREATE OR REPLACE FUNCTION public.try_contact_rate_limit(
  p_ip text,
  p_email text,
  p_max_per_ip integer DEFAULT 5,
  p_max_per_email integer DEFAULT 3,
  p_window_seconds integer DEFAULT 3600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_ip_count integer := 0;
  v_email_count integer := 0;
  v_lock_key bigint;
  v_since timestamptz;
BEGIN
  v_since := now() - make_interval(secs => p_window_seconds);
  v_lock_key := hashtextextended(
    'contact_rl:' || coalesce(p_ip, '-') || '|' || coalesce(lower(p_email), '-'),
    0
  );
  PERFORM pg_advisory_xact_lock(v_lock_key);

  IF p_ip IS NOT NULL AND p_ip <> '' AND p_ip <> 'unknown' THEN
    SELECT count(*) INTO v_ip_count
    FROM public.leads
    WHERE ip = p_ip AND created_at > v_since;
    IF v_ip_count >= p_max_per_ip THEN
      RETURN false;
    END IF;
  END IF;

  IF p_email IS NOT NULL AND p_email <> '' THEN
    SELECT count(*) INTO v_email_count
    FROM public.leads
    WHERE lower(email) = lower(p_email) AND created_at > v_since;
    IF v_email_count >= p_max_per_email THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.try_contact_rate_limit(text, text, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.try_contact_rate_limit(text, text, integer, integer, integer) TO service_role;