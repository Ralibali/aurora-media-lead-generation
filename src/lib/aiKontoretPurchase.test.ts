import { describe, expect, it } from "vitest";
import { LEGAL_ACK_TEXT as CLIENT_LEGAL_ACK_TEXT, LEGAL_OWNER_CONFIRMED as CLIENT_LEGAL_OWNER, PRICES, VAT_CLASSIFICATION_CONFIRMED as CLIENT_VAT_CONFIRMED, VAT_CLASSES } from "@/config/aiKontoret";
import {
  CATALOG,
  CONSENT_DEFAULT_CHECKED,
  LEGAL_ACK_TEXT,
  LEGAL_OWNER_CONFIRMED,
  MIN_ASSET_BYTES,
  VAT_CLASSIFICATION_CONFIRMED,
  assetReady,
  assetsForProduct,
  buildConsentRecord,
  checkoutAmountIsInclusive,
  composeLaunchChecks,
  deliveryEmailIncludesAgreement,
  displayPriceSek,
  evaluateReturnSession,
  legalAckRequired,
  legalGate,
  unsignedPathIsNotProof,
  validateSession,
  vatGate,
  webhookIdempotencyDecision,
} from "./aiKontoretPurchase";

const paidGuide = {
  metadata: { product: "guide", sku: "ai-kontoret-guide" },
  payment_status: "paid",
  amount_total: 19900,
  currency: "sek",
};

describe("prices", () => {
  it("keeps inclusive consumer prices 199 / 199 / 349", () => {
    expect(displayPriceSek("guide")).toBe(199);
    expect(displayPriceSek("vault")).toBe(199);
    expect(displayPriceSek("bundle")).toBe(349);
    expect(PRICES.guide).toBe(199);
    expect(PRICES.vault).toBe(199);
    expect(PRICES.bundle).toBe(349);
    expect(CATALOG.guide.amount).toBe(19900);
    expect(CATALOG.vault.amount).toBe(19900);
    expect(CATALOG.bundle.amount).toBe(34900);
  });
});

describe("spoofed return", () => {
  it("rejects a forged session id", () => {
    expect(evaluateReturnSession({ sessionId: "cs_test_fake" })).toMatchObject({
      paid: false,
      reason: "invalid_session_id",
    });
  });

  it("does not treat a query-shaped unpaid session as paid", () => {
    const result = evaluateReturnSession({
      sessionId: "cs_test_abcdefghijklmnopqrstuvwxyz",
      stripeSession: { ...paidGuide, payment_status: "unpaid" },
    });
    expect(result.paid).toBe(false);
    expect(result.reason).toBe("not_paid");
  });
});

describe("validateSession", () => {
  it("accepts a paid catalog-matching session", () => {
    expect(validateSession(paidGuide)).toEqual({ ok: true, product: "guide" });
  });

  it("rejects wrong SKU", () => {
    expect(
      validateSession({ ...paidGuide, metadata: { product: "guide", sku: "ai-kontoret-bundle" } }),
    ).toEqual({ ok: false, reason: "sku_mismatch" });
  });

  it("rejects wrong amount", () => {
    expect(validateSession({ ...paidGuide, amount_total: 19899 })).toEqual({
      ok: false,
      reason: "amount_mismatch",
    });
  });

  it("rejects wrong currency", () => {
    expect(validateSession({ ...paidGuide, currency: "usd" })).toEqual({
      ok: false,
      reason: "currency_mismatch",
    });
  });

  it("does not accept a client-supplied amount as authority", () => {
    expect(checkoutAmountIsInclusive("guide", 25000)).toBe(false);
    expect(checkoutAmountIsInclusive("bundle", 34900)).toBe(true);
  });
});

describe("idempotent webhook", () => {
  it("returns duplicate_event when the event_id was already seen", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: true, purchaseAlreadyDelivered: false })).toBe(
      "duplicate_event",
    );
  });

  it("returns duplicate_delivery when the session already delivered", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: false, purchaseAlreadyDelivered: true })).toBe(
      "duplicate_delivery",
    );
  });

  it("proceeds only on a new event without a delivered purchase", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: false, purchaseAlreadyDelivered: false })).toBe(
      "proceed",
    );
  });
});

describe("bundle mapping", () => {
  it("maps bundle to both private assets", () => {
    expect(assetsForProduct("bundle")).toEqual(["guide", "vault"]);
  });

  it("maps single SKUs to one file each", () => {
    expect(assetsForProduct("guide")).toEqual(["guide"]);
    expect(assetsForProduct("vault")).toEqual(["vault"]);
  });
});

describe("private asset access", () => {
  it("treats an unsigned storage path as not proof of purchase", () => {
    expect(
      unsignedPathIsNotProof("https://example.supabase.co/storage/v1/object/ai-kontoret-assets/guide.pdf"),
    ).toBe(true);
  });

  it("fails readiness when the object is missing", () => {
    expect(assetReady({ exists: false, fileBytes: 500_000 })).toBe(false);
  });

  it("fails readiness for a tiny placeholder", () => {
    expect(assetReady({ exists: true, fileBytes: 12 })).toBe(false);
    expect(12).toBeLessThan(MIN_ASSET_BYTES);
  });
});

describe("launch guard", () => {
  const green = {
    stripe: true,
    webhook_secret: true,
    service_role: true,
    email: true,
    asset_guide: true,
    asset_vault: true,
    legal_confirmed: true,
    vat_classified: true,
  };

  it("is ready only when every check is true", () => {
    expect(composeLaunchChecks(green)).toEqual({ ready: true, failed: [] });
  });

  it("fails closed if any check is false", () => {
    expect(composeLaunchChecks({ ...green, asset_guide: false }).ready).toBe(false);
    expect(composeLaunchChecks({ ...green, vat_classified: false }).failed).toContain("vat_classified");
    expect(composeLaunchChecks({ ...green, legal_confirmed: false }).ready).toBe(false);
  });
});

describe("VAT classification gate", () => {
  it("fails while confirmation is false", () => {
    expect(vatGate({ catalog: CATALOG, confirmed: false }).ok).toBe(false);
    expect(VAT_CLASSIFICATION_CONFIRMED).toBe(false);
    expect(CLIENT_VAT_CONFIRMED).toBe(false);
  });

  it("fails if Bundle copies the Guide publication class", () => {
    const bad = {
      ...CATALOG,
      bundle: { ...CATALOG.bundle, vat_class: "electronic_publication_6" as const, tax_code: CATALOG.guide.tax_code },
    };
    expect(vatGate({ catalog: bad, confirmed: true }).reason).toBe("bundle_must_not_inherit_guide");
  });

  it("fails if Vault is silently treated as a publication", () => {
    const bad = {
      ...CATALOG,
      vault: { ...CATALOG.vault, vat_class: "electronic_publication_6" as const },
    };
    expect(vatGate({ catalog: bad, confirmed: true }).reason).toBe("vault_not_assumed_publication");
  });

  it("can pass when Guide is 6% candidate, Vault and Bundle are ESS, and owner confirmed", () => {
    expect(VAT_CLASSES.guide).toBe("electronic_publication_6");
    expect(VAT_CLASSES.vault).toBe("ess_25");
    expect(VAT_CLASSES.bundle).toBe("ess_25");
    expect(vatGate({ catalog: CATALOG, confirmed: true }).ok).toBe(true);
    expect(CATALOG.bundle.tax_code).not.toBe(CATALOG.guide.tax_code);
  });
});

describe("legal and consent", () => {
  it("keeps LEGAL_OWNER_CONFIRMED false until the owner approves wording", () => {
    expect(LEGAL_OWNER_CONFIRMED).toBe(false);
    expect(CLIENT_LEGAL_OWNER).toBe(false);
    expect(legalGate({ dbConfirmed: true, ownerConfirmed: false })).toBe(false);
  });

  it("requires both the admin flag and the code flag", () => {
    expect(legalGate({ dbConfirmed: true, ownerConfirmed: true })).toBe(true);
    expect(legalGate({ dbConfirmed: false, ownerConfirmed: true })).toBe(false);
  });

  it("does not pre-check consent", () => {
    expect(CONSENT_DEFAULT_CHECKED).toBe(false);
    expect(legalAckRequired(false)).toBe(false);
    expect(legalAckRequired(true)).toBe(true);
  });

  it("keeps client and server ack text in sync", () => {
    expect(CLIENT_LEGAL_ACK_TEXT).toBe(LEGAL_ACK_TEXT);
  });

  it("puts the agreement copy in the delivery email fixture", () => {
    const consent = buildConsentRecord({ product: "bundle", atIso: "2026-08-27T12:00:00.000Z" });
    const html = `<p>${LEGAL_ACK_TEXT}</p><a href="https://auroramedia.se/villkor#ai-kontoret">villkor</a>`;
    const text = `${LEGAL_ACK_TEXT}\nhttps://auroramedia.se/villkor#ai-kontoret`;
    expect(deliveryEmailIncludesAgreement(html, text)).toBe(true);
    expect(consent.amount).toBe(34900);
    expect(consent.legal_ack).toBe(true);
  });
});
