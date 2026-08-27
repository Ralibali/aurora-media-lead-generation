// ============================================================================
// AI-KONTORET — rena köpregler (inga hemligheter, ingen I/O).
// Används av edge-funktioner och av automatiska tester.
// ============================================================================

export type Product = "guide" | "vault" | "bundle";
export type AssetKey = "guide" | "vault";
export type VatClass = "electronic_publication_6" | "ess_25" | "unset";

export const PRODUCT_VERSION = "1.0";
export const SUPPORT_EMAIL = "info@auroramedia.se";
export const SITE_URL = "https://auroramedia.se";
export const ASSET_BUCKET = "ai-kontoret-assets";
export const SIGNED_URL_TTL = 60 * 60 * 24 * 3;
export const MIN_ASSET_BYTES = 10_000;

/** UTKAST. Ägaren måste sätta LEGAL_OWNER_CONFIRMED = true efter att ha godkänt formuleringen. */
export const LEGAL_ACK_TEXT =
  "Jag samtycker till att leveransen av det digitala innehållet påbörjas omedelbart. Jag förstår att jag då förlorar ångerrätten enligt distansavtalslagen för denna digitala produkt.";

export const LEGAL_OWNER_CONFIRMED = false;
export const VAT_CLASSIFICATION_CONFIRMED = false;
export const CONSENT_DEFAULT_CHECKED = false;

export const ASSET_PATHS: Record<AssetKey, string> = {
  guide: "ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf",
  vault: "ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf",
};

/**
 * Stripe tax codes (confirm in Stripe Tax catalog before live).
 * electronic_publication_6 → digital books / e-publications (SE 6% candidate).
 * ess_25 → general electronically supplied digital content (SE 25%).
 */
export const STRIPE_TAX_CODES = {
  electronic_publication_6: "txcd_10301100",
  ess_25: "txcd_10701800",
} as const;

export type CatalogItem = {
  sku: string;
  name: string;
  amount: number;
  currency: string;
  assets: AssetKey[];
  vat_class: VatClass;
  tax_code: string;
};

export const CATALOG: Record<Product, CatalogItem> = {
  guide: {
    sku: "ai-kontoret-guide",
    name: "AI-KONTORET – Guide v1.0 (PDF)",
    amount: 19900,
    currency: "sek",
    assets: ["guide"],
    vat_class: "electronic_publication_6",
    tax_code: STRIPE_TAX_CODES.electronic_publication_6,
  },
  vault: {
    sku: "ai-kontoret-prompt-vault",
    name: "AI-KONTORET – Prompt Vault v1.0 (PDF)",
    amount: 19900,
    currency: "sek",
    assets: ["vault"],
    vat_class: "ess_25",
    tax_code: STRIPE_TAX_CODES.ess_25,
  },
  bundle: {
    sku: "ai-kontoret-bundle",
    name: "AI-KONTORET – Guide + Prompt Vault v1.0 (PDF)",
    amount: 34900,
    currency: "sek",
    assets: ["guide", "vault"],
    vat_class: "ess_25",
    tax_code: STRIPE_TAX_CODES.ess_25,
  },
};

export function isProduct(v: unknown): v is Product {
  return v === "guide" || v === "vault" || v === "bundle";
}

export function assetsForProduct(product: Product): AssetKey[] {
  return [...CATALOG[product].assets];
}

export function displayPriceSek(product: Product): number {
  return CATALOG[product].amount / 100;
}

export function vatGate(input: {
  catalog: Record<Product, Pick<CatalogItem, "vat_class" | "tax_code">>;
  confirmed: boolean;
}): { ok: boolean; reason?: string } {
  if (!input.confirmed) return { ok: false, reason: "vat_unconfirmed" };
  for (const key of ["guide", "vault", "bundle"] as const) {
    const item = input.catalog[key];
    if (item.vat_class === "unset") return { ok: false, reason: `${key}_vat_unset` };
  }
  if (input.catalog.vault.vat_class === "electronic_publication_6") {
    return { ok: false, reason: "vault_not_assumed_publication" };
  }
  if (input.catalog.bundle.vat_class === "electronic_publication_6") {
    return { ok: false, reason: "bundle_must_not_inherit_guide" };
  }
  if (input.catalog.bundle.tax_code === input.catalog.guide.tax_code &&
      input.catalog.guide.vat_class === "electronic_publication_6") {
    return { ok: false, reason: "bundle_inherits_guide_tax_code" };
  }
  return { ok: true };
}

export function legalGate(input: { dbConfirmed: boolean; ownerConfirmed: boolean }): boolean {
  return input.dbConfirmed && input.ownerConfirmed;
}

export type LaunchCheckMap = Record<string, boolean>;

export function composeLaunchChecks(checks: LaunchCheckMap): { ready: boolean; failed: string[] } {
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
  return { ready: failed.length === 0, failed };
}

export function validateSession(session: {
  metadata?: { product?: unknown; sku?: unknown };
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
}): { ok: true; product: Product } | { ok: false; reason: string } {
  const product = session?.metadata?.product;
  if (!isProduct(product)) return { ok: false, reason: "unknown_product" };
  const item = CATALOG[product];
  if (session?.metadata?.sku !== item.sku) return { ok: false, reason: "sku_mismatch" };
  if (session?.payment_status !== "paid") return { ok: false, reason: "not_paid" };
  if (Number(session?.amount_total) !== item.amount) return { ok: false, reason: "amount_mismatch" };
  if (String(session?.currency ?? "").toLowerCase() !== item.currency) {
    return { ok: false, reason: "currency_mismatch" };
  }
  return { ok: true, product };
}

export function evaluateReturnSession(input: {
  sessionId: string;
  purchase?: { product: unknown; delivered_at?: unknown; email?: string } | null;
  stripeSession?: {
    metadata?: { product?: unknown; sku?: unknown };
    payment_status?: unknown;
    amount_total?: unknown;
    currency?: unknown;
  } | null;
}): { paid: boolean; reason?: string; product?: Product; delivered?: boolean } {
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(input.sessionId)) {
    return { paid: false, reason: "invalid_session_id" };
  }
  if (input.purchase) {
    const product = input.purchase.product;
    if (!isProduct(product)) return { paid: false, reason: "unknown_product" };
    return { paid: true, product, delivered: Boolean(input.purchase.delivered_at) };
  }
  if (!input.stripeSession) return { paid: false, reason: "session_not_found" };
  const check = validateSession(input.stripeSession);
  if (!check.ok) return { paid: false, reason: check.reason };
  return { paid: true, product: check.product, delivered: false };
}

export function webhookIdempotencyDecision(input: {
  eventAlreadySeen: boolean;
  purchaseAlreadyDelivered: boolean;
}): "duplicate_event" | "duplicate_delivery" | "proceed" {
  if (input.eventAlreadySeen) return "duplicate_event";
  if (input.purchaseAlreadyDelivered) return "duplicate_delivery";
  return "proceed";
}

export function assetReady(input: { exists: boolean; fileBytes: number | null | undefined }): boolean {
  if (!input.exists) return false;
  if (input.fileBytes == null) return true;
  const bytes = Number(input.fileBytes);
  return Number.isFinite(bytes) && bytes >= MIN_ASSET_BYTES;
}

export function unsignedPathIsNotProof(path: string): boolean {
  return !path.includes("/object/sign/") && !path.includes("token=");
}

export function checkoutAmountIsInclusive(product: Product, chargedOre: number): boolean {
  return chargedOre === CATALOG[product].amount;
}

export function legalAckRequired(legalAck: unknown): boolean {
  return legalAck === true;
}

export function buildConsentRecord(input: {
  product: Product;
  atIso: string;
}): { legal_ack: true; legal_ack_text: string; legal_ack_at: string; product: Product; amount: number; currency: string } {
  const item = CATALOG[input.product];
  return {
    legal_ack: true,
    legal_ack_text: LEGAL_ACK_TEXT,
    legal_ack_at: input.atIso,
    product: input.product,
    amount: item.amount,
    currency: item.currency,
  };
}

export function deliveryEmailIncludesAgreement(html: string, text: string): boolean {
  const needle = LEGAL_ACK_TEXT.slice(0, 40);
  return html.includes(needle) && text.includes(needle) && (html.includes("/villkor") || text.includes("/villkor"));
}
