CREATE TYPE public.org_role AS ENUM ('owner','admin','reviewer');
CREATE TYPE public.doc_status AS ENUM ('new','needs_review','approved','exported');

CREATE TABLE public.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  org_number text,
  is_demo boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text,
  role public.org_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'reviewer' CHECK (role <> 'owner'),
  invited_by uuid NOT NULL DEFAULT auth.uid(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);
CREATE TABLE public.exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  document_count integer NOT NULL DEFAULT 0,
  csv text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  status public.doc_status NOT NULL DEFAULT 'new',
  storage_path text,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  file_hash text,
  vendor text,
  invoice_number text,
  invoice_date date,
  due_date date,
  net_amount numeric(14,2),
  vat_amount numeric(14,2),
  gross_amount numeric(14,2),
  currency text NOT NULL DEFAULT 'SEK',
  ocr_reference text,
  notes text,
  extraction_provider text,
  extraction_note text,
  duplicate_of uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  applied_rule_id uuid,
  uploaded_by uuid NOT NULL,
  approved_by uuid,
  approved_at timestamptz,
  export_id uuid REFERENCES public.exports(id) ON DELETE SET NULL,
  exported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX documents_org_status_idx ON public.documents(org_id, status);
CREATE INDEX documents_org_hash_idx ON public.documents(org_id, file_hash);
CREATE TABLE public.vendor_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  match_text text NOT NULL CHECK (char_length(match_text) BETWEEN 2 AND 100),
  vendor_name text NOT NULL CHECK (char_length(vendor_name) BETWEEN 1 AND 200),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_org_idx ON public.audit_log(org_id, created_at DESC);
CREATE TABLE public.billing_state (
  org_id uuid PRIMARY KEY REFERENCES public.organisations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'none',
  status text NOT NULL DEFAULT 'not_activated',
  provider_customer_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.organisations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.invitations TO authenticated;
GRANT SELECT, UPDATE ON public.exports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_rules TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT ON public.billing_state TO authenticated;
GRANT ALL ON public.organisations, public.memberships, public.invitations, public.exports, public.documents, public.vendor_rules, public.audit_log, public.billing_state TO service_role;

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_state ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE org_id = _org AND user_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.has_org_role(_org uuid, _roles public.org_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE org_id = _org AND user_id = auth.uid() AND role = ANY(_roles))
$$;
CREATE OR REPLACE FUNCTION public.is_org_member_text(_org text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE org_id::text = _org AND user_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.has_org_role_text(_org text, _roles public.org_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE org_id::text = _org AND user_id = auth.uid() AND role = ANY(_roles))
$$;

CREATE POLICY org_select ON public.organisations FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY org_update ON public.organisations FOR UPDATE TO authenticated
  USING (public.has_org_role(id, ARRAY['owner','admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY mem_select ON public.memberships FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY mem_update ON public.memberships FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]));
CREATE POLICY mem_delete ON public.memberships FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]) OR user_id = auth.uid());

CREATE POLICY inv_select ON public.invitations FOR SELECT TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]) OR lower(email) = lower(auth.jwt()->>'email'));
CREATE POLICY inv_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]) AND invited_by = auth.uid());
CREATE POLICY inv_delete ON public.invitations FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY doc_select ON public.documents FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY doc_insert ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id) AND uploaded_by = auth.uid() AND status = 'new');
CREATE POLICY doc_update ON public.documents FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE POLICY doc_delete ON public.documents FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]) AND status <> 'exported');

CREATE POLICY vr_select ON public.vendor_rules FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY vr_insert ON public.vendor_rules FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]));
CREATE POLICY vr_update ON public.vendor_rules FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]));
CREATE POLICY vr_delete ON public.vendor_rules FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY exp_select ON public.exports FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY exp_update ON public.exports FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]) AND csv IS NULL)
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY audit_select ON public.audit_log FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY billing_select ON public.billing_state FOR SELECT TO authenticated USING (public.is_org_member(org_id));

-- Audit helper
CREATE OR REPLACE FUNCTION public.write_audit(_org uuid, _action text, _entity text, _entity_id text, _details jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_log(org_id, actor_id, action, entity, entity_id, details)
  VALUES (_org, auth.uid(), _action, _entity, _entity_id, coalesce(_details,'{}'::jsonb))
$$;
REVOKE EXECUTE ON FUNCTION public.write_audit(uuid,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;

-- Document guard: immutables, insert rules, status transitions
CREATE OR REPLACE FUNCTION public.documents_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE demo boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT is_demo INTO demo FROM public.organisations WHERE id = NEW.org_id;
    IF NOT coalesce(demo,false) AND NEW.status <> 'new' THEN
      RAISE EXCEPTION 'Nya dokument måste börja i status new';
    END IF;
    IF NEW.storage_path IS NOT NULL AND split_part(NEW.storage_path,'/',1) <> NEW.org_id::text THEN
      RAISE EXCEPTION 'Filens sökväg tillhör inte organisationen';
    END IF;
    NEW.approved_by := NULL; NEW.approved_at := NULL; NEW.export_id := NULL; NEW.exported_at := NULL;
    IF NEW.status = 'approved' THEN NEW.approved_at := now(); END IF;
    RETURN NEW;
  END IF;

  IF NEW.org_id <> OLD.org_id OR NEW.uploaded_by <> OLD.uploaded_by
     OR NEW.storage_path IS DISTINCT FROM OLD.storage_path
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Fältet kan inte ändras';
  END IF;
  IF OLD.file_hash IS NOT NULL AND NEW.file_hash IS DISTINCT FROM OLD.file_hash THEN
    RAISE EXCEPTION 'Filhash kan inte ändras';
  END IF;
  IF OLD.status = 'exported' THEN
    RAISE EXCEPTION 'Exporterade dokument är låsta';
  END IF;
  IF NEW.export_id IS DISTINCT FROM OLD.export_id OR NEW.exported_at IS DISTINCT FROM OLD.exported_at THEN
    IF coalesce(current_setting('aurora.exporting', true),'') <> 'on' THEN
      RAISE EXCEPTION 'Exportfält sätts endast av exporten';
    END IF;
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'new' AND NEW.status = 'needs_review') OR
      (OLD.status = 'needs_review' AND NEW.status = 'approved') OR
      (OLD.status = 'approved' AND NEW.status = 'needs_review') OR
      (OLD.status = 'approved' AND NEW.status = 'exported' AND coalesce(current_setting('aurora.exporting', true),'') = 'on')
    ) THEN
      RAISE EXCEPTION 'Otillåten statusövergång: % -> %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'approved' THEN
      IF NEW.vendor IS NULL OR NEW.gross_amount IS NULL OR NEW.invoice_date IS NULL THEN
        RAISE EXCEPTION 'Leverantör, datum och bruttobelopp krävs för godkännande';
      END IF;
      NEW.approved_by := auth.uid(); NEW.approved_at := now();
    ELSIF NEW.status = 'needs_review' THEN
      NEW.approved_by := NULL; NEW.approved_at := NULL;
    END IF;
  ELSIF NEW.status = 'approved' AND (NEW.approved_by IS DISTINCT FROM OLD.approved_by OR NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
    RAISE EXCEPTION 'Godkännandefält kan inte ändras direkt';
  ELSIF NEW.status = 'approved' AND (
      NEW.vendor IS DISTINCT FROM OLD.vendor OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number OR
      NEW.invoice_date IS DISTINCT FROM OLD.invoice_date OR NEW.due_date IS DISTINCT FROM OLD.due_date OR
      NEW.net_amount IS DISTINCT FROM OLD.net_amount OR NEW.vat_amount IS DISTINCT FROM OLD.vat_amount OR
      NEW.gross_amount IS DISTINCT FROM OLD.gross_amount OR NEW.ocr_reference IS DISTINCT FROM OLD.ocr_reference) THEN
    RAISE EXCEPTION 'Återöppna dokumentet innan fälten ändras';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER documents_guard BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_guard();

-- Vendor rule application (on insert, only when vendor empty)
CREATE OR REPLACE FUNCTION public.documents_apply_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF NEW.vendor IS NULL THEN
    SELECT id, vendor_name INTO r FROM public.vendor_rules
      WHERE org_id = NEW.org_id AND position(lower(match_text) IN lower(NEW.file_name)) > 0
      ORDER BY char_length(match_text) DESC LIMIT 1;
    IF FOUND THEN NEW.vendor := r.vendor_name; NEW.applied_rule_id := r.id; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER documents_apply_rules BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_apply_rules();

-- Duplicate detection: same file hash, or same vendor + invoice number, within the organisation
CREATE OR REPLACE FUNCTION public.documents_detect_duplicate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT d.id INTO NEW.duplicate_of FROM public.documents d
   WHERE d.org_id = NEW.org_id AND d.id <> NEW.id AND (
     (NEW.file_hash IS NOT NULL AND d.file_hash = NEW.file_hash) OR
     (NEW.vendor IS NOT NULL AND NEW.invoice_number IS NOT NULL
       AND lower(trim(d.vendor)) = lower(trim(NEW.vendor)) AND lower(trim(d.invoice_number)) = lower(trim(NEW.invoice_number))))
   ORDER BY d.created_at ASC LIMIT 1;
  RETURN NEW;
END $$;
CREATE TRIGGER documents_zz_duplicate BEFORE INSERT OR UPDATE OF file_hash, vendor, invoice_number ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_detect_duplicate();

-- Audit triggers
CREATE OR REPLACE FUNCTION public.documents_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE changes jsonb := '{}'::jsonb; k text; o jsonb; n jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit(NEW.org_id, 'document.created', 'document', NEW.id::text,
      jsonb_build_object('file_name', NEW.file_name, 'status', NEW.status, 'duplicate_of', NEW.duplicate_of, 'rule', NEW.applied_rule_id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.write_audit(OLD.org_id, 'document.deleted', 'document', OLD.id::text, jsonb_build_object('file_name', OLD.file_name));
    RETURN OLD;
  END IF;
  o := to_jsonb(OLD); n := to_jsonb(NEW);
  FOR k IN SELECT jsonb_object_keys(n) LOOP
    IF k NOT IN ('updated_at','approved_at','approved_by') AND (o->k) IS DISTINCT FROM (n->k) THEN
      changes := changes || jsonb_build_object(k, jsonb_build_object('from', o->k, 'to', n->k));
    END IF;
  END LOOP;
  IF changes <> '{}'::jsonb THEN
    PERFORM public.write_audit(NEW.org_id,
      CASE WHEN NEW.status <> OLD.status THEN 'document.status.' || NEW.status ELSE 'document.updated' END,
      'document', NEW.id::text, changes);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER documents_audit AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_audit();

CREATE OR REPLACE FUNCTION public.generic_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec jsonb;
BEGIN
  rec := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  IF EXISTS (SELECT 1 FROM public.organisations WHERE id = (rec->>'org_id')::uuid) THEN
    PERFORM public.write_audit((rec->>'org_id')::uuid, TG_TABLE_NAME || '.' || lower(TG_OP), TG_TABLE_NAME, rec->>'id', rec - 'csv');
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER memberships_audit AFTER INSERT OR UPDATE OR DELETE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.generic_audit();
CREATE TRIGGER invitations_audit AFTER INSERT OR DELETE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.generic_audit();
CREATE TRIGGER vendor_rules_audit AFTER INSERT OR UPDATE OR DELETE ON public.vendor_rules FOR EACH ROW EXECUTE FUNCTION public.generic_audit();

-- Always keep at least one owner
CREATE OR REPLACE FUNCTION public.memberships_keep_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organisations WHERE id = OLD.org_id) THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE org_id = OLD.org_id AND role = 'owner') THEN
    RAISE EXCEPTION 'Organisationen måste ha minst en owner';
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER memberships_keep_owner AFTER UPDATE OR DELETE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.memberships_keep_owner();

CREATE OR REPLACE FUNCTION public.memberships_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.org_id <> OLD.org_id OR NEW.user_id <> OLD.user_id THEN RAISE EXCEPTION 'Fältet kan inte ändras'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER memberships_guard BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.memberships_guard();

CREATE OR REPLACE FUNCTION public.organisations_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_demo <> OLD.is_demo OR NEW.created_by <> OLD.created_by THEN RAISE EXCEPTION 'Fältet kan inte ändras'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER organisations_guard BEFORE UPDATE ON public.organisations FOR EACH ROW EXECUTE FUNCTION public.organisations_guard();

-- RPCs
CREATE OR REPLACE FUNCTION public.create_organisation(_name text, _org_number text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inte inloggad'; END IF;
  INSERT INTO public.organisations(name, org_number, created_by) VALUES (trim(_name), nullif(trim(_org_number),''), auth.uid()) RETURNING id INTO new_id;
  INSERT INTO public.memberships(org_id, user_id, email, role) VALUES (new_id, auth.uid(), auth.jwt()->>'email', 'owner');
  INSERT INTO public.billing_state(org_id) VALUES (new_id);
  PERFORM public.write_audit(new_id, 'organisation.created', 'organisation', new_id::text, jsonb_build_object('name', _name));
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.create_demo_organisation()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Inte inloggad'; END IF;
  INSERT INTO public.organisations(name, is_demo, created_by) VALUES ('DEMO – Exempelbolaget AB', true, uid) RETURNING id INTO new_id;
  INSERT INTO public.memberships(org_id, user_id, email, role) VALUES (new_id, uid, auth.jwt()->>'email', 'owner');
  INSERT INTO public.billing_state(org_id) VALUES (new_id);
  INSERT INTO public.documents(org_id, status, file_name, vendor, invoice_number, invoice_date, due_date, net_amount, vat_amount, gross_amount, ocr_reference, uploaded_by, extraction_provider, extraction_note) VALUES
   (new_id, 'needs_review', 'DEMO-faktura-kontorsmaterial.pdf', 'Exempelleverantör Kontor AB', 'DEMO-1001', current_date - 5, current_date + 25, 800.00, 200.00, 1000.00, '1234567890', uid, 'demo', 'Påhittade exempeldata'),
   (new_id, 'needs_review', 'DEMO-kvitto-lunch.jpg', 'Exempelkafé HB', NULL, current_date - 2, NULL, 178.57, 21.43, 200.00, NULL, uid, 'demo', 'Påhittade exempeldata'),
   (new_id, 'approved', 'DEMO-faktura-hosting.pdf', 'Exempelhosting AB', 'DEMO-77', current_date - 12, current_date + 18, 400.00, 100.00, 500.00, '5555000011', uid, 'demo', 'Påhittade exempeldata'),
   (new_id, 'needs_review', 'DEMO-faktura-hosting-kopia.pdf', 'Exempelhosting AB', 'DEMO-77', current_date - 12, current_date + 18, 400.00, 100.00, 500.00, '5555000011', uid, 'demo', 'Påhittade exempeldata – avsiktlig dubblett');
  PERFORM public.write_audit(new_id, 'organisation.demo_created', 'organisation', new_id::text, '{}'::jsonb);
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.accept_invitations()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv record; n integer := 0; em text := lower(auth.jwt()->>'email');
BEGIN
  IF auth.uid() IS NULL OR em IS NULL THEN RETURN 0; END IF;
  IF coalesce((auth.jwt()->'user_metadata'->>'email_verified')::boolean, false) = false
     AND (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NULL THEN
    RETURN 0;
  END IF;
  FOR inv IN SELECT * FROM public.invitations WHERE lower(email) = em AND accepted_at IS NULL LOOP
    INSERT INTO public.memberships(org_id, user_id, email, role) VALUES (inv.org_id, auth.uid(), em, inv.role)
      ON CONFLICT (org_id, user_id) DO NOTHING;
    UPDATE public.invitations SET accepted_at = now() WHERE id = inv.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.create_export(_org uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE exp_id uuid; n integer;
BEGIN
  IF NOT public.has_org_role(_org, ARRAY['owner','admin']::public.org_role[]) THEN RAISE EXCEPTION 'Behörighet saknas'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.documents WHERE org_id = _org AND status = 'approved') THEN
    RAISE EXCEPTION 'Inga godkända dokument att exportera';
  END IF;
  PERFORM set_config('aurora.exporting', 'on', true);
  INSERT INTO public.exports(org_id, created_by) VALUES (_org, auth.uid()) RETURNING id INTO exp_id;
  UPDATE public.documents SET status = 'exported', export_id = exp_id, exported_at = now()
    WHERE org_id = _org AND status = 'approved';
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE public.exports SET document_count = n WHERE id = exp_id;
  PERFORM set_config('aurora.exporting', 'off', true);
  PERFORM public.write_audit(_org, 'export.created', 'export', exp_id::text, jsonb_build_object('documents', n));
  RETURN exp_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_organisation(text,text), public.create_demo_organisation(), public.accept_invitations(), public.create_export(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organisation(text,text), public.create_demo_organisation(), public.accept_invitations(), public.create_export(uuid) TO authenticated;

-- Storage: originals/<org_id>/<file>
CREATE POLICY originals_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'originals' AND public.is_org_member_text((storage.foldername(name))[1]));
CREATE POLICY originals_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'originals' AND public.is_org_member_text((storage.foldername(name))[1]));
CREATE POLICY originals_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'originals' AND public.has_org_role_text((storage.foldername(name))[1], ARRAY['owner','admin']::public.org_role[]));
