/**
 * Client/test re-export of AI-KONTORET purchase rules.
 * Runtime price authority remains supabase/functions/_shared/aiKontoret.ts.
 */
export {
  ASSET_BUCKET,
  ASSET_PATHS,
  CATALOG,
  CONSENT_DEFAULT_CHECKED,
  LEGAL_ACK_TEXT,
  LEGAL_OWNER_CONFIRMED,
  MIN_ASSET_BYTES,
  PRODUCT_VERSION,
  STRIPE_TAX_CODES,
  VAT_CLASSIFICATION_CONFIRMED,
  assetReady,
  assetsForProduct,
  buildConsentRecord,
  checkoutAmountIsInclusive,
  composeLaunchChecks,
  deliveryEmailIncludesAgreement,
  displayPriceSek,
  evaluateReturnSession,
  isProduct,
  legalAckRequired,
  legalGate,
  unsignedPathIsNotProof,
  validateSession,
  vatGate,
  webhookIdempotencyDecision,
} from "../../supabase/functions/_shared/aiKontoretPurchase.ts";
