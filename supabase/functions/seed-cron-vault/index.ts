import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { ...cors, "Cache-Control": "no-store" } });

function equal(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return !!a && !!b && diff === 0;
}

// Copies server-side secrets into Supabase Vault so pg_cron jobs can use them.
// This administrative endpoint never returns secret values.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const authorized = [
    Deno.env.get("ADMIN_SECRET") ?? "",
    Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "",
  ].some((key) => equal(token, key));
  if (!authorized) return json({ error: "unauthorized" }, 401);

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
      if (!value) {
        result[name] = false;
        continue;
      }
      const { error } = await supabase.rpc("upsert_vault_secret", { p_name: name, p_value: value });
      result[name] = !error;
    }
    return json({ ok: true, seeded: result });
  } catch {
    return json({ error: "seed failed" }, 500);
  }
});
