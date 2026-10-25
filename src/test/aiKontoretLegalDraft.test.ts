import { describe, expect, it } from "vitest";
import {
  LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED,
  LEGAL_ACK_TEXT,
  PRICES,
  PRODUCT_STATUS,
} from "@/config/aiKontoret";

describe("AI-KONTORET launch guards (PREPARE)", () => {
  it("does not open live checkout", () => {
    expect(PRODUCT_STATUS).toBe("prelaunch");
    expect(LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED).toBe(true);
  });

  it("keeps locked consumer prices", () => {
    expect(PRICES.guide).toBe(199);
    expect(PRICES.vault).toBe(199);
    expect(PRICES.bundle).toBe(349);
  });

  it("reuses the existing legal ack wording", () => {
    expect(LEGAL_ACK_TEXT).toBe(
      "Jag förstår att detta är en digital produkt som levereras direkt efter köp, och att ångerrätten enligt distansavtalslagen inte gäller när leveransen av det digitala innehållet har påbörjats med mitt samtycke.",
    );
  });
});
