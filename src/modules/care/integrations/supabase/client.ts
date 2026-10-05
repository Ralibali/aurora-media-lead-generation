import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
export const supabase=createClient<Database>("https://tsijqcjxoddkytcaabbw.supabase.co","sb_publishable_o87AXgNMGkr-LKwFPyPmhw_azxjRIU6",{auth:{storageKey:"aurora-care-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
