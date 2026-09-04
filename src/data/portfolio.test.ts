import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("bergs-slussar-stayboost public case", () => {
  const item = getPortfolioBySlug(SLUG);

  it("exists as a live public case", () => {
    expect(item).toBeDefined();
    expect(item?.status).toBe("live");
    expect(item?.draft).toBeFalsy();
    expect(item?.noindex).toBeFalsy();
    expect(item?.featured).toBe(true);
    expect(item?.order).toBe(0);
    expect(isPortfolioDraft(item!)).toBe(false);
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

  it("is on the public listing", () => {
    expect(getPublicPortfolio().some((p) => p.slug === SLUG)).toBe(true);
  });

  it("cross-links the existing booking-site case", () => {
    const related = getRelatedPortfolio(SLUG);
    expect(related[0]?.slug).toBe("goglamping-sweden");
    expect(PORTFOLIO.find((p) => p.slug === "goglamping-sweden")?.lessons).toContain(SLUG);
  });
});

describe("bergs-slussar-stayboost dependents", () => {
  it("homepage featured rail links Bergs Slussar Glamping to the Stayboost case", () => {
    const src = readFileSync(resolve(__dirname, "../pages/Index.tsx"), "utf8");
    const casesBlock = src.slice(src.indexOf("const CASES"), src.indexOf("const FAQS"));
    expect(casesBlock).toContain('title: "Bergs Slussar Glamping"');
    expect(casesBlock).toMatch(
      /title:\s*"Bergs Slussar Glamping"[\s\S]*?href:\s*"\/arbete\/bergs-slussar-stayboost"/,
    );
    expect(casesBlock).not.toMatch(
      /title:\s*"Bergs Slussar Glamping"[\s\S]*?href:\s*"\/arbete\/goglamping-sweden"/,
    );
  });

  it("other Bergs Slussar Glamping labels point at Stayboost, not the booking slug", () => {
    const landing = readFileSync(resolve(__dirname, "../pages/AiByraLinkoping.tsx"), "utf8");
    const landingCases = landing.slice(landing.indexOf("const CASES"), landing.indexOf("const PROCESS"));
    expect(landingCases).toMatch(
      /name:\s*"Bergs Slussar Glamping"[\s\S]*?href:\s*"\/arbete\/bergs-slussar-stayboost"/,
    );
    expect(landingCases).not.toContain("/arbete/goglamping-sweden");

    const footer = readFileSync(
      resolve(__dirname, "../components/verkstad/VerkstadLayout.tsx"),
      "utf8",
    );
    expect(footer).toContain('to="/arbete/bergs-slussar-stayboost">Bergs Slussar Glamping<');
    expect(footer).not.toContain('to="/arbete/goglamping-sweden">Bergs Slussar Glamping<');
  });

  it("sitemap includes the Stayboost case and keeps the booking case", () => {
    const xml = readFileSync(resolve(__dirname, "../../public/sitemap-pages.xml"), "utf8");
    for (const item of getPublicPortfolio()) {
      expect(xml).toContain(`https://auroramedia.se/arbete/${item.slug}`);
    }
    expect(xml).toContain("https://auroramedia.se/arbete/bergs-slussar-stayboost");
    expect(xml).toContain("https://auroramedia.se/arbete/goglamping-sweden");
  });
});
