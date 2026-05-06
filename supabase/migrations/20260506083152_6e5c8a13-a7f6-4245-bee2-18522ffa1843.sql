
CREATE OR REPLACE FUNCTION public.upsert_vault_secret(p_name text, p_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM vault.secrets WHERE name = p_name;
  IF v_id IS NULL THEN
    SELECT vault.create_secret(p_value, p_name) INTO v_id;
  ELSE
    PERFORM vault.update_secret(v_id, p_value, p_name);
  END IF;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_vault_secret(text, text) FROM public, anon, authenticated;
