import { describe, expect, it } from "vitest";
import { onboardingProgress, pipelineSummary, PLAN_DEFAULTS } from "./managedChannels";

describe("Aurora Inbox commercial helpers", () => {
  it("har säljbara standardpaket", () => {
    expect(PLAN_DEFAULTS.starter.price).toBe(695);
    expect(PLAN_DEFAULTS.team.seats).toBeGreaterThan(1);
    expect(PLAN_DEFAULTS.agency.price).toBeGreaterThan(PLAN_DEFAULTS.team.price);
  });

  it("visar onboarding som tydlig progression", () => {
    expect(onboardingProgress("draft")).toBeLessThan(onboardingProgress("ready"));
    expect(onboardingProgress("live")).toBe(100);
  });

  it("summerar konversationer per pipeline-steg", () => {
    const result = pipelineSummary([{ stage: "new" }, { stage: "new" }, { stage: "meeting" }]);
    expect(result.new).toBe(2);
    expect(result.meeting).toBe(1);
    expect(result.customer).toBe(0);
  });
});
