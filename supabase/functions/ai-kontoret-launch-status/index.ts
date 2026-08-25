// AI-KONTORET — lanseringsspärr (read-only). Returnerar ENDAST booleans.
// Publik: sidan använder svaret för att aldrig visa döda köpknappar.
import { corsHeaders, json, isAdmin, launchReadiness, CATALOG } from "../_shared/aiKontoret.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const r = await launchReadiness();
    const body: Record<string, unknown> = {
      ready: r.ready,
      checks: r.checks,
      version: r.version,
      prices: {
        guide: CATALOG.guide.amount / 100,
        vault: CATALOG.vault.amount / 100,
        bundle: CATALOG.bundle.amount / 100,
      },
    };
    if (isAdmin(req)) body.asset_paths = r.asset_paths;
    return json(body);
  } catch (err) {
    console.error("[ai-kontoret-launch-status]", err);
    return json({ ready: false, checks: {}, error: "status_unavailable" }, 200);
  }
});
