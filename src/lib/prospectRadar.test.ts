import { describe, expect, it } from "vitest";
import { buildProspectRadar, classifyProspectRadarLead } from "./prospectRadar";

describe("prospectRadar", () => {
  it("prioriterar auditerade leads med verifierade webbproblem", () => {
    const result = classifyProspectRadarLead({
      id: "1",
      company_name: "Exempel AB",
      fit_score: 70,
      status: "new",
      audit: {
        status: "completed",
        opportunity_score: 82,
        audit_signals: [
          { signal: "missing_meta_description", evidence: "Ingen meta description kunde verifieras.", points: 8 },
          { signal: "no_clear_cta", evidence: "Ingen tydlig CTA hittad.", points: 8 },
        ],
      },
    });

    expect(result.segment).toBe("hot");
    expect(result.recommendedOffer).toBe("hemsida");
    expect(result.score).toBeGreaterThanOrEqual(76);
  });

  it("stänger leads som inte ska kontaktas", () => {
    const result = classifyProspectRadarLead({ id: "2", company_name: "Nej AB", status: "do_not_contact", fit_score: 100 });
    expect(result.segment).toBe("ignore");
    expect(result.score).toBe(0);
  });

  it("sammanfattar pipeline efter temperatur", () => {
    const radar = buildProspectRadar([
      { id: "1", company_name: "Het AB", fit_score: 85, audit: { status: "completed", opportunity_score: 85, audit_signals: [] } },
      { id: "2", company_name: "Varm AB", fit_score: 55, audit: { status: "completed", opportunity_score: 60, audit_signals: [] } },
      { id: "3", company_name: "Senare AB", fit_score: 40 },
      { id: "4", company_name: "Stängd AB", status: "rejected", fit_score: 90 },
    ]);

    expect(radar.counts.hot).toBe(1);
    expect(radar.counts.warm).toBe(1);
    expect(radar.counts.nurture).toBe(1);
    expect(radar.counts.ignore).toBe(1);
    expect(radar.top.map((item) => item.companyName)).toEqual(["Het AB", "Varm AB"]);
  });
});
