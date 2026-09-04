import { describe, expect, it } from "vitest";
import {
  PORTFOLIO,
  getPortfolioBySlug,
  getPublicPortfolio,
  getRelatedPortfolio,
  isPortfolioDraft,
} from "./portfolio";

const SLUG = "bergs-slussar-stayboost";

const FORBIDDEN = [
  "72.6",
  "72,6",
  "5 timmar",
  "stayboost.se",
];

describe("bergs-slussar-stayboost draft case", () => {
  const item = getPortfolioBySlug(SLUG);

  it("exists as a beta draft with noindex", () => {
    expect(item).toBeDefined();
    expect(item?.status).toBe("beta");
    expect(item?.draft).toBe(true);
    expect(item?.noindex).toBe(true);
    expect(item?.featured).toBe(true);
    expect(item?.order).toBe(0);
    expect(isPortfolioDraft(item!)).toBe(true);
  });

  it("uses only the verified stayboost-stats result rows", () => {
    expect(item?.results).toEqual([
      { label: "bokningar", labelEn: "bookings", value: "156" },
      { label: "betalda tillägg", labelEn: "paid add-ons", value: "13 904 kr" },
      {
        label: "frukostandel av tillägg (10 430 kr)",
        labelEn: "breakfast share of add-ons (10 430 SEK)",
        value: "75,0 %",
      },
      { label: "digitala incheckningar", labelEn: "digital check-ins", value: "138" },
      { label: "pre-arrival SMS", labelEn: "pre-arrival SMS", value: "111/156" },
      { label: "guest hub pageviews", labelEn: "guest hub pageviews", value: "22 307" },
    ]);
  });

  it("states that hours saved are not measured", () => {
    const blob = [
      item?.description,
      item?.descriptionEn,
      item?.problem,
      item?.solution,
      item?.lessons,
    ].join("\n");
    expect(blob).toMatch(/inte mätta/i);
    expect(item?.descriptionEn).toMatch(/not measured/i);
  });

  it("does not contain forbidden claims", () => {
    const blob = JSON.stringify(item);
    for (const phrase of FORBIDDEN) {
      expect(blob).not.toContain(phrase);
    }
  });

  it("stays off public listings and related rails", () => {
    expect(getPublicPortfolio().some((p) => p.slug === SLUG)).toBe(false);
    expect(getRelatedPortfolio("aurora-transport").some((p) => p.slug === SLUG)).toBe(false);
  });

  it("cross-links the existing booking-site case", () => {
    const related = getRelatedPortfolio(SLUG);
    expect(related[0]?.slug).toBe("goglamping-sweden");
    expect(PORTFOLIO.find((p) => p.slug === "goglamping-sweden")?.lessons).toContain(SLUG);
  });
});
