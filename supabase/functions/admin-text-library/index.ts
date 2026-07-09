// Edge Function: admin-text-library
// Bearer-skyddad CRUD för text_library. Ersätter direktanropen från admin-panelen.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const ADMIN = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || (token !== PASSWORD && token !== ADMIN)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, key);

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "").trim();

    if (action === "list") {
      const { data, error } = await supabase
        .from("text_library")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return json({ error: error.message }, 500);
      return json({ rows: data ?? [] });
    }

    if (action === "insert") {
      const row = body.row ?? {};
      const { error } = await supabase.from("text_library").insert(row);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      const patch = body.patch ?? {};
      if (!id) return json({ error: "id krävs" }, 400);
      const { error } = await supabase.from("text_library").update(patch).eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id krävs" }, 400);
      const { error } = await supabase.from("text_library").delete().eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "okänd action" }, 400);
  } catch (err) {
    console.error("[admin-text-library]", err);
    return json({ error: "Internal error" }, 500);
  }
});
