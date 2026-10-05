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
