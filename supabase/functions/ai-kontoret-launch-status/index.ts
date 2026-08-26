// AI-KONTORET — lanseringsspärr (read) + ägarens juridiska godkännande (write).
// Publikt svar innehåller ENDAST booleans, aldrig hemligheter.
import {
  corsHeaders,
  json,
  isAdmin,
  launchReadiness,
  dbPatch,
  CATALOG,
  activeAssets,
  assetExists,
  createSignedUrl,
} from "../_shared/aiKontoret.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    // Ägaren kan sätta/ta bort den juridiska bekräftelsen (owner gate).
    if (req.method === "POST" && req.headers.get("x-admin-token")) {
      if (!isAdmin(req)) return json({ error: "unauthorized" }, 401);
      const body = await req.json().catch(() => ({}));
      if (body?.action === "set_legal") {
        const value = body?.legal_confirmed === true;
        await dbPatch("ai_kontoret_launch", "id=eq.true", {
          legal_confirmed: value,
          legal_confirmed_at: value ? new Date().toISOString() : null,
          legal_confirmed_by: value ? String(body?.by ?? "owner").slice(0, 120) : null,
          updated_at: new Date().toISOString(),
        });
      }
    }

      // Förhandsgranskning: korta signerade länkar + filmetadata (endast ägare).
      if (body?.action === "preview_assets") {
        const assets = await activeAssets();
        const items = await Promise.all(
          assets.map(async (a) => {
            const exists = await assetExists(a.storage_path);
            return {
              product: a.product,
              label: a.label,
              version: a.version,
              storage_path: a.storage_path,
              uploaded_at: a.uploaded_at,
              file_bytes: a.file_bytes,
              exists,
              url: exists ? await createSignedUrl(a.storage_path, 600) : null,
            };
          }),
        );
        return json({ assets: items, ttl_seconds: 600 });
      }

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
