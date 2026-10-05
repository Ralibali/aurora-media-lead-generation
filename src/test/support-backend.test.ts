// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { presentSupportSource, sha256, sourceTokenParts, validateFilters, validateIngest, validateUpdate } from '../../supabase/functions/_shared/support-validation';
import type { SupportSource } from '../../supabase/functions/_shared/support-types';
const id='f0000000-0000-0000-0000-000000000001';
const token=`${id}.${'a'.repeat(64)}`;
const event={event_id:id,record_id:'local-42',revision:'1',event_type:'upsert',record:{kind:'feedback',title:'Need help',body:'My request',created_at:'2026-10-01T00:00:00Z'}};
async function handler(name:string,client:unknown,env:Record<string,string>={}) {
  const sourceFile=resolve(__dirname,`../../supabase/functions/${name}/index.ts`);
  const source=(await readFile(sourceFile,'utf8')).replace(/^import \{ createClient \} from [^\n]+;/m,'const createClient = () => globalThis.__supportClient;');
  const compiled=await build({stdin:{contents:source,sourcefile:sourceFile,resolveDir:dirname(sourceFile),loader:'ts'},bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
  let serve:(request:Request)=>Promise<Response>;
  vi.stubGlobal('__supportClient',client);
  vi.stubGlobal('Deno',{env:{get:(key:string)=>({SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-service',...env})[key]},serve:(fn:typeof serve)=>{serve=fn;}});
  await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}#${Math.random()}`);
  return (body:unknown,authorization='')=>serve(new Request('https://test.invalid',{method:'POST',headers:{'Content-Type':'application/json',Authorization:authorization},body:JSON.stringify(body)}));
}
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('Central support input boundaries',()=>{
  it('does not report a stopped relay as connected forever or invent connectivity for new sources',()=>{
    const source:SupportSource={id,project_id:'alpha',source_key:'alpha.feedback',label:'Feedback',active:true,connection_state:'connected',sync_received_at:'2026-10-05T10:00:00Z',last_error:null,original_url:null};
    expect(presentSupportSource(source,Date.parse('2026-10-05T10:15:00Z')).connection_state).toBe('connected');
    expect(presentSupportSource(source,Date.parse('2026-10-05T10:31:00Z')).connection_state).toBe('error');
    expect(presentSupportSource({...source,connection_state:'pending',sync_received_at:null}).connection_state).toBe('pending');
    expect(presentSupportSource({...source,active:false}).connection_state).toBe('paused');
    expect(source.connection_state).toBe('connected');
  });
  it('accepts empty heartbeats and rejects source attempts to choose projects or private management fields',()=>{
    expect(validateIngest({events:[],heartbeat:{pending_count:0}}).events).toEqual([]);
    expect(validateIngest({events:[event]}).events[0].revision).toBe('1');
    expect(validateIngest({events:[{...event,record:{...event.record,body:''}}]}).events[0].record?.body).toBe('');
    for(const extra of [{project_id:'other'},{owner_status:'resolved'},{private_notes:'read me'},{source_id:id}]) {
      expect(()=>validateIngest({events:[{...event,record:{...event.record,...extra}}]})).toThrow();
    }
    expect(()=>validateIngest({events:[event],project_id:'other'})).toThrow();
    expect(()=>validateIngest({events:[event,event]})).toThrow();
    expect(()=>validateIngest({events:Array(51).fill(event)})).toThrow();
  });
  it('uses exact bigint revisions, safe source tokens and explicit deletion events',async()=>{
    expect(sourceTokenParts(token)?.id).toBe(id);expect(sourceTokenParts('admin-secret')).toBeNull();
    expect((await sha256(token)).length).toBe(64);
    for(const revision of [1,'0','-1','1e2','9223372036854775808'])expect(()=>validateIngest({events:[{...event,revision}]})).toThrow();
    expect(validateIngest({events:[{...event,revision:'9223372036854775807'}]}).events[0].revision).toBe('9223372036854775807');
    expect(()=>validateIngest({events:[{...event,event_type:'deleted'}]})).toThrow();
    expect(validateIngest({events:[{event_id:id,record_id:'1',revision:'2',event_type:'deleted'}]}).events[0].event_type).toBe('deleted');
  });
  it('permits only private management patches, exact versions and bounded search/cursors',()=>{
    expect(validateUpdate({id,expected_version:2,patch:{owner_status:'waiting',assigned_to:'Operator',reply_draft:'Draft'}}).patch.owner_status).toBe('waiting');
    for(const patch of [{source_id:id},{body:'overwrite'},{owner_status:'closed'},{assigned_to:'x'.repeat(121)},{}])expect(()=>validateUpdate({id,expected_version:2,patch})).toThrow();
    expect(()=>validateUpdate({id,expected_version:0,patch:{private_notes:''}})).toThrow();
    expect(validateFilters({query:'100%_text',limit:50}).query).toBe('100%_text');
    expect(()=>validateFilters({limit:51})).toThrow();
    expect(()=>validateFilters({cursor:{updated_at:'yesterday',id}})).toThrow();
  });
});
describe('Central support API authorization',()=>{
  it('rejects unauthenticated admin access and source tokens before accessing the database',async()=>{
    const rpc=vi.fn(),from=vi.fn();const submit=await handler('admin-support',{rpc,from},{ADMIN_SECRET:'admin-test'});
    expect((await submit({action:'detail',id})).status).toBe(401);
    expect((await submit({action:'detail',id},`Bearer ${token}`)).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();expect(from).not.toHaveBeenCalled();
  });
  it('hashes source tokens and returns only ingest acknowledgements even for an empty source',async()=>{
    const rpc=vi.fn().mockResolvedValue({data:{ok:true,acknowledged:[]},error:null});
    const submit=await handler('support-ingest',{rpc});
    expect((await submit({events:[]},'Bearer admin-test')).status).toBe(401);
    expect((await submit({events:[],heartbeat:{pending_count:0}},`Bearer ${token}`)).status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('support_ingest_batch',{p_source_id:id,p_token_sha256:await sha256(token),p_events:[],p_heartbeat:{pending_count:0,last_error:null}});
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(token);
  });
  it('maps revoked source credentials to401 and stale admin writes to409 without leaking server errors',async()=>{
    const rpc=vi.fn().mockResolvedValue({data:null,error:{message:'SUPPORT_SOURCE_UNAUTHORIZED secret-must-not-leak'}});
    const ingest=await handler('support-ingest',{rpc});
    const denied=await ingest({events:[]},`Bearer ${token}`);expect(denied.status).toBe(401);expect(await denied.text()).not.toContain('secret');
    rpc.mockResolvedValue({data:null,error:{message:'SUPPORT_VERSION_CONFLICT'}});
    const admin=await handler('admin-support',{rpc},{ADMIN_SECRET:'admin-test'});
    expect((await admin({action:'update',id,expected_version:1,patch:{owner_status:'resolved'}},'Bearer admin-test')).status).toBe(409);
  });
});
