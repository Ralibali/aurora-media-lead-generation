// The app's regression tests exercise the portable Edge handler under Vitest.
// Deno resolves this same pinned package through its native npm: support.
declare module "npm:@supabase/supabase-js@2.104.0" {
  export type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;
}
