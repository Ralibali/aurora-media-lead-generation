export const productEnv:Record<string,string|undefined>=new Proxy({}, {get(_target,key:string){
  if(key==="SUPABASE_URL")return "https://ydnyoqfikiybyektvann.supabase.co";
  if(key==="SUPABASE_PUBLISHABLE_KEY")return "sb_publishable_3dsO7_wOCPBDcS5VxkjPsA_GyiFXIsa";
  return Deno.env.get("AURORA_LOCAL_BOOST_"+key);
}});
