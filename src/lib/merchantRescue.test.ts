import { describe, expect, it } from "vitest";
import { redact, scanMerchantSource } from "./merchantRescue";

describe("Merchant Rescue", () => {
  it("hittar Content API v2.1 och productstatuses", () => {
    const r = scanMerchantSource([{ path: "feed.py", content: "service = build('content', 'v2.1', credentials=c)\nservice.productstatuses().list(merchantId=1)" }]);
    expect(r.status).toBe("migrering-krävs");
    const ids = r.checklist.map((c) => c.rule.id);
    expect(ids).toContain("content-v2");
    expect(ids).toContain("productstatuses");
  });
  it("påstår aldrig migrerad när inga mönster hittas", () => {
    const r = scanMerchantSource([{ path: "a.ts", content: "console.log('hej')" }]);
    expect(r.status).toBe("inga-kända-mönster");
    expect(r.disclaimer).toMatch(/OAuth/);
  });
  it("maskerar hemligheter i utdrag", () => {
    const r = redact('{"client_secret": "abc123", "key": "AIzaSyD' + "x".repeat(32) + '"}');
    expect(r.text).not.toContain("abc123");
    expect(r.text).not.toContain("AIzaSyD");
    expect(r.redactions).toBe(2);
    const s = scanMerchantSource([{ path: "c.json", content: 'refresh_token: "1//secretvalue" shoppingcontent.googleapis.com' }]);
    expect(s.findings[0].excerpt).not.toContain("secretvalue");
  });
});