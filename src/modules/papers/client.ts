import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { detectAuthSessionFor } from "@/modules/shared/auth-callback";

// Public project configuration only; data access remains protected by Papers Auth and RLS.
export const PAPERS_URL = "https://mqizbxeifqqibluujlfy.supabase.co";
export const PAPERS_PUBLISHABLE_KEY = "sb_publishable_997N3I3D3kb-K8-TvtcMyA_-QMeJTxY";

export const supabase = createClient<Database>(PAPERS_URL, PAPERS_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "aurora-media-papers-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: detectAuthSessionFor("papers"),
  },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
      if (headers.get("Authorization") === `Bearer ${PAPERS_PUBLISHABLE_KEY}`) headers.delete("Authorization");
      headers.set("apikey", PAPERS_PUBLISHABLE_KEY);
      return fetch(input, { ...init, headers });
    },
  },
});
