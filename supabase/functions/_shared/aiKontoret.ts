// ============================================================================
// AI-KONTORET — delad server-logik för checkout, webhook och leverans.
// Ingen hemlighet får någonsin returneras till klienten från dessa helpers.
// ============================================================================

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, stripe-signature",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export {
  ASSET_BUCKET,
  ASSET_PATHS,
  CATALOG,
  LEGAL_ACK_TEXT,
  LEGAL_OWNER_CONFIRMED,
  MIN_ASSET_BYTES,
  PRODUCT_VERSION,
  SIGNED_URL_TTL,
  SITE_URL,
  SUPPORT_EMAIL,
  VAT_CLASSIFICATION_CONFIRMED,
  assetReady,
  assetsForProduct,
  buildConsentRecord,
  composeLaunchChecks,
  isProduct,
  legalGate,
  validateSession,
  vatGate,
  type AssetKey,
  type Product,
} from "./aiKontoretPurchase.ts";

import {
  ASSET_BUCKET,
  CATALOG,
  LEGAL_OWNER_CONFIRMED,
  PRODUCT_VERSION,
  SIGNED_URL_TTL,
  VAT_CLASSIFICATION_CONFIRMED,
  assetReady,
  composeLaunchChecks,
  legalGate,
  vatGate,
  type AssetKey,
} from "./aiKontoretPurchase.ts";

export function stripeKey(): string | null {
  const k = Deno.env.get("STRIPE_SECRET_KEY");
  return k && k.length > 10 ? k : null;
}

export function webhookSecret(): string | null {
  const s = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  return s && s.length > 10 ? s : null;
}

/** Minimal Stripe REST-klient (form-encoded) – ingen SDK behövs. */
export async function stripeFetch(
  path: string,
  init: { method?: string; body?: Record<string, string> } = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const key = stripeKey();
  if (!key) return { ok: false, status: 503, data: { error: "stripe_not_configured" } };
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: init.body ? new URLSearchParams(init.body).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/** Konstant-tidsjämförelse av hexsträngar. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifierar Stripe-webhookens signatur (t=…,v1=…) server-side.
 * Returnerar false vid saknad header, fel signatur eller för gammal tidsstämpel.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header) return false;
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=", 2);
    if (k?.trim() === "t") timestamp = v?.trim() ?? "";
    if (k?.trim() === "v1" && v) signatures.push(v.trim());
  }
  if (!timestamp || signatures.length === 0) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signatures.some((s) => timingSafeEqual(s, expected));
}

// ── Supabase (service role) ─────────────────────────────────────────
export function serviceEnv() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return { url, key, ok: Boolean(url && key) };
}

async function restFetch(path: string, init: RequestInit = {}) {
  const { url, key } = serviceEnv();
  return await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export async function dbSelect(path: string): Promise<any[]> {
  const res = await restFetch(path);
  if (!res.ok) return [];
  return (await res.json().catch(() => [])) as any[];
}

export async function dbInsert(table: string, row: Record<string, unknown>, upsert = false) {
  const res = await restFetch(table, {
    method: "POST",
    headers: {
      Prefer: upsert ? "resolution=merge-duplicates,return=representation" : "return=representation",
    },
    body: JSON.stringify(row),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function dbPatch(table: string, filter: string, row: Record<string, unknown>) {
  const res = await restFetch(`${table}?${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export type AssetRow = {
  product: AssetKey;
  version: string;
  storage_path: string;
  label: string;
  uploaded_at: string | null;
  file_bytes: number | null;
  active: boolean;
};

export async function activeAssets(): Promise<AssetRow[]> {
  return (await dbSelect(
    "ai_kontoret_assets?active=eq.true&select=product,version,storage_path,label,uploaded_at,file_bytes,active",
  )) as AssetRow[];
}

/** Filen räknas som klar först när den faktiskt finns i den privata bucketen och inte är tom. */
export async function assetExists(storagePath: string): Promise<boolean> {
  const { url, key } = serviceEnv();
  if (!url || !key) return false;
  const slash = storagePath.lastIndexOf("/");
  const prefix = slash > 0 ? storagePath.slice(0, slash) : "";
  const name = slash > 0 ? storagePath.slice(slash + 1) : storagePath;
  const res = await fetch(`${url}/storage/v1/object/list/${ASSET_BUCKET}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, limit: 100, search: name }),
  });
  if (!res.ok) return false;
  const list = (await res.json().catch(() => [])) as { name: string; metadata?: { size?: number } }[];
  const hit = Array.isArray(list) ? list.find((o) => o.name === name) : undefined;
  if (!hit) return false;
  const size = Number(hit.metadata?.size ?? 0);
  return assetReady({ exists: true, fileBytes: size > 0 ? size : null });
}

export async function createSignedUrl(storagePath: string, ttl = SIGNED_URL_TTL): Promise<string | null> {
  const { url, key } = serviceEnv();
  if (!url || !key) return null;
  const res = await fetch(`${url}/storage/v1/object/sign/${ASSET_BUCKET}/${storagePath}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: ttl }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as { signedURL?: string } | null;
  if (!data?.signedURL) return null;
  return `${url}/storage/v1${data.signedURL}`;
}

export async function legalConfirmed(): Promise<boolean> {
  const rows = await dbSelect("ai_kontoret_launch?select=legal_confirmed&limit=1");
  return legalGate({
    dbConfirmed: Boolean(rows[0]?.legal_confirmed),
    ownerConfirmed: LEGAL_OWNER_CONFIRMED,
  });
}

/** Sammanställer lanseringsspärren. Endast booleans – aldrig hemligheter. */
export async function launchReadiness() {
  const assets = await activeAssets();
  const guide = assets.find((a) => a.product === "guide");
  const vault = assets.find((a) => a.product === "vault");
  const [guideExists, vaultExists, legal] = await Promise.all([
    guide ? assetExists(guide.storage_path) : Promise.resolve(false),
    vault ? assetExists(vault.storage_path) : Promise.resolve(false),
    legalConfirmed(),
  ]);
  const guideOk = assetReady({
    exists: guideExists,
    fileBytes: guide?.file_bytes ?? null,
  });
  const vaultOk = assetReady({
    exists: vaultExists,
    fileBytes: vault?.file_bytes ?? null,
  });
  const vat = vatGate({ catalog: CATALOG, confirmed: VAT_CLASSIFICATION_CONFIRMED });
  const checks = {
    stripe: Boolean(stripeKey()),
    webhook_secret: Boolean(webhookSecret()),
    service_role: serviceEnv().ok,
    email: Boolean(Deno.env.get("RESEND_API_KEY")),
    asset_guide: guideOk,
    asset_vault: vaultOk,
    legal_confirmed: legal,
    vat_classified: vat.ok,
  };
  const { ready } = composeLaunchChecks(checks);
  return {
    ready,
    checks,
    version: PRODUCT_VERSION,
    vat_reason: vat.ok ? null : vat.reason ?? null,
    asset_paths: {
      guide: guide?.storage_path ?? null,
      vault: vault?.storage_path ?? null,
    },
  };
}

export function isAdmin(req: Request): boolean {
  const token = req.headers.get("x-admin-token") ?? "";
  const admin = Deno.env.get("ADMIN_SECRET") ?? "";
  const fallback = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  if (!token) return false;
  return (admin.length > 0 && token === admin) || (fallback.length > 0 && token === fallback);
}
