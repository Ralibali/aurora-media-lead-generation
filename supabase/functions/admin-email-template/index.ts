// Edge Function: admin-email-template
// Bearer-skyddad läsning/uppdatering av e-postmallar (public.email_templates).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const ADMIN = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || (token !== PASSWORD && token !== ADMIN)) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "get");
    const key = String(body?.key ?? "ai_map_pdf").slice(0, 60);
    if (!/^[a-z0-9_]+$/.test(key)) return json({ error: "invalid_key" }, 400);

    if (action === "get") {
      const { data, error } = await supabase
        .from("email_templates")
        .select("key, subject, body_html, body_text, updated_at")
        .eq("key", key)
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ template: data });
    }

    if (action === "save") {
      const subject = String(body?.subject ?? "").trim().slice(0, 200);
      const body_html = String(body?.body_html ?? "").trim().slice(0, 20000);
      const body_text = String(body?.body_text ?? "").trim().slice(0, 20000);
      if (!subject) return json({ error: "Ämnesrad krävs." }, 400);
      if (!body_html) return json({ error: "Brödtext krävs." }, 400);

      const { error } = await supabase
        .from("email_templates")
        .upsert(
          { key, subject, body_html, body_text, updated_at: new Date().toISOString() },
          { onConflict: "key" },
        );
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    console.error("[admin-email-template]", e);
    return json({ error: "server_error" }, 500);
  }
});
