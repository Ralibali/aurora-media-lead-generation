import { describe, expect, it } from "vitest";
import { PRODUCT_STATUS } from "@/config/aiKontoret";

describe("launch posture", () => {
  it("stays prelaunch until every launch guard and the documented test-mode purchase pass", () => {
    expect(PRODUCT_STATUS).toBe("prelaunch");
  });
});
