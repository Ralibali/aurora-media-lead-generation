// AI-KONTORET — lanseringsspärr (read) + ägarens juridiska godkännande (write).
// Publikt svar innehåller ENDAST booleans, aldrig hemligheter.
import {
  corsHeaders,
  json,
  isAdmin,
  launchReadiness,
  dbPatch,
  dbInsert,
  CATALOG,
  activeAssets,
  assetExists,
  createSignedUrl,
  listRevisions,
  nextRevision,
  archivePath,
  copyObject,
  markCurrentRevision,
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

      // Versionshistorik: alla revisioner med signerade förhandsvisningslänkar.
      if (body?.action === "list_revisions") {
        const product = body?.product === "guide" || body?.product === "vault" ? body.product : undefined;
        const rows = await listRevisions(product);
        const items = await Promise.all(
          rows.map(async (r) => ({
            id: r.id,
            product: r.product,
            revision: r.revision,
            version: r.version,
            archive_path: r.archive_path,
            original_filename: r.original_filename,
            file_bytes: r.file_bytes,
            note: r.note,
            is_current: r.is_current,
            created_at: r.created_at,
            restored_at: r.restored_at,
            url: await createSignedUrl(r.archive_path, 600),
          })),
        );
        return json({ revisions: items, ttl_seconds: 600 });
      }

      // Återställ en tidigare revision till live-sökvägen (skapar en ny revision).
      if (body?.action === "restore_revision") {
        const product = body?.product;
        const revision = Number(body?.revision);
        if (product !== "guide" && product !== "vault") return json({ error: "invalid_product" }, 400);
        if (!Number.isFinite(revision)) return json({ error: "invalid_revision" }, 400);

        const rows = await listRevisions(product);
        const target = rows.find((r) => r.revision === revision);
        if (!target) return json({ error: "revision_not_found" }, 404);

        const assets = await activeAssets();
        const asset = assets.find((a) => a.product === product);
        if (!asset) return json({ error: "asset_row_missing" }, 409);

        const newRevision = await nextRevision(product);
        const newPath = archivePath(product, newRevision);
        const okLive = await copyObject(target.archive_path, asset.storage_path);
        if (!okLive) return json({ error: "restore_failed" }, 502);
        await copyObject(target.archive_path, newPath);

        await dbInsert("ai_kontoret_asset_revisions", {
          product,
          revision: newRevision,
          version: target.version,
          archive_path: newPath,
          original_filename: target.original_filename,
          file_bytes: target.file_bytes,
          note: `Återställd från revision ${target.revision}`,
          uploaded_by: "owner",
          is_current: true,
          restored_at: new Date().toISOString(),
        });
        await markCurrentRevision(product, newRevision);
        await dbPatch("ai_kontoret_assets", `product=eq.${product}&version=eq.${asset.version}`, {
          file_bytes: target.file_bytes,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return json({ restored: true, product, from_revision: target.revision, revision: newRevision });
      }
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
