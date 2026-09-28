import { describe, expect, it } from "vitest";
import { VOICE_VERTICALS, voicePilotMetrics } from "./voicePilot";

describe("Aurora Voice pilot", () => {
  it("has guarded vertical templates", () => {
    expect(VOICE_VERTICALS.traffic_school.prohibitedUntilVerified).toContain("Direktboka körlektion");
    expect(VOICE_VERTICALS.stay.prohibitedUntilVerified.length).toBeGreaterThan(0);
    expect(VOICE_VERTICALS.transport.allowedActions).toContain("Samla orderunderlag");
  });

  it("calculates pilot evidence without promises", () => {
    const result = voicePilotMetrics([
      { duration_seconds: 120, outcome: "faq_resolved", automated: true, cost_ore: 350 },
      { duration_seconds: 180, outcome: "handoff", automated: false, cost_ore: 450 },
      { duration_seconds: 60, outcome: "booking_request", automated: true, cost_ore: 250 },
    ]);
    expect(result.total).toBe(3);
    expect(result.automationRate).toBeCloseTo(2/3);
    expect(result.qualifiedLeads).toBe(1);
    expect(result.minutes).toBe(6);
    expect(result.costSek).toBe(10.5);
  });
});
