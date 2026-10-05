-- Apply only to the existing Papers database mqizbxeifqqibluujlfy, not Aurora Media's public schema.
BEGIN;
CREATE OR REPLACE FUNCTION public.documents_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      NEW.currency IS DISTINCT FROM OLD.currency OR NEW.vendor IS DISTINCT FROM OLD.vendor OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number OR
      NEW.invoice_date IS DISTINCT FROM OLD.invoice_date OR NEW.due_date IS DISTINCT FROM OLD.due_date OR
      NEW.net_amount IS DISTINCT FROM OLD.net_amount OR NEW.vat_amount IS DISTINCT FROM OLD.vat_amount OR
      NEW.gross_amount IS DISTINCT FROM OLD.gross_amount OR NEW.ocr_reference IS DISTINCT FROM OLD.ocr_reference) THEN
    RAISE EXCEPTION 'Återöppna dokumentet innan fälten ändras';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $function$;

REVOKE UPDATE ON public.exports FROM authenticated;
GRANT UPDATE (csv) ON public.exports TO authenticated;
ALTER POLICY originals_delete ON storage.objects USING (
 bucket_id = 'originals'
 AND public.has_org_role_text((storage.foldername(name))[1], ARRAY['owner','admin']::public.org_role[])
 AND NOT EXISTS (SELECT 1 FROM public.documents d WHERE d.storage_path = storage.objects.name AND d.status = 'exported')
);
COMMIT;
