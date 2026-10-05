import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { detectAuthSessionFor } from "@/modules/shared/auth-callback";
export const supabase=createClient<Database>("https://xsrjgnqhkfjmmhywxnsn.supabase.co","sb_publishable_euyQk616WcWNhFVADoDGzg_MwY0w40Z",{auth:{storageKey:"aurora-sight-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:detectAuthSessionFor("sight")}});
