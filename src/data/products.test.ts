import { describe, expect, it } from "vitest";
import { AURORA_PRODUCTS } from "./products";

describe("Aurora product catalog", () => {
  it("has unique product names and destinations", () => {
    expect(new Set(AURORA_PRODUCTS.map((product) => product.name)).size).toBe(AURORA_PRODUCTS.length);
    expect(new Set(AURORA_PRODUCTS.map((product) => product.href)).size).toBe(AURORA_PRODUCTS.length);
  });

  it("marks all absolute destinations as external", () => {
    for (const product of AURORA_PRODUCTS) {
      expect(Boolean(product.external)).toBe(product.href.startsWith("https://"));
    }
  });
});
