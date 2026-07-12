// Edge function: firecrawl-prospect-search
// Admin-only. Runs a Firecrawl web search and stores prospect leads.
// No email extraction, no personal data collection.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  buildQuery,
  isDirectoryDomain,
  normalizeDomain,
  pickContactPage,
  scoreFit,
  type FirecrawlLink,
  type NeedType,
} from "./lib.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const RATE = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const cur = RATE.get(key);
  if (!cur || cur.resetAt < now) {
    RATE.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (cur.count >= RATE_MAX) return false;
  cur.count += 1;
  return true;
}

type FirecrawlSearchResult = {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  links?: FirecrawlLink[];
  metadata?: { title?: string; description?: string; sourceURL?: string };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const ADMIN = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || (token !== PASSWORD && token !== ADMIN)) return json({ error: "Unauthorized" }, 401);

  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") ?? "";
  if (!FIRECRAWL_API_KEY) {
    return json({ error: "FIRECRAWL_API_KEY saknas i miljön. Länka Firecrawl-anslutningen i Lovable Connectors." }, 500);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  let body: {
    action?: "search" | "list_campaigns" | "list_leads" | "update_lead";
    campaignName?: string;
    query?: string;
    location?: string;
    needType?: NeedType;
    industry?: string | null;
    limit?: number;
    campaignId?: string;
    leadId?: string;
    status?: string;
    outreach_note?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = body.action ?? "search";

  try {
    if (action === "list_campaigns") {
      const { data, error } = await admin
        .from("prospecting_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return json({ campaigns: data ?? [] });
    }

    if (action === "list_leads") {
      if (!body.campaignId) return json({ error: "Missing campaignId" }, 400);
      const { data, error } = await admin
        .from("prospecting_leads")
        .select("*")
        .eq("campaign_id", body.campaignId)
        .order("fit_score", { ascending: false });
      if (error) throw error;
      return json({ leads: data ?? [] });
    }

    if (action === "update_lead") {
      if (!body.leadId) return json({ error: "Missing leadId" }, 400);
      const patch: Record<string, unknown> = {};
      const ALLOWED = new Set([
        "new", "reviewed", "contacted", "replied", "qualified", "converted", "rejected", "do_not_contact",
      ]);
      if (body.status !== undefined) {
        if (!ALLOWED.has(body.status)) return json({ error: "Invalid status" }, 400);
        patch.status = body.status;
        if (body.status === "contacted") patch.contacted_at = new Date().toISOString();
      }
      if (body.outreach_note !== undefined) patch.outreach_note = body.outreach_note;
      if (Object.keys(patch).length === 0) return json({ error: "Nothing to update" }, 400);
      const { error } = await admin.from("prospecting_leads").update(patch).eq("id", body.leadId);
      if (error) throw error;
      return json({ ok: true });
    }

    // action === "search"
    if (!rateLimit(token)) return json({ error: "Rate limit — försök igen om en minut." }, 429);

    const campaignName = (body.campaignName ?? "").trim();
    const freeText = (body.query ?? "").trim();
    const location = (body.location ?? "Sweden").trim() || "Sweden";
    const needType: NeedType = (["webb","ehandel","ai","valfritt"] as const).includes(body.needType as NeedType)
      ? (body.needType as NeedType)
      : "valfritt";
    const industry = body.industry?.trim() || null;
    const limit = Math.max(1, Math.min(20, Number(body.limit ?? 10)));

    if (!campaignName) return json({ error: "campaignName krävs" }, 400);
    if (!freeText) return json({ error: "query krävs" }, 400);

    const queryString = buildQuery({ freeText, needType, industry, location });

    const { data: campaign, error: cErr } = await admin
      .from("prospecting_campaigns")
      .insert({
        name: campaignName,
        query: queryString,
        location,
        need_type: needType,
        industry,
        result_limit: limit,
        status: "running",
      })
      .select()
      .single();
    if (cErr) throw cErr;

    let firecrawlBody: { web?: FirecrawlSearchResult[]; data?: FirecrawlSearchResult[] } = {};
    try {
      const fcRes = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryString,
          limit,
          location: { country: "se", languages: ["sv"] },
          scrapeOptions: { formats: ["markdown", "links"], onlyMainContent: true },
        }),
      });
      if (!fcRes.ok) {
        const detail = await fcRes.text();
        await admin
          .from("prospecting_campaigns")
          .update({ status: "failed", error_message: `Firecrawl ${fcRes.status}: ${detail.slice(0, 400)}` })
          .eq("id", campaign.id);
        return json({ error: "Firecrawl request failed", status: fcRes.status, details: detail }, fcRes.status);
      }
      firecrawlBody = await fcRes.json();
    } catch (e) {
      await admin
        .from("prospecting_campaigns")
        .update({ status: "failed", error_message: e instanceof Error ? e.message : String(e) })
        .eq("id", campaign.id);
      throw e;
    }

    const rawResults: FirecrawlSearchResult[] = firecrawlBody.web ?? firecrawlBody.data ?? [];

    const dedup = new Map<string, {
      row: {
        campaign_id: string;
        company_name: string;
        domain: string;
        website_url: string;
        source_url: string;
        city: string | null;
        industry: string | null;
        description: string | null;
        fit_score: number;
        observed_signals: { code: string; label: string }[];
        contact_page_url: string | null;
      };
    }>();

    for (const r of rawResults) {
      const url = r.url ?? r.metadata?.sourceURL ?? "";
      const domain = normalizeDomain(url);
      if (!domain || isDirectoryDomain(domain)) continue;
      if (dedup.has(domain)) continue;

      const companyName = (r.title ?? r.metadata?.title ?? domain).replace(/\s*[|·\-–—]\s*.*$/, "").trim() || domain;
      const description = (r.description ?? r.metadata?.description ?? null)?.slice(0, 500) ?? null;
      const contactUrl = pickContactPage(domain, r.links);
      const { score, signals } = scoreFit({
        needType,
        industry,
        location,
        markdown: r.markdown ?? null,
        contactUrl,
        domain,
      });

      // City detection is heuristic; only set when location string appears verbatim.
      let city: string | null = null;
      if (location && r.markdown && r.markdown.toLowerCase().includes(location.toLowerCase())) {
        city = location;
      }

      dedup.set(domain, {
        row: {
          campaign_id: campaign.id as string,
          company_name: companyName.slice(0, 200),
          domain,
          website_url: `https://${domain}`,
          source_url: url,
          city,
          industry,
          description,
          fit_score: score,
          observed_signals: signals,
          contact_page_url: contactUrl,
        },
      });
    }

    const rows = [...dedup.values()].map((v) => v.row);
    if (rows.length) {
      const { error: insErr } = await admin
        .from("prospecting_leads")
        .upsert(rows, { onConflict: "campaign_id,domain", ignoreDuplicates: true });
      if (insErr) {
        await admin
          .from("prospecting_campaigns")
          .update({ status: "failed", error_message: insErr.message })
          .eq("id", campaign.id);
        throw insErr;
      }
    }

    await admin
      .from("prospecting_campaigns")
      .update({ status: "completed" })
      .eq("id", campaign.id);

    return json({ ok: true, campaignId: campaign.id, inserted: rows.length, queryString });
  } catch (err) {
    console.error("[firecrawl-prospect-search] error", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
