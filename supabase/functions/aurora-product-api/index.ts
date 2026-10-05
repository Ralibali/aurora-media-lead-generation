import { createClient } from 'npm:@supabase/supabase-js@2.104.0';
import * as careBilling from './care/lib/billing.functions.ts';
import * as careWpmgr from './care/lib/wpmgr/wpmgr.functions.ts';
import * as sightAudit from './sight/lib/audit.functions.ts';
import * as sightReports from './sight/lib/report.functions.ts';
import { getPricingPlans } from './sight/lib/public.functions.ts';
import * as connect from './connect/lib/aurora.functions.ts';
import * as localBoost from './local-boost/lib/aurora.functions.ts';
import { handlePapersOperation } from './papers/index.ts';
import { bearerToken,isPublicOperation,parseEnvelope,type Product } from './policy.ts';
import type { ProductOperation } from './runtime.ts';
import { PUBLIC_PRODUCTS } from './public-config.ts';

function pickOperations(exports:Record<string,unknown>):Record<string,ProductOperation>{return Object.fromEntries(Object.entries(exports).filter(([,value])=>typeof value==='function'&&'requiresAuth'in value)) as Record<string,ProductOperation>;}
const operations:Record<Exclude<Product,'papers'>,Record<string,ProductOperation>>={care:{...careBilling,...careWpmgr},sight:{...sightAudit,...sightReports,getPricingPlans},connect:pickOperations(connect), 'local-boost':localBoost};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
function respond(status:number,value:unknown){return new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});}
Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return respond(405,{error:'Använd POST.'});
  const body=await request.text();
  if(body.length>128000)return respond(413,{error:'Begäran är för stor.'});
  let input:ReturnType<typeof parseEnvelope>;
  try{input=parseEnvelope(JSON.parse(body));}catch{return respond(400,{error:'Okänd tjänst eller ogiltig begäran.'});}
  const {product,operation,data}=input;
  const config=PUBLIC_PRODUCTS[product];
  if(!config)return respond(503,{error:'Tjänsten är inte konfigurerad.'});
  const action=product==='papers'?null:operations[product][operation];
  if(product==='papers'?!['processDocument','exportApproved','recoverExport'].includes(operation):!Object.hasOwn(operations[product],operation)||typeof action!=='function')return respond(404,{error:'Åtgärden finns inte.'});
  const token=bearerToken(request.headers.get('Authorization'));
  const publicOperation=isPublicOperation(product,operation);
  if(!publicOperation&&!token)return respond(401,{error:'Logga in i tjänsten för att fortsätta.'});
  const headers:Record<string,string>={};
  if(token)headers.Authorization=`Bearer ${token}`;
  const supabase=createClient(config.url,config.key,{global:{headers,fetch:(url,init)=>{
    const h=new Headers(init?.headers);h.set('apikey',config.key);
    if(config.key.startsWith('sb_publishable_')&&h.get('Authorization')===`Bearer ${config.key}`)h.delete('Authorization');
    return fetch(url,{...init,headers:h});
  }},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  let userId='';
  if(token){const {data:auth,error}=await supabase.auth.getUser(token);if(error||!auth.user)return respond(401,{error:'Sessionen gäller inte för den här tjänsten.'});userId=auth.user.id;}
  try{
    const result=product==='papers'?await handlePapersOperation(operation,data,supabase,userId):await action!({data,context:{supabase,userId}});
    return respond(200,{result});
  }catch(error){
    // Do not return database internals, environment names, tokens, or provider payloads.
    console.error('[aurora-product-api]',product,operation,error instanceof Error?error.name:'error');
    return respond(400,{error:'Åtgärden kunde inte genomföras. Kontrollera underlaget och din behörighet. Om en extern koppling saknas behöver den aktiveras först.'});
  }
});
