CREATE OR REPLACE FUNCTION public.write_audit(_org uuid, _action text, _entity text, _entity_id text, _details jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Skip when the organisation itself is being removed (cascade).
  IF NOT EXISTS (SELECT 1 FROM public.organisations WHERE id = _org) OR pg_trigger_depth() > 2 THEN RETURN; END IF;
  INSERT INTO public.audit_log(org_id, actor_id, action, entity, entity_id, details)
  VALUES (_org, auth.uid(), _action, _entity, _entity_id, coalesce(_details,'{}'::jsonb));
END $$;
REVOKE EXECUTE ON FUNCTION public.write_audit(uuid,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
