// Edge Function: list-leads
// Returnerar alla leads till adminpanelen. Skyddad med samma lösenord som
// faq-analytics (FAQ_ANALYTICS_PASSWORD) för enkelhets skull.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD");
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!PASSWORD || token !== PASSWORD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (req.method === "POST") {
      // Uppdatera status (ny / read / archived) eller radera
      const body = await req.json() as { id?: string; action?: string; status?: string };
      if (!body.id) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (body.action === "delete") {
        const { error } = await admin.from("leads").delete().eq("id", body.id);
        if (error) throw error;
      } else if (body.status && ["new", "read", "archived"].includes(body.status)) {
        const { error } = await admin.from("leads").update({ status: body.status }).eq("id", body.id);
        if (error) throw error;
      } else {
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);

    const [{ data: leads, error: leadsErr }, { data: clicks, error: clicksErr }] = await Promise.all([
      admin.from("leads").select("*").order("created_at", { ascending: false }).limit(limit),
      admin
        .from("ai_karta_clicks")
        .select("button, created_at")
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()),
    ]);
    if (leadsErr) throw leadsErr;
    if (clicksErr) console.warn("[list-leads] clicks fetch failed", clicksErr);

    const aiKartaLeads = (leads ?? []).filter((l: { paket?: string }) => l.paket === "ai-karta").length;
    const heroClicks = (clicks ?? []).filter((c: { button: string }) => c.button === "hero_cta").length;
    const pdfClicks = (clicks ?? []).filter((c: { button: string }) => c.button === "pdf_direct").length;
    const totalClicks = heroClicks + pdfClicks;

    const stats = {
      hero_clicks: heroClicks,
      pdf_clicks: pdfClicks,
      total_clicks: totalClicks,
      ai_karta_leads: aiKartaLeads,
      conversion_rate: heroClicks > 0 ? Math.round((aiKartaLeads / heroClicks) * 1000) / 10 : 0,
      window_days: 30,
    };

    return new Response(JSON.stringify({ leads: leads ?? [], stats }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[list-leads] error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
