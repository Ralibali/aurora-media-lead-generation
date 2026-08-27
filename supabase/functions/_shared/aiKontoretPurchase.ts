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
