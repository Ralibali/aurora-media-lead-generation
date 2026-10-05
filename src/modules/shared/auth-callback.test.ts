import { describe, expect, it } from "vitest";
import { ownsAuthCallbackPath, type AuthClientOwner } from "./auth-callback";

const products: AuthClientOwner[] = ["care", "sight", "connect", "local-boost", "papers"];

describe("Supabase callback ownership", () => {
  it.each(products)("only %s handles its callback and nested routes", (product) => {
    for (const path of [`/portal/${product}`, `/portal/${product}/auth`, `/portal/${product}/auth/callback`]) {
      expect(ownsAuthCallbackPath(path, product)).toBe(true);
      expect(ownsAuthCallbackPath(path, "host")).toBe(false);
      for (const other of products.filter((entry) => entry !== product)) {
        expect(ownsAuthCallbackPath(path, other)).toBe(false);
      }
    }
  });

  it.each(products)("does not accept %s lookalike prefixes", (product) => {
    expect(ownsAuthCallbackPath(`/portal/${product}-other/auth`, product)).toBe(false);
    expect(ownsAuthCallbackPath(`/portal/${product}other/auth`, product)).toBe(false);
  });

  it("keeps existing host callbacks working", () => {
    for (const path of ["/", "/auth", "/auth/callback", "/admin", "/reset-password", "/portal-other/auth"]) {
      expect(ownsAuthCallbackPath(path, "host")).toBe(true);
      for (const product of products) expect(ownsAuthCallbackPath(path, product)).toBe(false);
    }
  });

  it("prevents the host consuming callbacks under current or future portal modules", () => {
    for (const path of ["/portal", "/portal/", "/portal/future/auth", "/portal/papers-other/auth"]) {
      expect(ownsAuthCallbackPath(path, "host")).toBe(false);
    }
  });
});
