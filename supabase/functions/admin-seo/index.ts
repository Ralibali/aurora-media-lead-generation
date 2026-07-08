// admin-seo — hämtar toppqueries och toppsidor från Google Search Console.
// Skyddad via FAQ_ANALYTICS_PASSWORD (Bearer).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const SITE = "https://auroramedia.se/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const pwd = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const adminPwd = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || (token !== pwd && token !== adminPwd)) return json({ error: "unauthorized" }, 401);

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovableKey || !gscKey) return json({ error: "GSC connector not configured" }, 500);

  const headers = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gscKey,
    "Content-Type": "application/json",
  };

  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 28 * 86400_000).toISOString().slice(0, 10);
  const siteEnc = encodeURIComponent(SITE);
  const searchUrl = `${GATEWAY}/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`;

  const query = async (dims: string[]) => {
    const res = await fetch(searchUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: dims, rowLimit: 25 }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GSC ${res.status}: ${body}`);
    }
    const data = await res.json();
    return data.rows ?? [];
  };

  try {
    const [queries, pages, totals] = await Promise.all([
      query(["query"]),
      query(["page"]),
      query([]),
    ]);

    return json({
      site: SITE,
      range: { start, end },
      totals: totals[0] ?? null,
      queries,
      pages,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return json({ error: msg }, 500);
  }
});
