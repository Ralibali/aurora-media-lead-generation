CREATE OR REPLACE FUNCTION public.memberships_keep_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Cascading deletes from an organisation removal run nested; skip the check then.
  IF pg_trigger_depth() > 1 THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.organisations WHERE id = OLD.org_id) THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE org_id = OLD.org_id AND role = 'owner') THEN
    RAISE EXCEPTION 'Organisationen måste ha minst en owner';
  END IF;
  RETURN NULL;
END $$;
