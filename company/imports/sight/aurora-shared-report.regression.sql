BEGIN;
SET LOCAL statement_timeout = '15s';
-- Apply only to the existing Aurora Sight database xsrjgnqhkfjmmhywxnsn.
-- Public report sharing without copying service-role credentials to Aurora Media.
CREATE OR REPLACE FUNCTION public.aurora_shared_report(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r public.reports%ROWTYPE; answer jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 8 OR length(_token) > 120 THEN
    RETURN jsonb_build_object('found',false);
  END IF;
  SELECT * INTO r FROM public.reports WHERE share_token = _token AND is_shared = true LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('found',false); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id=r.brand_id AND org_id=r.org_id) OR
     (r.run_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.audit_runs WHERE id=r.run_id AND brand_id=r.brand_id AND org_id=r.org_id)) THEN
    RETURN jsonb_build_object('found',false);
  END IF;
  SELECT jsonb_build_object(
    'found',true,
    'report',jsonb_build_object('id',r.id,'title',r.title,'summary',r.summary,'created_at',r.created_at),
    'brand',(SELECT to_jsonb(b) FROM (SELECT name,domain,country,language,description,is_demo FROM public.brands WHERE id=r.brand_id AND org_id=r.org_id) b),
    'run',(SELECT to_jsonb(a) FROM (SELECT id,label,model_label,provider,search_mode,mode,status,started_at,completed_at,total_prompts,metrics FROM public.audit_runs WHERE id=r.run_id AND brand_id=r.brand_id AND org_id=r.org_id) a),
    'results',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM (SELECT id,prompt_text,intent,classification,classification_reason,competitor_mentions FROM public.audit_results WHERE run_id=r.run_id AND org_id=r.org_id ORDER BY classification) a),'[]'::jsonb),
    'actions',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM (SELECT id,title,category,rationale,priority,status FROM public.actions WHERE brand_id=r.brand_id AND org_id=r.org_id ORDER BY priority LIMIT 12) a),'[]'::jsonb),
    'citations',coalesce((SELECT jsonb_agg(to_jsonb(c)) FROM (SELECT id,url,domain,is_brand_domain,result_id FROM public.citations WHERE org_id=r.org_id AND result_id IN (SELECT id FROM public.audit_results WHERE run_id=r.run_id AND org_id=r.org_id)) c),'[]'::jsonb)
  ) INTO answer;
  RETURN answer;
END;
$$;
REVOKE ALL ON FUNCTION public.aurora_shared_report(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aurora_shared_report(text) TO anon,authenticated;

-- This test creates only synthetic business records, changes no users or auth,
-- and rolls back both the candidate function and every fixture row.
INSERT INTO public.organizations(id,name) VALUES
 ('f5a01005-0000-4000-8000-000000000001','Synthetic shared-report regression A'),
 ('f5a01005-0000-4000-8000-000000000002','Synthetic shared-report regression B');
INSERT INTO public.brands(id,org_id,name,domain,is_demo,products) VALUES
 ('f5a01005-0000-4000-8000-000000000011','f5a01005-0000-4000-8000-000000000001','Synthetic A','example.invalid',true,'PRIVATE_BRAND_PRODUCTS'),
 ('f5a01005-0000-4000-8000-000000000012','f5a01005-0000-4000-8000-000000000002','Synthetic B','example.invalid',true,'PRIVATE_OTHER_ORG');
INSERT INTO public.audit_runs(id,org_id,brand_id,model_id,model_label,status,error) VALUES
 ('f5a01005-0000-4000-8000-000000000021','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011','synthetic','Synthetic','completed','PRIVATE_RUN_ERROR'),
 ('f5a01005-0000-4000-8000-000000000022','f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000012','synthetic','Synthetic','completed','PRIVATE_OTHER_ORG');
INSERT INTO public.audit_results(id,org_id,run_id,prompt_text,raw_answer,error) VALUES
 ('f5a01005-0000-4000-8000-000000000031','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000021','Synthetic public prompt','PRIVATE_RAW_ANSWER','PRIVATE_RESULT_ERROR'),
 ('f5a01005-0000-4000-8000-000000000032','f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000022','PRIVATE_OTHER_RUN','PRIVATE_OTHER_ORG',null),
 ('f5a01005-0000-4000-8000-000000000033','f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000021','PRIVATE_CROSS_ORG_RESULT','PRIVATE_OTHER_ORG',null);
INSERT INTO public.citations(org_id,result_id,url) VALUES
 ('f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000031','https://example.invalid/public'),
 ('f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000031','https://example.invalid/PRIVATE_CROSS_ORG_CITATION'),
 ('f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000033','https://example.invalid/PRIVATE_CROSS_RESULT_CITATION'),
 ('f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000032','https://example.invalid/PRIVATE_OTHER_RUN');
INSERT INTO public.actions(org_id,brand_id,title,priority,owner)
 SELECT 'f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011','Synthetic public action '||n,n,'PRIVATE_ACTION_OWNER' FROM generate_series(1,13) n;
INSERT INTO public.actions(org_id,brand_id,title,priority) VALUES
 ('f5a01005-0000-4000-8000-000000000002','f5a01005-0000-4000-8000-000000000011','PRIVATE_CROSS_ORG_ACTION',0);
INSERT INTO public.reports(id,org_id,brand_id,run_id,title,share_token,is_shared) VALUES
 ('f5a01005-0000-4000-8000-000000000041','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011','f5a01005-0000-4000-8000-000000000021','Synthetic shared report','regression-public-20261005',true),
 ('f5a01005-0000-4000-8000-000000000042','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011','f5a01005-0000-4000-8000-000000000021','Synthetic disabled report','regression-disabled-20261005',false),
 ('f5a01005-0000-4000-8000-000000000043','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000012',null,'Synthetic mismatched brand','regression-cross-brand-20261005',true),
 ('f5a01005-0000-4000-8000-000000000044','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011','f5a01005-0000-4000-8000-000000000022','Synthetic mismatched run','regression-cross-run-20261005',true),
 ('f5a01005-0000-4000-8000-000000000045','f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000011',null,'Synthetic report without run','regression-no-run-20261005',true);

SET LOCAL ROLE anon;
DO $assert$
DECLARE answer jsonb; token text;
BEGIN
 FOREACH token IN ARRAY ARRAY[NULL,'short',repeat('x',121),'regression-missing-20261005','regression-disabled-20261005','regression-cross-brand-20261005','regression-cross-run-20261005'] LOOP
  IF public.aurora_shared_report(token) IS DISTINCT FROM '{"found":false}'::jsonb THEN RAISE EXCEPTION 'Denied token became readable'; END IF;
 END LOOP;
 answer := public.aurora_shared_report('regression-public-20261005');
 IF answer->>'found' IS DISTINCT FROM 'true' OR answer#>>'{report,title}' IS DISTINCT FROM 'Synthetic shared report' THEN RAISE EXCEPTION 'Anonymous shared report not readable'; END IF;
 IF jsonb_array_length(answer->'results') <> 1 OR jsonb_array_length(answer->'citations') <> 1 THEN RAISE EXCEPTION 'Cross-organization result/citation leak'; END IF;
 IF jsonb_array_length(answer->'actions') <> 12 OR answer#>>'{actions,0,priority}' IS DISTINCT FROM '1' THEN RAISE EXCEPTION 'Action cap/order failed'; END IF;
 IF answer::text LIKE '%PRIVATE_%' THEN RAISE EXCEPTION 'Private fields leaked'; END IF;
 IF answer->'report' ?| ARRAY['org_id','brand_id','run_id','share_token','is_shared'] OR answer->'brand' ?| ARRAY['id','org_id','client_id','products','aliases'] OR answer->'run' ?| ARRAY['org_id','brand_id','created_by','error','cost_estimate_usd','model_id'] THEN RAISE EXCEPTION 'Internal identifiers/fields leaked'; END IF;
 answer := public.aurora_shared_report('regression-no-run-20261005');
 IF answer->>'found' IS DISTINCT FROM 'true' OR answer->'run' IS DISTINCT FROM 'null'::jsonb OR answer->'results' <> '[]'::jsonb OR answer->'citations' <> '[]'::jsonb THEN RAISE EXCEPTION 'Report without run failed'; END IF;
END;
$assert$;

SET LOCAL ROLE authenticated;
DO $assert$
BEGIN
 IF public.aurora_shared_report('regression-public-20261005')->>'found' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Authenticated shared report failed'; END IF;
 IF public.aurora_shared_report('regression-disabled-20261005') IS DISTINCT FROM '{"found":false}'::jsonb THEN RAISE EXCEPTION 'Authenticated user bypassed sharing switch'; END IF;
END;
$assert$;
RESET ROLE;
DO $assert$
BEGIN
 IF EXISTS (SELECT 1 FROM pg_proc p, LATERAL aclexplode(p.proacl) a WHERE p.oid='public.aurora_shared_report(text)'::regprocedure AND a.grantee=0 AND a.privilege_type='EXECUTE') THEN RAISE EXCEPTION 'PUBLIC execute not revoked'; END IF;
 IF NOT has_function_privilege('anon','public.aurora_shared_report(text)','EXECUTE') OR NOT has_function_privilege('authenticated','public.aurora_shared_report(text)','EXECUTE') THEN RAISE EXCEPTION 'Explicit role grants missing'; END IF;
 IF EXISTS (SELECT 1 FROM pg_proc WHERE oid='public.aurora_shared_report(text)'::regprocedure AND (NOT prosecdef OR NOT ('search_path=public, pg_temp'=ANY(proconfig)))) THEN RAISE EXCEPTION 'Definer/search_path configuration failed'; END IF;
END;
$assert$;
ROLLBACK;
SELECT 'regression_passed_and_rolled_back' AS status,
 (SELECT count(*) FROM public.organizations WHERE id IN ('f5a01005-0000-4000-8000-000000000001','f5a01005-0000-4000-8000-000000000002')) AS remaining_fixture_organizations,
 (SELECT count(*) FROM public.brands) AS brands,
 (SELECT count(*) FROM public.reports) AS reports,
 to_regprocedure('public.aurora_shared_report(text)') IS NOT NULL AS rpc_exists_after_rollback;
