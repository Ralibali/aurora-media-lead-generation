import { describe, expect, it } from "vitest";
import { ACCESSIBILITY_PLAN_DEFAULTS, accessibilityHealth, openRemediationCount } from "./accessibilityCare";

describe("Accessibility Care", () => {
  it("keeps the commercial plans explicit", () => {
    expect(ACCESSIBILITY_PLAN_DEFAULTS.monitor.price).toBe(495);
    expect(ACCESSIBILITY_PLAN_DEFAULTS.monitor_plus.price).toBe(995);
  });

  it("prioritizes critical and scan errors", () => {
    expect(accessibilityHealth({ critical_count: 1, serious_count: 2, moderate_count: 0, scan_errors: 0 }).level).toBe("critical");
    expect(accessibilityHealth({ critical_count: 0, serious_count: 0, moderate_count: 0, scan_errors: 1 }).level).toBe("error");
  });

  it("counts only unresolved remediation", () => {
    expect(openRemediationCount([{ status: "open" }, { status: "done" }, { status: "verify" }])).toBe(2);
  });
});
