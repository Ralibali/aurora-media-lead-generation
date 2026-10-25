// @vitest-environment node
import { describe, expect, it } from "vitest";
import { analyzeAll, analyzeDkim, analyzeDmarc, analyzeSpf, normalizeDomain, normalizeSelectors } from "../../supabase/functions/mailguard-check/analyze";

const level = (fs: { level: string }[]) => fs.map((f) => f.level);

describe("MailGuard input", () => {
  it("normaliserar URL och e-post till domän", () => {
    expect(normalizeDomain("https://www.Foretag.se/kontakt")).toBe("www.foretag.se");
    expect(normalizeDomain("info@foretag.se")).toBe("foretag.se");
  });
  it("avvisar IP, localhost och interna domäner", () => {
    for (const d of ["127.0.0.1", "localhost", "server.internal", "printer.local", "", "nodot"]) expect(() => normalizeDomain(d)).toThrow();
  });
  it("max 5 selektorer och inga ogiltiga tecken", () => {
    expect(normalizeSelectors("google, selector1")).toEqual(["google", "selector1"]);
    expect(() => normalizeSelectors("a,b,c,d,e,f")).toThrow();
    expect(() => normalizeSelectors("../x")).toThrow();
  });
});

describe("MailGuard analys", () => {
  it("SPF saknas eller +all är kritiskt", () => {
    expect(level(analyzeSpf([]))).toEqual(["kritisk"]);
    expect(level(analyzeSpf(["v=spf1 +all"]))).toEqual(["kritisk"]);
    expect(level(analyzeSpf(["v=spf1 -all", "v=spf1 ~all"]))).toEqual(["kritisk"]);
  });
  it("SPF med -all är ok, för många uppslag kritiskt", () => {
    expect(level(analyzeSpf(["v=spf1 include:_spf.google.com -all"]))).toEqual(["ok"]);
    const many = "v=spf1 " + Array.from({ length: 11 }, (_, i) => `include:s${i}.se`).join(" ") + " -all";
    expect(level(analyzeSpf([many]))).toContain("kritisk");
  });
  it("DMARC p=none är varning, reject är ok, saknas är kritiskt", () => {
    expect(level(analyzeDmarc(["v=DMARC1; p=none; rua=mailto:a@b.se"]))).toEqual(["varning"]);
    expect(level(analyzeDmarc(["v=DMARC1; p=reject; rua=mailto:a@b.se"]))).toEqual(["ok"]);
    expect(level(analyzeDmarc([]))).toEqual(["kritisk"]);
  });
  it("DKIM utan selektor är aldrig ok", () => {
    expect(level(analyzeDkim({}))).toEqual(["okänd"]);
  });
  it("DKIM med kort nyckel ger varning, lång nyckel ok", () => {
    expect(level(analyzeDkim({ s1: ["v=DKIM1; k=rsa; p=" + "A".repeat(216)] }))).toEqual(["varning"]);
    expect(level(analyzeDkim({ s1: ["v=DKIM1; k=rsa; p=" + "A".repeat(392)] }))).toEqual(["ok"]);
  });
  it("misslyckad DNS blir okänd, inte ok", () => {
    const r = analyzeAll("foretag.se", { mx: null, rootTxt: null, dmarcTxt: null, dkim: {} });
    expect(r.summary.ok).toBe(0);
    expect(r.summary["okänd"]).toBe(4);
  });
});