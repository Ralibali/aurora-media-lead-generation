// Publikt endpoint som returnerar en AI-karta baserat på share_token.
// Aldrig e-post eller telefonnummer i svaret.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("t") ?? "";
    if (!token) {
      try {
        const body = await req.json();
        token = typeof body?.token === "string" ? body.token : "";
      } catch { /* ignore */ }
    }
    token = token.trim();
    if (!token || !/^[a-f0-9]{16,64}$/i.test(token)) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: lead, error } = await admin
      .from("ai_map_leads")
      .select("id, company_name, industry, employee_count, contact_name, pain_areas, total_score, total_potential, ai_analysis, created_at")
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("[get-ai-map-result] lead err", error);
      return new Response(JSON.stringify({ error: "server_error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!lead) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: procs, error: pErr } = await admin
      .from("ai_map_processes")
      .select("position, process_name, frequency, weekly_time, systems, rule_based, data_available, business_value, score, potential, recommended_solution, next_step, saved_hours_per_week")
      .eq("lead_id", lead.id)
      .order("score", { ascending: false });

    if (pErr) console.error("[get-ai-map-result] procs err", pErr);
    const processes = (procs ?? []) as Array<Record<string, unknown> & { saved_hours_per_week?: number | null; score?: number | null }>;

    const totalSavedPerWeek = processes.reduce((s, p) => s + (Number(p.saved_hours_per_week) || 0), 0);
    const totalSavedPerYear = Math.round(totalSavedPerWeek * 46);
    const top3 = [...processes].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)).slice(0, 3);

    // Public result – aldrig e-post/telefon.
    return new Response(
      JSON.stringify({
        leadId: lead.id,
        totalScore: lead.total_score,
        avg: 0,
        total_potential: lead.total_potential,
        processes,
        top3,
        totalSavedPerWeek: Math.round(totalSavedPerWeek * 10) / 10,
        totalSavedPerYear,
        pain_areas: lead.pain_areas ?? [],
        ai_analysis: lead.ai_analysis ?? null,
        created_at: lead.created_at,
        meta: {
          company_name: lead.company_name,
          contact_name: lead.contact_name ?? "",
          industry: lead.industry ?? "",
          employee_count: lead.employee_count ?? "",
          email: "",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[get-ai-map-result] threw", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
