import { describe, expect, it } from "vitest";
import { LEGAL_ACK_TEXT as CLIENT_LEGAL_ACK_TEXT, LEGAL_LINKS, LEGAL_OWNER_CONFIRMED as CLIENT_LEGAL_OWNER, PRICES, VAT_CLASSIFICATION_CONFIRMED as CLIENT_VAT_CONFIRMED, VAT_CLASSES } from "@/config/aiKontoret";
import {
  BUNDLE_SPLIT,
  CATALOG,
  CONSENT_DEFAULT_CHECKED,
  LEGAL_ACK_TEXT,
  LEGAL_OWNER_CONFIRMED,
  MIN_ASSET_BYTES,
  TRADER,
  VAT_CLASSIFICATION_CONFIRMED,
  WITHDRAWAL_PATH,
  assetReady,
  assetsForProduct,
  buildAgreementCopy,
  buildCheckoutLinePayload,
  buildConsentRecord,
  buildStripeCheckoutForm,
  buildWithdrawalReceiptCopy,
  checkoutAmountIsInclusive,
  checkoutLines,
  checkoutLinesTotal,
  checkoutRequestGuard,
  composeLaunchChecks,
  confirmationMayStateWithdrawalCeased,
  deliveryEmailIncludesAgreement,
  deliveryOutcome,
  displayPriceSek,
  evaluateReturnSession,
  legalAckContinuity,
  legalAckRequired,
  legalGate,
  purchaseDeliveryPatch,
  traderIdentityGaps,
  unsignedPathIsNotProof,
  validateSession,
  validateWithdrawalRequest,
  vatGate,
  webhookIdempotencyDecision,
  withdrawalInsertRow,
  withdrawalReceiptIsReceiptOnly,
} from "./aiKontoretPurchase";

const paidGuide = {
  metadata: { product: "guide", sku: "ai-kontoret-guide" },
  payment_status: "paid",
  amount_total: 19900,
  currency: "sek",
};

const paidBundle = {
  metadata: { product: "bundle", sku: "ai-kontoret-bundle" },
  payment_status: "paid",
  amount_total: 34900,
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

describe("bundle split checkout", () => {
  it("keeps bundle exactly 34900 total", () => {
    expect(CATALOG.bundle.amount).toBe(34900);
    expect(BUNDLE_SPLIT.total_ore).toBe(34900);
    expect(checkoutLinesTotal("bundle")).toBe(34900);
    expect(buildCheckoutLinePayload("bundle").amount_total).toBe(34900);
  });

  it("splits the bundle as 17450 + 17450", () => {
    const lines = checkoutLines("bundle");
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => l.amount)).toEqual([17450, 17450]);
    expect(lines[0].amount + lines[1].amount).toBe(34900);
    expect(BUNDLE_SPLIT.guide_ore + BUNDLE_SPLIT.vault_ore).toBe(34900);
  });

  it("uses different VAT classes for Guide and Vault", () => {
    const lines = checkoutLines("bundle");
    const guide = lines.find((l) => l.key === "guide");
    const vault = lines.find((l) => l.key === "vault");
    expect(guide?.vat_class).toBe("electronic_publication_6");
    expect(vault?.vat_class).toBe("ess_25");
    expect(guide?.tax_code).not.toBe(vault?.tax_code);
    expect(VAT_CLASSES.guide).toBe("electronic_publication_6");
    expect(VAT_CLASSES.vault).toBe("ess_25");
    expect(VAT_CLASSES.bundle).toBe("split_two_supplies");
    expect(CATALOG.bundle.vat_class).toBe("split_two_supplies");
  });

  it("builds two inclusive Stripe line items and no third charge", () => {
    const form = buildStripeCheckoutForm("bundle", {
      successUrl: "https://auroramedia.se/ok",
      cancelUrl: "https://auroramedia.se/cancel",
    });
    expect(form["line_items[0][price_data][unit_amount]"]).toBe("17450");
    expect(form["line_items[1][price_data][unit_amount]"]).toBe("17450");
    expect(form["line_items[2][price_data][unit_amount]"]).toBeUndefined();
    expect(form["line_items[0][price_data][tax_behavior]"]).toBe("inclusive");
    expect(form["line_items[1][price_data][tax_behavior]"]).toBe("inclusive");
    expect(form["line_items[0][price_data][tax_code]"]).not.toBe(form["line_items[1][price_data][tax_code]"]);
    expect(form["metadata[product]"]).toBe("bundle");
    expect(form["metadata[sku]"]).toBe("ai-kontoret-bundle");
    expect(form["metadata[amount_total]"]).toBe("34900");
    expect(form["metadata[legal_ack_text]"]).toBe(LEGAL_ACK_TEXT);
  });
});

describe("spoofed return and amounts", () => {
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

  it("rejects spoofed amounts", () => {
    expect(validateSession({ ...paidGuide, amount_total: 19899 })).toEqual({
      ok: false,
      reason: "amount_mismatch",
    });
    expect(validateSession({ ...paidBundle, amount_total: 34899 })).toEqual({
      ok: false,
      reason: "amount_mismatch",
    });
    expect(validateSession({ ...paidBundle, amount_total: 39800 })).toEqual({
      ok: false,
      reason: "amount_mismatch",
    });
    expect(checkoutAmountIsInclusive("guide", 25000)).toBe(false);
    expect(checkoutAmountIsInclusive("bundle", 1)).toBe(false);
    expect(checkoutAmountIsInclusive("bundle", 34900)).toBe(true);
  });
});

describe("validateSession", () => {
  it("accepts a paid catalog-matching session", () => {
    expect(validateSession(paidGuide)).toEqual({ ok: true, product: "guide" });
    expect(validateSession(paidBundle)).toEqual({ ok: true, product: "bundle" });
  });

  it("rejects wrong SKU", () => {
    expect(
      validateSession({ ...paidGuide, metadata: { product: "guide", sku: "ai-kontoret-bundle" } }),
    ).toEqual({ ok: false, reason: "sku_mismatch" });
  });

  it("rejects wrong currency", () => {
    expect(validateSession({ ...paidGuide, currency: "usd" })).toEqual({
      ok: false,
      reason: "currency_mismatch",
    });
  });
});

describe("idempotent webhook", () => {
  it("retries when the event was seen but delivery never completed", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: true, purchaseAlreadyDelivered: false })).toBe(
      "retry_undelivered",
    );
  });

  it("returns duplicate_delivery when the session already delivered", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: false, purchaseAlreadyDelivered: true })).toBe(
      "duplicate_delivery",
    );
    expect(webhookIdempotencyDecision({ eventAlreadySeen: true, purchaseAlreadyDelivered: true })).toBe(
      "duplicate_delivery",
    );
  });

  it("proceeds only on a new event without a delivered purchase", () => {
    expect(webhookIdempotencyDecision({ eventAlreadySeen: false, purchaseAlreadyDelivered: false })).toBe(
      "proceed",
    );
  });
});

describe("failed digital delivery", () => {
  it("does not set delivered_at when assets or email fail", () => {
    expect(deliveryOutcome({ linksOk: false, emailOk: false })).toMatchObject({
      payment_status: "paid",
      delivery_status: "failed",
      delivered_at: null,
    });
    expect(deliveryOutcome({ linksOk: true, emailOk: false })).toMatchObject({
      payment_status: "paid",
      delivery_status: "failed",
      delivered_at: null,
    });
    expect(purchaseDeliveryPatch({ linksOk: false, emailOk: true, nowIso: "2026-08-27T16:00:00.000Z" })).toMatchObject({
      payment_status: "paid",
      delivery_status: "failed",
      delivered_at: null,
    });
  });

  it("sets delivered_at only when links and email succeed", () => {
    expect(purchaseDeliveryPatch({ linksOk: true, emailOk: true, nowIso: "2026-08-27T16:00:00.000Z" })).toEqual({
      payment_status: "paid",
      delivery_status: "delivered",
      delivered_at: "2026-08-27T16:00:00.000Z",
      last_delivery_at: "2026-08-27T16:00:00.000Z",
    });
  });

  it("does not let confirmation claim withdrawal ceased unless delivery started", () => {
    expect(confirmationMayStateWithdrawalCeased({ deliveryStatus: "failed", deliveryInitiated: false })).toBe(false);
    expect(confirmationMayStateWithdrawalCeased({ deliveryStatus: "pending", deliveryInitiated: false })).toBe(false);
    expect(confirmationMayStateWithdrawalCeased({ deliveryStatus: "delivered", deliveryInitiated: true })).toBe(true);
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

  it("can pass when the bundle is two supplies with different VAT classes and owner confirmed", () => {
    expect(vatGate({ catalog: CATALOG, confirmed: true }).ok).toBe(true);
    expect(CATALOG.bundle.tax_code).not.toBe(CATALOG.guide.tax_code);
  });
});

describe("legal ack continuity", () => {
  const expected =
    "Jag samtycker uttryckligen till att leveransen av det digitala innehållet påbörjas omedelbart och går med på att det därigenom inte finns någon ångerrätt när leveransen har påbörjats.";

  it("keeps the exact draft wording in frontend, Stripe, purchase and email", () => {
    expect(LEGAL_ACK_TEXT).toBe(expected);
    expect(CLIENT_LEGAL_ACK_TEXT).toBe(expected);
    const consent = buildConsentRecord({ product: "bundle", atIso: "2026-08-27T12:00:00.000Z" });
    const form = buildStripeCheckoutForm("bundle", {
      successUrl: "https://example.test/ok",
      cancelUrl: "https://example.test/cancel",
    });
    const agreement = buildAgreementCopy({
      product: "bundle",
      legalAckAt: consent.legal_ack_at,
      deliveryInitiated: true,
      deliveryStatus: "delivered",
    });
    expect(consent.legal_ack_text).toBe(expected);
    expect(form["metadata[legal_ack_text]"]).toBe(expected);
    expect(agreement.text).toContain(expected);
    expect(
      legalAckContinuity({
        frontend: CLIENT_LEGAL_ACK_TEXT,
        stripeMetadata: form["metadata[legal_ack_text]"],
        purchase: consent.legal_ack_text,
        email: expected,
      }),
    ).toBe(true);
  });

  it("rejects unchecked consent", () => {
    expect(CONSENT_DEFAULT_CHECKED).toBe(false);
    expect(legalAckRequired(false)).toBe(false);
    expect(legalAckRequired(undefined)).toBe(false);
    expect(checkoutRequestGuard({ product: "bundle", legal_ack: false })).toEqual({
      ok: false,
      error: "legal_ack_required",
    });
    expect(checkoutRequestGuard({ product: "bundle", legal_ack: true }).ok).toBe(true);
  });

  it("keeps LEGAL_OWNER_CONFIRMED false until the owner approves wording", () => {
    expect(LEGAL_OWNER_CONFIRMED).toBe(false);
    expect(CLIENT_LEGAL_OWNER).toBe(false);
    expect(legalGate({ dbConfirmed: true, ownerConfirmed: false })).toBe(false);
  });

  it("requires both the admin flag and the code flag", () => {
    expect(legalGate({ dbConfirmed: true, ownerConfirmed: true })).toBe(true);
    expect(legalGate({ dbConfirmed: false, ownerConfirmed: true })).toBe(false);
  });

  it("puts the agreement copy, VAT split and /angra-kop in the delivery email fixture", () => {
    const consent = buildConsentRecord({ product: "bundle", atIso: "2026-08-27T12:00:00.000Z" });
    const agreement = buildAgreementCopy({
      product: "bundle",
      legalAckAt: consent.legal_ack_at,
      deliveryInitiated: true,
      deliveryStatus: "delivered",
    });
    const html = `<p>${LEGAL_ACK_TEXT}</p><a href="https://auroramedia.se/villkor#ai-kontoret">villkor</a><a href="https://auroramedia.se/angra-kop">ångra</a>${agreement.text}`;
    const text = `${agreement.text}\n${LEGAL_ACK_TEXT}\nhttps://auroramedia.se/villkor#ai-kontoret`;
    expect(deliveryEmailIncludesAgreement(html, text)).toBe(true);
    expect(agreement.text).toContain("174,50 kr");
    expect(agreement.text).toContain(WITHDRAWAL_PATH);
    expect(agreement.text).toContain(TRADER.legalName);
    expect(agreement.text).toContain(TRADER.orgNr);
    expect(consent.amount).toBe(34900);
  });
});

describe("withdrawal function", () => {
  it("validates required fields and explicit confirm", () => {
    expect(validateWithdrawalRequest({}).reason).toBe("name_required");
    expect(validateWithdrawalRequest({ name: "Anna Andersson" }).reason).toBe("email_required");
    expect(
      validateWithdrawalRequest({ name: "Anna Andersson", email: "anna@example.com", confirm: false }).reason,
    ).toBe("confirm_required");
    expect(
      validateWithdrawalRequest({
        name: "Anna Andersson",
        email: "anna@example.com",
        sessionId: "!!!",
        confirm: true,
      }).reason,
    ).toBe("session_invalid");
    const ok = validateWithdrawalRequest({
      name: "Anna Andersson",
      email: "anna@example.com",
      sessionId: "cs_test_abcdefghijklmnopqrstuvwxyz",
      product: "bundle",
      description: "Guide + Vault",
      confirm: true,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.data.confirm).toBe(true);
      expect(ok.data.email).toBe("anna@example.com");
    }
  });

  it("persists the request as received without a legal decision", () => {
    const parsed = validateWithdrawalRequest({
      name: "Anna Andersson",
      email: "anna@example.com",
      sessionId: "cs_test_abcdefghijklmnopqrstuvwxyz",
      confirm: true,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const row = withdrawalInsertRow(parsed.data, "2026-08-27T16:05:00.000Z");
    expect(row.status).toBe("received");
    expect(row.submitted_at).toBe("2026-08-27T16:05:00.000Z");
    expect(row.email).toBe("anna@example.com");
    expect(row.session_id).toBe("cs_test_abcdefghijklmnopqrstuvwxyz");
  });

  it("builds a receipt-only email with the submission timestamp", () => {
    const copy = buildWithdrawalReceiptCopy({
      name: "Anna Andersson",
      email: "anna@example.com",
      submittedAt: "2026-08-27T16:05:00.000Z",
      sessionId: "cs_test_abcdefghijklmnopqrstuvwxyz",
      product: "bundle",
      description: "Guide + Vault",
      requestId: "req-1",
    });
    expect(copy.text).toContain("2026-08-27T16:05:00.000Z");
    expect(copy.text).toContain("Mottagningsbevis");
    expect(withdrawalReceiptIsReceiptOnly(copy.text)).toBe(true);
    expect(copy.text.toLowerCase()).not.toContain("ångerrätten har godkänts");
    expect(LEGAL_LINKS.angra).toBe("/angra-kop");
  });
});

describe("trader identity", () => {
  it("uses verified name and org number and reports the missing street address", () => {
    expect(TRADER.legalName).toBe("Aurora Media AB");
    expect(TRADER.orgNr).toBe("559272-0220");
    expect(TRADER.email).toBe("info@auroramedia.se");
    expect(TRADER.street).toBeNull();
    expect(traderIdentityGaps()).toContain("postal_or_business_street_address");
  });
});
