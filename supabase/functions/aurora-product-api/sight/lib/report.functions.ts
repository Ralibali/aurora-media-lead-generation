import { createServerFn } from '../../runtime.ts';
import { z } from 'npm:zod@3.25.76';
/** Only the original Sight database may resolve a public report token. */
export const getSharedReport=createServerFn({method:'GET'})
  .inputValidator((input:unknown)=>z.object({token:z.string().min(8).max(120)}).parse(input))
  .handler(async({data,context})=>{
    const {data:report,error}=await context.supabase.rpc('aurora_shared_report',{_token:data.token});
    if(error)throw new Error('Den delade rapporten kunde inte läsas.');
    return report;
  });
