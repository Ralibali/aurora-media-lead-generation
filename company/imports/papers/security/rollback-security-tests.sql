-- Catalog and permission verification only. No auth account or password is created.
-- Every synthetic application row is rolled back at the end.
BEGIN;
INSERT INTO public.organisations(id,name,created_by) VALUES
 ('10000000-0000-4000-8000-000000000001','ROLLBACK TEST A','20000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002','ROLLBACK TEST B','20000000-0000-4000-8000-000000000002');
INSERT INTO public.memberships(org_id,user_id,role) VALUES
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','owner'),
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','reviewer'),
 ('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','owner');
INSERT INTO public.documents(id,org_id,file_name,storage_path,uploaded_by,vendor,invoice_date,gross_amount) VALUES
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','ROLLBACK.pdf','10000000-0000-4000-8000-000000000001/rollback.pdf','20000000-0000-4000-8000-000000000001','Synthetic Vendor','2026-10-05',100),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','ROLLBACK.pdf','10000000-0000-4000-8000-000000000002/rollback.pdf','20000000-0000-4000-8000-000000000002','Synthetic Vendor','2026-10-05',100);
INSERT INTO public.invitations(org_id,email,role,invited_by) VALUES
 ('10000000-0000-4000-8000-000000000002','rollback-auth@example.invalid','reviewer','20000000-0000-4000-8000-000000000002');
INSERT INTO storage.objects(bucket_id,name) VALUES
 ('originals','10000000-0000-4000-8000-000000000001/rollback.pdf'),
 ('originals','10000000-0000-4000-8000-000000000002/rollback.pdf');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated","email":"rollback-auth@example.invalid","user_metadata":{"email_verified":true}}',true);
DO $test$
DECLARE denied boolean := false; n integer;
BEGIN
 IF (SELECT count(*) FROM public.organisations) <> 1 THEN RAISE EXCEPTION 'FAIL: organisation tenant read'; END IF;
 IF (SELECT count(*) FROM public.documents) <> 1 THEN RAISE EXCEPTION 'FAIL: document tenant read'; END IF;
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='originals') <> 1 THEN RAISE EXCEPTION 'FAIL: storage tenant read'; END IF;
 IF public.accept_invitations() <> 0 THEN RAISE EXCEPTION 'FAIL: user metadata bypass'; END IF;
 UPDATE public.documents SET vendor='forbidden' WHERE id='30000000-0000-4000-8000-000000000002';
 GET DIAGNOSTICS n = ROW_COUNT;
 IF n <> 0 THEN RAISE EXCEPTION 'FAIL: cross-tenant document update'; END IF;
 BEGIN
  INSERT INTO public.documents(org_id,file_name,uploaded_by) VALUES ('10000000-0000-4000-8000-000000000002','forbidden.pdf',auth.uid());
 EXCEPTION WHEN insufficient_privilege THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: cross-tenant document insert'; END IF;
 denied := false;
 BEGIN
  INSERT INTO storage.objects(bucket_id,name) VALUES ('originals','10000000-0000-4000-8000-000000000002/forbidden.pdf');
 EXCEPTION WHEN insufficient_privilege THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: cross-tenant storage insert'; END IF;
 UPDATE public.documents SET status='needs_review' WHERE id='30000000-0000-4000-8000-000000000001';
 UPDATE public.documents SET status='approved' WHERE id='30000000-0000-4000-8000-000000000001';
 denied := false;
 BEGIN
  UPDATE public.documents SET currency='EUR' WHERE id='30000000-0000-4000-8000-000000000001';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'Återöppna dokumentet%' THEN denied := true; ELSE RAISE; END IF;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: approved currency mutation'; END IF;
 PERFORM public.create_export('10000000-0000-4000-8000-000000000001');
 IF has_column_privilege('authenticated','public.exports','org_id','UPDATE') THEN RAISE EXCEPTION 'FAIL: export metadata mutable'; END IF;
 IF NOT has_column_privilege('authenticated','public.exports','csv','UPDATE') THEN RAISE EXCEPTION 'FAIL: CSV completion unavailable'; END IF;
END;
$test$;

SELECT set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
DO $test$
DECLARE denied boolean := false; n integer;
BEGIN
 UPDATE public.memberships SET role='owner' WHERE user_id=auth.uid();
 GET DIAGNOSTICS n = ROW_COUNT;
 IF n <> 0 THEN RAISE EXCEPTION 'FAIL: reviewer self-promotion'; END IF;
 BEGIN
  PERFORM public.create_export('10000000-0000-4000-8000-000000000001');
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM = 'Behörighet saknas' THEN denied := true; ELSE RAISE; END IF;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: reviewer export'; END IF;
END;
$test$;

SELECT 'PASS' AS result, 12 AS assertions, 'tenant read/write, private storage read/insert, metadata auth bypass, reviewer permissions, currency/export metadata immutability' AS coverage;
ROLLBACK;
