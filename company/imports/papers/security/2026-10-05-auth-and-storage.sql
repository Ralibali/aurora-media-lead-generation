-- Aurora Receipt / existing Aurora Papers project
-- Security correction prepared 2026-10-05 for integration into an existing repository.
-- Authentication comes only from the authenticated user id plus authoritative Auth rows.
BEGIN;

CREATE OR REPLACE FUNCTION public.accept_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  inv record;
  n integer := 0;
  em text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  SELECT lower(u.email) INTO em
  FROM auth.users AS u
  WHERE u.id = uid AND u.email_confirmed_at IS NOT NULL;
  IF em IS NULL THEN RETURN 0; END IF;

  FOR inv IN
    SELECT * FROM public.invitations
    WHERE lower(email) = em AND accepted_at IS NULL
    FOR UPDATE
  LOOP
    INSERT INTO public.memberships(org_id, user_id, email, role)
      VALUES (inv.org_id, uid, em, inv.role)
      ON CONFLICT (org_id, user_id) DO NOTHING;
    UPDATE public.invitations SET accepted_at = now() WHERE id = inv.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.accept_invitations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitations() TO authenticated, service_role;

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
WHERE id = 'originals';

COMMIT;
