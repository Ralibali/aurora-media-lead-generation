import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Copies server-side secrets into Supabase Vault so pg_cron jobs can use them.
// Never returns secret values.
Deno.serve(async () => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);
    const pairs: [string, string | undefined][] = [
      ["cron_secret", Deno.env.get("CRON_SECRET")],
      ["guardian_cron_secret", Deno.env.get("GUARDIAN_CRON_SECRET")],
    ];
    const result: Record<string, boolean> = {};
    for (const [name, value] of pairs) {
      if (!value) { result[name] = false; continue; }
      const { error } = await supabase.rpc("upsert_vault_secret", { p_name: name, p_value: value });
      result[name] = !error;
    }
    return new Response(JSON.stringify({ ok: true, seeded: result }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "seed failed" }), { status: 500 });
  }
});
