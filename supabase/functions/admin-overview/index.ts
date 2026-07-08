// admin-overview — aggregerar analytics för admin-hubben.
// Skyddad via FAQ_ANALYTICS_PASSWORD (Bearer) för att matcha list-leads.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const pwd = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const adminPwd = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || (token !== pwd && token !== adminPwd)) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const day = (n: number) => new Date(now.getTime() - n * 86400_000).toISOString();

  try {
    const [
      leadsKarta, leadsKontakt, leadsGen,
      ctaAll, faqSearch, faqCta, aiClicks,
      dripAll, textLib,
    ] = await Promise.all([
      supabase.from("ai_map_leads").select("id, created_at, name, company, email, total_potential, total_score", { count: "exact" }).order("created_at", { ascending: false }).limit(200),
      supabase.from("leads").select("id, created_at, name, company, email", { count: "exact" }).order("created_at", { ascending: false }).limit(200),
      supabase.from("genomlysning_leads").select("id, created_at, name, company, email", { count: "exact" }).order("created_at", { ascending: false }).limit(200),
      supabase.from("cta_clicks").select("created_at, button, page_path, lead_label").gte("created_at", day(30)).order("created_at", { ascending: false }).limit(1000),
      supabase.from("faq_search_events").select("created_at, query, result_count").gte("created_at", day(30)).order("created_at", { ascending: false }).limit(1000),
      supabase.from("faq_cta_clicks").select("created_at, cta_label, page_path").gte("created_at", day(30)).order("created_at", { ascending: false }).limit(1000),
      supabase.from("ai_karta_clicks").select("created_at, button, page_path").gte("created_at", day(30)).order("created_at", { ascending: false }).limit(1000),
      supabase.from("ai_map_email_sequence").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("text_library").select("id, text_type, topic, target_keyword, word_count, status, used_on_page, created_at").order("created_at", { ascending: false }).limit(100),
    ]);

    const inWindow = (rows: { created_at: string }[] | null, days: number) => {
      if (!rows) return 0;
      const since = day(days);
      return rows.filter((r) => r.created_at >= since).length;
    };

    const groupBy = <T extends Record<string, unknown>>(rows: T[] | null, key: keyof T) => {
      const m = new Map<string, number>();
      (rows ?? []).forEach((r) => {
        const k = String(r[key] ?? "—");
        m.set(k, (m.get(k) ?? 0) + 1);
      });
      return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    };

    // Drip email status
    const drip = (dripAll.data ?? []).map((r: {
      lead_id: string; email: string; unsubscribed_at: string | null;
      step_2_sent_at: string | null; step_5_sent_at: string | null;
      step_9_sent_at: string | null; step_14_sent_at: string | null; created_at: string;
    }) => {
      const steps = [
        { day: 2, at: r.step_2_sent_at },
        { day: 5, at: r.step_5_sent_at },
        { day: 9, at: r.step_9_sent_at },
        { day: 14, at: r.step_14_sent_at },
      ];
      const sent = steps.filter((s) => s.at);
      const next = steps.find((s) => !s.at) ?? null;
      return {
        lead_id: r.lead_id,
        email: r.email,
        created_at: r.created_at,
        steps_sent: sent.length,
        last_step: sent.length ? `D${sent[sent.length - 1].day}` : null,
        next_step: next ? `D${next.day}` : null,
        unsubscribed_at: r.unsubscribed_at,
      };
    });

    const stepsSentTotal = drip.reduce((a, d) => a + d.steps_sent, 0);
    const unsubs = drip.filter((d) => d.unsubscribed_at).length;
    const active = drip.filter((d) => !d.unsubscribed_at && d.next_step).length;

    return json({
      overview: {
        leads_total: (leadsKarta.count ?? 0) + (leadsKontakt.count ?? 0) + (leadsGen.count ?? 0),
        leads_karta: leadsKarta.count ?? 0,
        leads_kontakt: leadsKontakt.count ?? 0,
        leads_genomlysning: leadsGen.count ?? 0,
        leads_7d: inWindow(leadsKarta.data, 7) + inWindow(leadsKontakt.data, 7) + inWindow(leadsGen.data, 7),
        leads_30d: inWindow(leadsKarta.data, 30) + inWindow(leadsKontakt.data, 30) + inWindow(leadsGen.data, 30),
        cta_clicks_30d: (ctaAll.data ?? []).length,
        faq_searches_30d: (faqSearch.data ?? []).length,
        faq_zero_results_30d: (faqSearch.data ?? []).filter((r: { result_count: number }) => (r.result_count ?? 0) === 0).length,
        ai_karta_clicks_30d: (aiClicks.data ?? []).length,
      },
      recent_leads: [
        ...(leadsKarta.data ?? []).map((l) => ({ ...l, source: "karta" as const })),
        ...(leadsKontakt.data ?? []).map((l) => ({ ...l, source: "kontakt" as const })),
        ...(leadsGen.data ?? []).map((l) => ({ ...l, source: "genomlysning" as const })),
      ].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)).slice(0, 8),
      analytics: {
        top_cta: groupBy(ctaAll.data, "button"),
        top_pages: groupBy(ctaAll.data, "page_path"),
        top_faq_queries: groupBy(faqSearch.data, "query"),
        faq_cta: groupBy(faqCta.data, "cta_label"),
        ai_karta_top: groupBy(aiClicks.data, "button"),
      },
      email: {
        total_leads: drip.length,
        active_sequences: active,
        steps_sent_total: stepsSentTotal,
        unsubscribed: unsubs,
        rows: drip.slice(0, 60),
      },
      text_library: textLib.data ?? [],
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
