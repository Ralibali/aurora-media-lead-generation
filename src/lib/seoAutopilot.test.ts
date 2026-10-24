import { describe, expect, it } from "vitest";
import { buildSeoAutopilotActions, summarizeSeoAutopilot } from "./seoAutopilot";

describe("seoAutopilot", () => {
  it("skapar quick win och CTR-åtgärder från GSC-data", () => {
    const actions = buildSeoAutopilotActions({
      queries: [
        { keys: ["webbyrå linköping"], clicks: 5, impressions: 600, ctr: 0.008, position: 5.5 },
      ],
    });

    expect(actions.map((action) => action.type)).toContain("quick-win");
    expect(actions.map((action) => action.type)).toContain("ctr");
    expect(actions.every((action) => action.approvalRequired)).toBe(true);
  });

  it("skapar content-gap för sökord nära sida två", () => {
    const actions = buildSeoAutopilotActions({
      queries: [
        { keys: ["ai automation företag"], clicks: 0, impressions: 120, ctr: 0, position: 18.2 },
      ],
    });

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("content-gap");
    expect(actions[0].risk).toBe("medium");
  });

  it("summerar autopilot-kön", () => {
    const actions = buildSeoAutopilotActions({
      queries: [
        { keys: ["seo byrå"], clicks: 4, impressions: 700, ctr: 0.01, position: 4.2 },
        { keys: ["hemsida företag"], clicks: 0, impressions: 100, ctr: 0, position: 20 },
      ],
    });
    const summary = summarizeSeoAutopilot(actions);

    expect(summary.total).toBeGreaterThanOrEqual(3);
    expect(summary.approvalRequired).toBe(summary.total);
    expect(summary.highImpact).toBeGreaterThanOrEqual(1);
  });
});
