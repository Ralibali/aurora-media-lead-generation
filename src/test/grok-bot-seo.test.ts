import { describe, expect, it } from "vitest";
import {
  PRODUCT_STATUS,
  SEO_DESC,
  SEO_DESC_WAITLIST,
  SEO_TITLE,
  SEO_TITLE_WAITLIST,
  buildGrokBotOffers,
} from "@/config/aiKontoret";

const BUY_NOW = /köp |köp$|buy now/i;
const PRICE_KR = /\b199\b|\b349\b/;

describe("grok-bot first-byte SEO honesty", () => {
  it("keeps checkout gated in this revision", () => {
    expect(PRODUCT_STATUS).toBe("prelaunch");
  });

  it("uses waitlist title and description without a buyable price", () => {
    expect(SEO_TITLE).toBe(SEO_TITLE_WAITLIST);
    expect(SEO_DESC).toBe(SEO_DESC_WAITLIST);
    expect(SEO_TITLE).toMatch(/väntelista/i);
    expect(SEO_DESC).toMatch(/väntelista/i);
    expect(SEO_TITLE).not.toMatch(PRICE_KR);
    expect(SEO_DESC).not.toMatch(PRICE_KR);
    expect(SEO_TITLE).not.toMatch(BUY_NOW);
    expect(SEO_DESC).not.toMatch(BUY_NOW);
  });

  it("emits an unpriced waitlist Offer while prelaunch", () => {
    const offers = buildGrokBotOffers("prelaunch");
    expect(offers).toHaveLength(1);
    expect(offers[0].name).toMatch(/väntelista/i);
    expect(offers[0].price).toBeUndefined();
    expect(offers[0].priceCurrency).toBeUndefined();
    expect(offers[0].url).toMatch(/#kop$/);
    expect(JSON.stringify(offers)).not.toMatch(PRICE_KR);
  });

  it("does not add SKUs to waitlist or live Offers", () => {
    for (const offer of [...buildGrokBotOffers("prelaunch"), ...buildGrokBotOffers("live")]) {
      expect(offer).not.toHaveProperty("sku");
    }
  });
});
