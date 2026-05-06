import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret) {
      return new Response(JSON.stringify({ error: "CRON_SECRET missing" }), { status: 500 });
    }

    const supabase = createClient(url, serviceKey);

    // Try update first, otherwise insert
    const { data: existing } = await supabase
      .schema("vault" as any)
      .from("secrets")
      .select("id")
      .eq("name", "cron_secret")
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.rpc("vault_update_secret" as any, {
        secret_id: existing.id,
        new_secret: cronSecret,
      });
      if (error) {
        // Fallback: raw SQL via PostgREST not available; use direct REST call
        const res = await fetch(`${url}/rest/v1/rpc/vault_update_secret`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ secret_id: existing.id, new_secret: cronSecret }),
        });
        return new Response(JSON.stringify({ updated: true, status: res.status }), { status: 200 });
      }
      return new Response(JSON.stringify({ updated: true }), { status: 200 });
    }

    // Insert new secret via vault.create_secret RPC
    const res = await fetch(`${url}/rest/v1/rpc/create_vault_secret`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secret: cronSecret, name: "cron_secret" }),
    });
    const text = await res.text();
    return new Response(JSON.stringify({ created: res.ok, status: res.status, body: text }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
