// AI-KONTORET — ägarens uppladdning av de riktiga produktfilerna till en
// PRIVAT bucket. Endast x-admin-token. Sökvägarna kommer från
// ai_kontoret_assets och kan inte sättas fritt av klienten.
import {
  corsHeaders,
  json,
  isAdmin,
  activeAssets,
  dbPatch,
  serviceEnv,
  ASSET_BUCKET,
  launchReadiness,
} from "../_shared/aiKontoret.ts";

const MAX_BYTES = 40 * 1024 * 1024;

function decodeBase64(b64: string): Uint8Array {
  const clean = b64.replace(/^data:application\/pdf;base64,/, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!isAdmin(req)) return json({ error: "unauthorized" }, 401);

  try {
    const body = await req.json().catch(() => ({}));
    const product = body?.product;
    if (product !== "guide" && product !== "vault") return json({ error: "invalid_product" }, 400);
    const b64 = typeof body?.pdf_base64 === "string" ? body.pdf_base64 : "";
    if (b64.length < 100) return json({ error: "pdf_missing" }, 400);

    let bytes: Uint8Array;
    try {
      bytes = decodeBase64(b64);
    } catch {
      return json({ error: "pdf_decode_failed" }, 400);
    }
    if (bytes.length > MAX_BYTES) return json({ error: "pdf_too_large" }, 400);
    // Enkel PDF-signaturkontroll (%PDF-)
    const head = new TextDecoder().decode(bytes.slice(0, 5));
    if (head !== "%PDF-") return json({ error: "not_a_pdf" }, 400);

    const assets = await activeAssets();
    const asset = assets.find((a) => a.product === product);
    if (!asset) return json({ error: "asset_row_missing" }, 409);

    const { url, key, ok } = serviceEnv();
    if (!ok) return json({ error: "service_role_missing" }, 500);

    const up = await fetch(`${url}/storage/v1/object/${ASSET_BUCKET}/${asset.storage_path}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!up.ok) {
      console.error("[ai-kontoret-upload-asset] storage error", up.status);
      return json({ error: "upload_failed" }, 502);
    }

    await dbPatch("ai_kontoret_assets", `product=eq.${product}&version=eq.${asset.version}`, {
      file_bytes: bytes.length,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const readiness = await launchReadiness();
    return json({
      uploaded: true,
      product,
      storage_path: asset.storage_path,
      file_bytes: bytes.length,
      readiness,
    });
  } catch (err) {
    console.error("[ai-kontoret-upload-asset]", err);
    return json({ error: "unexpected_error" }, 500);
  }
});
