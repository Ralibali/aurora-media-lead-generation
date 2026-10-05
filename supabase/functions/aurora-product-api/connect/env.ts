export const productEnv:Record<string,string|undefined>=new Proxy({}, {get(_target,key:string){
  if(key==="SUPABASE_URL")return "https://iwypiteuubedpfuiyatu.supabase.co";
  if(key==="SUPABASE_PUBLISHABLE_KEY")return "sb_publishable_J2Zy8sDERnOE0YttCNsNJw_jrygq2Ga";
  return Deno.env.get("AURORA_CONNECT_"+key);
}});
