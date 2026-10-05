import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { equalSecret } from '../_shared/secret.ts';
import { object, presentSupportSource, supportId, SupportValidationError, validateFilters, validateUpdate } from '../_shared/support-validation.ts';
import type { SupportCase, SupportCursor, SupportSource } from '../_shared/support-types.ts';

const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS' };
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{...cors,'Cache-Control':'no-store'}});

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(request.method!=='POST')return json({error:'method_not_allowed'},405);
  const token=(request.headers.get('Authorization')??'').replace(/^Bearer\s+/i,'');
  if(token.length>4096||![Deno.env.get('ADMIN_SECRET')??'',Deno.env.get('FAQ_ANALYTICS_PASSWORD')??''].some(secret=>equalSecret(token,secret)))return json({error:'unauthorized'},401);
  let body:Record<string,unknown>;
  try { const raw=await request.text(); if(raw.length>50_000)throw new Error(); body=object(JSON.parse(raw)); }
  catch {return json({error:'Ogiltig begäran.'},400);}
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)return json({error:'Ärendehanteringen är inte konfigurerad.'},503);
  const db=createClient(url,key,{auth:{persistSession:false}});
  try {
    if(body.action==='detail') {
      const {data,error}=await db.rpc('support_case_payload',{p_id:supportId(body.id)});
      if(error)throw error;
      return data?json({case:data}):json({error:'Ärendet finns inte.'},404);
    }
    if(body.action==='update') {
      const update=validateUpdate(body);
      const {data,error}=await db.rpc('support_update_case',{p_id:update.id,p_expected_version:update.expected_version,p_patch:update.patch});
      if(error) {
        if(error.message.includes('SUPPORT_VERSION_CONFLICT'))return json({error:'Ärendet har ändrats. Läs in senaste versionen innan du sparar.',code:'version_conflict'},409);
        if(error.message.includes('SUPPORT_CASE_NOT_FOUND'))return json({error:'Ärendet finns inte.'},404);
        if(error.code==='23503')return json({error:'Välj ett befintligt projekt.'},400);
        throw error;
      }
      return json({case:data});
    }
    if(body.action!==undefined&&body.action!=='list')throw new SupportValidationError('Okänd åtgärd.');
    const filters=validateFilters(body);
    const [listed,sourceRows,registry]=await Promise.all([
      db.rpc('support_list_cases',{p_filters:filters}),
      // Explicit projection: token_sha256 and ingest credentials never reach the browser.
      db.from('support_sources').select('id,project_id,source_key,label,active,connection_state,sync_received_at,last_error,original_url').order('label'),
      db.from('portfolio_projects').select('payload').order('project_id'),
    ]);
    if(listed.error||sourceRows.error||registry.error)throw new Error('support_read_failed');
    const rows=listed.data.cases as SupportCase[];
    const limit=filters.limit??30;
    const cases=rows.slice(0,limit);
    const last=cases.at(-1);
    const next_cursor:SupportCursor|null=rows.length>limit&&last?{updated_at:last.updated_at,id:last.id}:null;
    const sources=(sourceRows.data??[]).map((source:SupportSource)=>presentSupportSource(source));
    return json({...listed.data,cases,next_cursor,sources,projects:(registry.data??[]).map(row=>row.payload),generated_at:new Date().toISOString()});
  } catch(error) {
    if(error instanceof SupportValidationError)return json({error:error.message},400);
    console.error('[admin-support] request failed');
    return json({error:'Ärenden kunde inte läsas eller sparas. Försök igen.'},503);
  }
});
