export const productEnv:Record<string,string|undefined>=new Proxy({}, {get(_target,key:string){
  if(key==="SUPABASE_URL")return "https://xsrjgnqhkfjmmhywxnsn.supabase.co";
  if(key==="SUPABASE_PUBLISHABLE_KEY")return "sb_publishable_euyQk616WcWNhFVADoDGzg_MwY0w40Z";
  return Deno.env.get("AURORA_SIGHT_"+key);
}});
