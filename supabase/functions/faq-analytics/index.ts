import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Lösenordsskydd via Authorization: Bearer <password>
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.replace(/^Bearer\s+/i, "").trim();
  const expected = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  if (!expected || provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "30d"; // 7d | 30d | all
  const now = new Date();
  let since: string | null = null;
  if (range === "7d") {
    since = new Date(now.getTime() - 7 * 86400_000).toISOString();
  } else if (range === "30d") {
    since = new Date(now.getTime() - 30 * 86400_000).toISOString();
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1) Sökningar — vi behöver opened_question per query
  let searchQ = supabase
    .from("faq_search_events")
    .select("query, opened_question, created_at")
    .limit(5000)
    .order("created_at", { ascending: false });
  if (since) searchQ = searchQ.gte("created_at", since);
  const { data: searches, error: e1 } = await searchQ;
  if (e1) return json({ error: e1.message }, 500);

  // 2) CTA-klick (kontaktformulär-öppningar) med query/opened_question
  let clickQ = supabase
    .from("faq_cta_clicks")
    .select("query, opened_question, cta_label, paket, page_path, created_at")
    .limit(5000)
    .order("created_at", { ascending: false });
  if (since) clickQ = clickQ.gte("created_at", since);
  const { data: clicks, error: e2 } = await clickQ;
  if (e2) return json({ error: e2.message }, 500);

  // Aggregat 1: vilka frågor öppnas oftast EFTER en sökning
  // (rad i faq_search_events där opened_question är satt)
  const openedAfterSearch = new Map<
    string,
    { question: string; opens: number; queries: Set<string> }
  >();
  for (const r of searches ?? []) {
    if (!r.opened_question) continue;
    const key = r.opened_question;
    const cur =
      openedAfterSearch.get(key) ??
      { question: key, opens: 0, queries: new Set<string>() };
    cur.opens += 1;
    if (r.query) cur.queries.add(r.query);
    openedAfterSearch.set(key, cur);
  }
  const topOpened = [...openedAfterSearch.values()]
    .map((x) => ({
      question: x.question,
      opens: x.opens,
      top_queries: [...x.queries].slice(0, 5),
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 25);

  // Aggregat 2: vilka söktermer leder till flest CTA-klick
  // (rad i faq_cta_clicks där query är satt)
  const termToClicks = new Map<
    string,
    { term: string; clicks: number; sample_questions: Set<string> }
  >();
  for (const r of clicks ?? []) {
    const t = (r.query ?? "").trim().toLowerCase();
    if (!t) continue;
    const cur =
      termToClicks.get(t) ??
      { term: t, clicks: 0, sample_questions: new Set<string>() };
    cur.clicks += 1;
    if (r.opened_question) cur.sample_questions.add(r.opened_question);
    termToClicks.set(t, cur);
  }
  const topTerms = [...termToClicks.values()]
    .map((x) => ({
      term: x.term,
      clicks: x.clicks,
      sample_questions: [...x.sample_questions].slice(0, 3),
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 25);

  return json({
    range,
    totals: {
      searches: searches?.length ?? 0,
      cta_clicks: clicks?.length ?? 0,
      searches_with_open: topOpened.reduce((s, x) => s + x.opens, 0),
      cta_with_query: topTerms.reduce((s, x) => s + x.clicks, 0),
    },
    top_opened_after_search: topOpened,
    top_query_terms_to_cta: topTerms,
  });
});
