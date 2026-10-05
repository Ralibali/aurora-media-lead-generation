export const productEnv:Record<string,string|undefined>=new Proxy({}, {get(_target,key:string){
  if(key==="SUPABASE_URL")return "https://tsijqcjxoddkytcaabbw.supabase.co";
  if(key==="SUPABASE_PUBLISHABLE_KEY")return "sb_publishable_o87AXgNMGkr-LKwFPyPmhw_azxjRIU6";
  return Deno.env.get("AURORA_CARE_"+key);
}});
