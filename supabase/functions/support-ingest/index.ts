import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { sha256, sourceTokenParts, SupportValidationError, validateIngest } from '../_shared/support-validation.ts';

const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});

Deno.serve(async request=>{
  // Server-to-server only: no browser CORS contract and no administrator credentials.
  if(request.method!=='POST')return json({error:'method_not_allowed'},405);
  const rawToken=(request.headers.get('Authorization')??'').replace(/^Bearer\s+/i,'');
  const source=sourceTokenParts(rawToken);
  if(!source)return json({error:'unauthorized'},401);
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)return json({error:'not_configured'},503);
  try {
    const raw=await request.text();
    if(raw.length>2_500_000)return json({error:'payload_too_large'},413);
    let parsed:unknown;
    try{parsed=JSON.parse(raw);}catch{return json({error:'invalid_json'},400);}
    const body=validateIngest(parsed);
    const db=createClient(url,key,{auth:{persistSession:false}});
    const {data,error}=await db.rpc('support_ingest_batch',{
      p_source_id:source.id,p_token_sha256:await sha256(source.token),p_events:body.events,p_heartbeat:body.heartbeat??{},
    });
    if(error) {
      if(error.message.includes('SUPPORT_SOURCE_UNAUTHORIZED'))return json({error:'unauthorized'},401);
      // Never expose payload contents, database errors or credentials to callers/logs.
      console.error('[support-ingest] persistence failed');
      return json({error:'persistence_failed'},503);
    }
    return json(data);
  }catch(error){
    if(error instanceof SupportValidationError)return json({error:error.message},400);
    console.error('[support-ingest] request failed');
    return json({error:'request_failed'},503);
  }
});
