// ============================================================================
// AI-KONTORET — rena köpregler (inga hemligheter, ingen I/O).
// Används av edge-funktioner och av automatiska tester.
// ============================================================================

export type Product = "guide" | "vault" | "bundle";
export type AssetKey = "guide" | "vault";
export type VatClass = "electronic_publication_6" | "ess_25" | "split_two_supplies" | "unset";
export type DeliveryStatus = "pending" | "failed" | "delivered";
export type WithdrawalStatus = "received" | "reviewing" | "accepted" | "rejected" | "refunded";

export const PRODUCT_VERSION = "1.0";
export const SUPPORT_EMAIL = "info@auroramedia.se";
export const SITE_URL = "https://auroramedia.se";
export const ASSET_BUCKET = "ai-kontoret-assets";
export const SIGNED_URL_TTL = 60 * 60 * 24 * 3;
export const MIN_ASSET_BYTES = 10_000;
export const WITHDRAWAL_PATH = "/angra-kop";
export const STANDARD_WITHDRAWAL_INFO_URL =
  "https://www.konsumentverket.se/for-konsument/kopa-varor-och-tjanster/angerratt/";
export const WITHDRAWAL_STATUSES: WithdrawalStatus[] = [
  "received",
  "reviewing",
  "accepted",
  "rejected",
  "refunded",
];

/**
 * Verified trader data already present in the project.
 * Street/postal address is intentionally omitted — it is not verified here.
 */
export const TRADER = {
  legalName: "Aurora Media AB",
  orgNr: "559272-0220",
  locality: "Linköping",
  country: "Sverige",
  email: SUPPORT_EMAIL,
  street: null as string | null,
  postalAddressComplete: false,
} as const;

/**
 * UTKAST. Samma sträng måste användas i frontend, Stripe-metadata,
 * köprad och leveransmejl. LEGAL_OWNER_CONFIRMED förblir false.
 */
export const LEGAL_ACK_TEXT =
  "Jag samtycker uttryckligen till att leveransen av det digitala innehållet påbörjas omedelbart och går med på att det därigenom inte finns någon ångerrätt när leveransen har påbörjats.";

export const LEGAL_OWNER_CONFIRMED = false;
export const VAT_CLASSIFICATION_CONFIRMED = false;
export const CONSENT_DEFAULT_CHECKED = false;

export const ASSET_PATHS: Record<AssetKey, string> = {
  guide: "ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf",
  vault: "ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf",
};

export const STRIPE_TAX_CODES = {
  electronic_publication_6: "txcd_10301100",
  ess_25: "txcd_10701800",
} as const;

export const BUNDLE_SPLIT = {
  guide_ore: 17450,
  vault_ore: 17450,
  total_ore: 34900,
} as const;

export type CatalogLine = {
  key: AssetKey;
  name: string;
  amount: number;
  vat_class: Exclude<VatClass, "split_two_supplies" | "unset">;
  tax_code: string;
  vat_rate_percent: 6 | 25;
};

export type CatalogItem = {
  sku: string;
  name: string;
  amount: number;
  currency: string;
  assets: AssetKey[];
  vat_class: VatClass;
  tax_code: string;
  lines: CatalogLine[];
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
    lines: [{
      key: "guide",
      name: "AI-KONTORET – Guide v1.0 (PDF)",
      amount: 19900,
      vat_class: "electronic_publication_6",
      tax_code: STRIPE_TAX_CODES.electronic_publication_6,
      vat_rate_percent: 6,
    }],
  },
  vault: {
    sku: "ai-kontoret-prompt-vault",
    name: "AI-KONTORET – Prompt Vault v1.0 (PDF)",
    amount: 19900,
    currency: "sek",
    assets: ["vault"],
    vat_class: "ess_25",
    tax_code: STRIPE_TAX_CODES.ess_25,
    lines: [{
      key: "vault",
      name: "AI-KONTORET – Prompt Vault v1.0 (PDF)",
      amount: 19900,
      vat_class: "ess_25",
      tax_code: STRIPE_TAX_CODES.ess_25,
      vat_rate_percent: 25,
    }],
  },
  bundle: {
    sku: "ai-kontoret-bundle",
    name: "AI-KONTORET – Guide + Prompt Vault v1.0 (PDF)",
    amount: BUNDLE_SPLIT.total_ore,
    currency: "sek",
    assets: ["guide", "vault"],
    vat_class: "split_two_supplies",
    tax_code: STRIPE_TAX_CODES.ess_25,
    lines: [
      {
        key: "guide",
        name: "AI-KONTORET Guide",
        amount: BUNDLE_SPLIT.guide_ore,
        vat_class: "electronic_publication_6",
        tax_code: STRIPE_TAX_CODES.electronic_publication_6,
        vat_rate_percent: 6,
      },
      {
        key: "vault",
        name: "Prompt Vault",
        amount: BUNDLE_SPLIT.vault_ore,
        vat_class: "ess_25",
        tax_code: STRIPE_TAX_CODES.ess_25,
        vat_rate_percent: 25,
      },
    ],
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

export function inclusiveVatParts(grossOre: number, ratePercent: 6 | 25): {
  gross_ore: number;
  net_ore: number;
  vat_ore: number;
  rate_percent: 6 | 25;
} {
  const net_ore = Math.round((grossOre * 100) / (100 + ratePercent));
  return { gross_ore: grossOre, net_ore, vat_ore: grossOre - net_ore, rate_percent: ratePercent };
}

export function vatAllocation(product: Product) {
  const item = CATALOG[product];
  const lines = item.lines.map((line) => ({
    key: line.key,
    name: line.name,
    vat_class: line.vat_class,
    tax_code: line.tax_code,
    ...inclusiveVatParts(line.amount, line.vat_rate_percent),
  }));
  return {
    product,
    sku: item.sku,
    total_ore: item.amount,
    currency: item.currency,
    lines,
    note:
      product === "bundle"
        ? "Två tillhandahållanden. Bundlerabatten 49 kr fördelas lika mot fristående priser 199+199."
        : item.vat_class === "electronic_publication_6"
        ? "Kandidat 6 % elektronisk publikation – obekräftad tills VAT_CLASSIFICATION_CONFIRMED."
        : "Kandidat 25 % elektroniskt tillhandahållen tjänst – obekräftad tills VAT_CLASSIFICATION_CONFIRMED.",
  };
}

export function checkoutLines(product: Product): CatalogLine[] {
  return CATALOG[product].lines.map((line) => ({ ...line }));
}

export function vatGate(input: {
  catalog: Record<Product, Pick<CatalogItem, "vat_class" | "tax_code" | "lines" | "amount">>;
  confirmed: boolean;
}): { ok: boolean; reason?: string } {
  if (!input.confirmed) return { ok: false, reason: "vat_unconfirmed" };
  const { guide, vault, bundle } = input.catalog;
  if (guide.vat_class !== "electronic_publication_6") return { ok: false, reason: "guide_not_publication_candidate" };
  if (vault.vat_class === "electronic_publication_6") return { ok: false, reason: "vault_not_assumed_publication" };
  if (bundle.vat_class === "electronic_publication_6") return { ok: false, reason: "bundle_must_not_inherit_guide" };
  if (bundle.vat_class !== "split_two_supplies") return { ok: false, reason: "bundle_not_split_two_supplies" };
  if (bundle.amount !== BUNDLE_SPLIT.total_ore) return { ok: false, reason: "bundle_total_mismatch" };
  if (bundle.lines.length !== 2) return { ok: false, reason: "bundle_needs_two_lines" };
  const [a, b] = bundle.lines;
  const guideLine = bundle.lines.find((l) => l.key === "guide");
  const vaultLine = bundle.lines.find((l) => l.key === "vault");
  if (!guideLine || !vaultLine) return { ok: false, reason: "bundle_line_keys" };
  if (guideLine.amount !== BUNDLE_SPLIT.guide_ore || vaultLine.amount !== BUNDLE_SPLIT.vault_ore) {
    return { ok: false, reason: "bundle_split_mismatch" };
  }
  if (guideLine.amount + vaultLine.amount !== BUNDLE_SPLIT.total_ore) {
    return { ok: false, reason: "bundle_split_sum" };
  }
  if (guideLine.vat_class !== "electronic_publication_6") return { ok: false, reason: "bundle_guide_line_class" };
  if (vaultLine.vat_class !== "ess_25") return { ok: false, reason: "bundle_vault_line_class" };
  if (guideLine.tax_code === vaultLine.tax_code) return { ok: false, reason: "bundle_lines_same_tax_code" };
  if (a.tax_code === b.tax_code) return { ok: false, reason: "bundle_inherits_guide_tax_code" };
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
}): "duplicate_event" | "duplicate_delivery" | "retry_undelivered" | "proceed" {
  if (input.purchaseAlreadyDelivered) return "duplicate_delivery";
  if (input.eventAlreadySeen) return "retry_undelivered";
  return "proceed";
}

export function deliveryOutcome(input: { linksOk: boolean; emailOk: boolean }): {
  payment_status: "paid";
  delivery_status: DeliveryStatus;
  delivered_at: string | null;
  delivery_initiated: boolean;
} {
  if (input.linksOk && input.emailOk) {
    return {
      payment_status: "paid",
      delivery_status: "delivered",
      delivered_at: "set-by-caller",
      delivery_initiated: true,
    };
  }
  return {
    payment_status: "paid",
    delivery_status: input.linksOk ? "failed" : "failed",
    delivered_at: null,
    delivery_initiated: input.linksOk,
  };
}

export function confirmationMayStateWithdrawalCeased(input: {
  deliveryStatus: DeliveryStatus;
  deliveryInitiated: boolean;
}): boolean {
  return input.deliveryStatus === "delivered" && input.deliveryInitiated;
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
}): {
  legal_ack: true;
  legal_ack_text: string;
  legal_ack_at: string;
  product: Product;
  amount: number;
  currency: string;
} {
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

export function legalAckContinuity(parts: {
  frontend: string;
  stripeMetadata: string;
  purchase: string;
  email: string;
}): boolean {
  return (
    parts.frontend === LEGAL_ACK_TEXT &&
    parts.stripeMetadata === LEGAL_ACK_TEXT &&
    parts.purchase === LEGAL_ACK_TEXT &&
    parts.email === LEGAL_ACK_TEXT
  );
}

export function deliveryEmailIncludesAgreement(html: string, text: string): boolean {
  const needle = LEGAL_ACK_TEXT;
  return html.includes(needle) && text.includes(needle) && (html.includes("/villkor") || text.includes("/villkor"));
}

export function validateWithdrawalRequest(input: {
  name?: unknown;
  email?: unknown;
  sessionId?: unknown;
  product?: unknown;
  description?: unknown;
  confirm?: unknown;
}):
  | {
      ok: true;
      data: {
        name: string;
        email: string;
        session_id: string | null;
        product: Product | null;
        description: string;
        confirm: true;
      };
    }
  | { ok: false; reason: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const sessionRaw = typeof input.sessionId === "string" ? input.sessionId.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 800) : "";
  if (name.length < 2 || name.length > 120) return { ok: false, reason: "name_required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, reason: "email_required" };
  if (input.confirm !== true) return { ok: false, reason: "confirm_required" };
  let session_id: string | null = null;
  if (sessionRaw) {
    if (!/^(cs_|pi_|in_|or_)?[A-Za-z0-9_-]{6,200}$/.test(sessionRaw)) {
      return { ok: false, reason: "session_invalid" };
    }
    session_id = sessionRaw;
  }
  const product = isProduct(input.product) ? input.product : null;
  return { ok: true, data: { name, email, session_id, product, description, confirm: true } };
}

export function withdrawalReceiptIsReceiptOnly(text: string): boolean {
  const lower = text.toLowerCase();
  if (!lower.includes("mottagningsbevis")) return false;
  if (lower.includes("ångerrätten har godkänts") || lower.includes("återbetalning är genomförd")) {
    return false;
  }
  return lower.includes("bekräftar bara att vi tagit emot") || lower.includes("inte ett beslut");
}

export function formatSekFromOre(ore: number): string {
  return `${(ore / 100).toFixed(2).replace(".", ",")} kr`;
}

export function traderIdentityGaps(): string[] {
  const gaps: string[] = [];
  if (!TRADER.street || !TRADER.postalAddressComplete) {
    gaps.push("postal_or_business_street_address");
  }
  return gaps;
}

export function checkoutRequestGuard(input: { product?: unknown; legal_ack?: unknown }): {
  ok: boolean;
  error?: string;
} {
  if (!isProduct(input.product)) return { ok: false, error: "invalid_product" };
  if (!legalAckRequired(input.legal_ack)) return { ok: false, error: "legal_ack_required" };
  return { ok: true };
}

export function buildCheckoutLinePayload(product: Product): {
  product: Product;
  sku: string;
  amount_total: number;
  currency: string;
  legal_ack_text: string;
  vat_class: VatClass;
  lines: Array<{
    name: string;
    amount: number;
    tax_code: string;
    vat_class: CatalogLine["vat_class"];
    tax_behavior: "inclusive";
  }>;
} {
  const item = CATALOG[product];
  return {
    product,
    sku: item.sku,
    amount_total: item.amount,
    currency: item.currency,
    legal_ack_text: LEGAL_ACK_TEXT,
    vat_class: item.vat_class,
    lines: checkoutLines(product).map((line) => ({
      name: line.name,
      amount: line.amount,
      tax_code: line.tax_code,
      vat_class: line.vat_class,
      tax_behavior: "inclusive",
    })),
  };
}

export function checkoutLinesTotal(product: Product): number {
  return checkoutLines(product).reduce((sum, line) => sum + line.amount, 0);
}

export function buildStripeCheckoutForm(
  product: Product,
  opts: { email?: string; successUrl: string; cancelUrl: string },
): Record<string, string> {
  const item = CATALOG[product];
  const payload = buildCheckoutLinePayload(product);
  const form: Record<string, string> = {
    mode: "payment",
    "automatic_tax[enabled]": "true",
    billing_address_collection: "required",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    "metadata[sku]": item.sku,
    "metadata[product]": product,
    "metadata[version]": PRODUCT_VERSION,
    "metadata[legal_ack]": "true",
    "metadata[legal_ack_text]": LEGAL_ACK_TEXT,
    "metadata[vat_class]": item.vat_class,
    "metadata[amount_total]": String(item.amount),
    "payment_intent_data[metadata][sku]": item.sku,
    "payment_intent_data[metadata][product]": product,
    allow_promotion_codes: "false",
    locale: "sv",
  };
  payload.lines.forEach((line, i) => {
    form[`line_items[${i}][quantity]`] = "1";
    form[`line_items[${i}][price_data][currency]`] = item.currency;
    form[`line_items[${i}][price_data][unit_amount]`] = String(line.amount);
    form[`line_items[${i}][price_data][tax_behavior]`] = "inclusive";
    form[`line_items[${i}][price_data][tax_code]`] = line.tax_code;
    form[`line_items[${i}][price_data][product_data][name]`] = line.name;
    form[`line_items[${i}][price_data][product_data][tax_code]`] = line.tax_code;
    form[`line_items[${i}][price_data][product_data][description]`] =
      `Digital produkt (PDF), version ${PRODUCT_VERSION}. Delbelopp ${line.amount / 100} kr inkl. moms.`;
  });
  if (opts.email) {
    form.customer_email = opts.email;
    form["metadata[email]"] = opts.email;
  }
  return form;
}

export function purchaseDeliveryPatch(input: {
  linksOk: boolean;
  emailOk: boolean;
  nowIso: string;
}): {
  payment_status: "paid";
  delivery_status: DeliveryStatus;
  delivered_at: string | null;
  last_delivery_at: string;
} {
  const outcome = deliveryOutcome({ linksOk: input.linksOk, emailOk: input.emailOk });
  return {
    payment_status: outcome.payment_status,
    delivery_status: outcome.delivery_status,
    delivered_at: outcome.delivery_status === "delivered" ? input.nowIso : null,
    last_delivery_at: input.nowIso,
  };
}

export function agreementVatLines(product: Product): string[] {
  const vat = vatAllocation(product);
  return vat.lines.map(
    (line) =>
      `${line.name}: ${formatSekFromOre(line.gross_ore)} inkl. moms (${line.rate_percent} % ${line.vat_class}), varav moms ${formatSekFromOre(line.vat_ore)} (netto ${formatSekFromOre(line.net_ore)}).`,
  );
}

export function buildAgreementCopy(input: {
  product: Product;
  legalAckAt: string;
  deliveryInitiated: boolean;
  deliveryStatus: DeliveryStatus;
}): { text: string; htmlBlocks: string[] } {
  const item = CATALOG[input.product];
  const vatLines = agreementVatLines(input.product);
  const address = TRADER.postalAddressComplete && TRADER.street
    ? TRADER.street
    : `Linköping, ${TRADER.country} (fullständig postadress saknas i verifierade källor och kompletteras av näringsidkaren)`;
  const withdrawalCeased = confirmationMayStateWithdrawalCeased({
    deliveryStatus: input.deliveryStatus,
    deliveryInitiated: input.deliveryInitiated,
  });
  const withdrawalNote = withdrawalCeased
    ? `Leveransen har påbörjats efter ditt aktiva samtycke. Enligt det samtycket finns det då ingen ångerrätt för det digitala innehållet. Funktionen ${SITE_URL}${WITHDRAWAL_PATH} finns om rätten ändå skulle gälla, till exempel om samtycket saknades eller leveransen inte startade.`
    : `Ångerrätten kan fortfarande gälla om samtycket saknades, var ogiltigt eller om den digitala leveransen inte har påbörjats. Använd ${SITE_URL}${WITHDRAWAL_PATH} för att lämna en begäran. Detta är inte ett automatiskt beslut om att ångerrätten gäller.`;
  const lines = [
    `Näringsidkare: ${TRADER.legalName}`,
    `Organisationsnummer: ${TRADER.orgNr}`,
    `Adress: ${address}`,
    `Kontakt: ${TRADER.email}`,
    `Produkt: ${item.name}`,
    `Totalt konsumentpris: ${formatSekFromOre(item.amount)} inklusive moms`,
    `Momsfördelning:`,
    ...vatLines,
    `Samtyckestext: ${LEGAL_ACK_TEXT}`,
    `Tidpunkt för samtycke: ${input.legalAckAt}`,
    `Leveransvillkor: Digital leverans via tidsbegränsade, personliga nedladdningslänkar till den e-postadress du angav. Länkarna gäller i tre dygn.`,
    `Reklamation: Fel i den levererade filen anmäls till ${TRADER.email}. Konsumentköplagens reklamationsregler gäller för digitalt innehåll.`,
    `Ångerrätt: ${withdrawalNote}`,
    `Elektronisk ångerfunktion (DAL 2 kap. 10 a §): ${SITE_URL}${WITHDRAWAL_PATH}`,
    `Standardinformation om ångerrätt: ${STANDARD_WITHDRAWAL_INFO_URL}`,
    `Villkor: ${SITE_URL}/villkor#ai-kontoret`,
  ];
  return { text: lines.join("\n"), htmlBlocks: lines };
}

export function buildWithdrawalReceiptCopy(input: {
  name: string;
  email: string;
  submittedAt: string;
  sessionId: string | null;
  product: Product | null;
  description: string;
  requestId?: string;
}): { subject: string; text: string; html: string } {
  const text = `Mottagningsbevis – begäran om ångerrätt\n\nHej ${input.name},\n\nDetta är ett mottagningsbevis. Vi bekräftar bara att vi tagit emot din begäran om att utöva ångerrätt. Det är inte ett beslut om att ångerrätten gäller, och det är inte ett besked om återbetalning.\n\nInlämnad: ${input.submittedAt}\nE-post: ${input.email}\n${input.requestId ? `Referens: ${input.requestId}\n` : ""}${input.sessionId ? `Angivet avtals-/order-id: ${input.sessionId}\n` : ""}${input.product ? `Angiven produkt: ${input.product}\n` : ""}${input.description ? `Beskrivning: ${input.description}\n` : ""}\nVi granskar begäran manuellt (mottagen → under granskning → accepterad / avvisad / återbetald). Inget automatiskt juridiskt beslut fattas.\n\nNäringsidkare: ${TRADER.legalName}, org.nr ${TRADER.orgNr}\nKontakt: ${TRADER.email}\nÅngerfunktion: ${SITE_URL}${WITHDRAWAL_PATH}\nVillkor: ${SITE_URL}/villkor#ai-kontoret\n\nAurora Media AB`;
  const html = `<!doctype html><html lang="sv"><body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#11151a;line-height:1.6">\n<p><strong>Mottagningsbevis – begäran om ångerrätt</strong></p>\n<p>Hej ${input.name.replace(/</g, "")},</p>\n<p>Detta är ett mottagningsbevis. Vi bekräftar bara att vi tagit emot din begäran om att utöva ångerrätt. Det är inte ett beslut om att ångerrätten gäller, och det är inte ett besked om återbetalning.</p>\n<p>Inlämnad: ${input.submittedAt}<br/>E-post: ${input.email}${input.requestId ? `<br/>Referens: ${input.requestId}` : ""}${input.sessionId ? `<br/>Angivet avtals-/order-id: ${input.sessionId}` : ""}${input.product ? `<br/>Angiven produkt: ${input.product}` : ""}</p>\n${input.description ? `<p>Beskrivning: ${input.description.replace(/</g, "")}</p>` : ""}\n<p>Vi granskar begäran manuellt. Inget automatiskt juridiskt beslut fattas.</p>\n<p>${TRADER.legalName}, org.nr ${TRADER.orgNr}<br/><a href="mailto:${TRADER.email}">${TRADER.email}</a><br/><a href="${SITE_URL}${WITHDRAWAL_PATH}">${SITE_URL}${WITHDRAWAL_PATH}</a></p>\n</body></html>`;
  return {
    subject: "Mottagningsbevis: din begäran om ångerrätt",
    text,
    html,
  };
}

export function withdrawalInsertRow(
  data: {
    name: string;
    email: string;
    session_id: string | null;
    product: Product | null;
    description: string;
  },
  submittedAt: string,
): {
  name: string;
  email: string;
  session_id: string | null;
  product: Product | null;
  description: string;
  status: "received";
  submitted_at: string;
} {
  return {
    name: data.name,
    email: data.email,
    session_id: data.session_id,
    product: data.product,
    description: data.description,
    status: "received",
    submitted_at: submittedAt,
  };
}
