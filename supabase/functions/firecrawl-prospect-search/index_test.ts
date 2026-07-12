import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildSearchQuery,
  buildQuery,
  isBlockedDomain,
  isDirectoryDomain,
  normalizeDomain,
  chooseContactPage,
  pickContactPage,
  calculateFitScore,
  scoreFit,
} from "./lib.ts";

Deno.test("buildSearchQuery combines free text, need term, industry and location", () => {
  const q = buildSearchQuery({
    freeText: "småföretag med gammal hemsida",
    needType: "webb",
    industry: "restaurang",
    location: "Linköping",
  });
  assert(q.includes("småföretag"));
  assert(q.includes("hemsida"));
  assert(q.includes('"restaurang"'));
  assert(q.includes("Linköping"));
});

Deno.test("buildQuery alias === buildSearchQuery", () => {
  assertEquals(buildQuery, buildSearchQuery);
});

Deno.test("buildSearchQuery valfritt drops need term", () => {
  const q = buildSearchQuery({ freeText: "bygg", needType: "valfritt", industry: null, location: "Sweden" });
  assertEquals(q, "bygg Sweden");
});

Deno.test("normalizeDomain strips www and protocol", () => {
  assertEquals(normalizeDomain("https://www.Example.SE/kontakt"), "example.se");
  assertEquals(normalizeDomain("foo.bar.com"), "foo.bar.com");
  assertEquals(normalizeDomain("not a url"), null);
});

Deno.test("normalizeDomain rejects mailto/tel/javascript/fragment", () => {
  assertEquals(normalizeDomain("mailto:foo@bar.se"), null);
  assertEquals(normalizeDomain("tel:+46700000000"), null);
  assertEquals(normalizeDomain("javascript:void(0)"), null);
  assertEquals(normalizeDomain("#anchor"), null);
});

Deno.test("isBlockedDomain filters known directories and social sites", () => {
  for (const bad of [
    "linkedin.com", "www.linkedin.com", "hitta.se", "sub.allabolag.se",
    "facebook.com", "reco.se", "bing.com", "www.bing.com", "duckduckgo.com",
  ]) {
    const d = normalizeDomain(bad)!;
    assert(isBlockedDomain(d), `should filter ${bad}`);
  }
  assert(!isBlockedDomain("aurorabageri.se"));
});

Deno.test("isBlockedDomain filters google.* / yahoo.* dynamically", () => {
  for (const bad of [
    "google.com", "www.google.com", "google.se", "google.co.uk",
    "yahoo.com", "yahoo.co.jp", "search.yahoo.com",
  ]) {
    const d = normalizeDomain(bad)!;
    assert(isBlockedDomain(d), `should filter ${bad}`);
  }
  // Domain that happens to contain google/yahoo as a partial label must NOT be blocked.
  assert(!isBlockedDomain("googleish.se"));
  assert(!isBlockedDomain("myyahoo-fanpage.se"));
});

Deno.test("isDirectoryDomain alias works", () => {
  assertEquals(isDirectoryDomain, isBlockedDomain);
});

Deno.test("chooseContactPage picks same-domain link with contact hint", () => {
  const url = chooseContactPage("example.se", [
    "https://example.se/produkter",
    "https://example.se/kontakt",
    { url: "https://other.se/kontakt" },
  ]);
  assertEquals(url, "https://example.se/kontakt");
});

Deno.test("chooseContactPage ignores mailto/tel/javascript/fragments and external domains", () => {
  const url = chooseContactPage("example.se", [
    "mailto:info@example.se",
    "tel:+46700000000",
    "javascript:void(0)",
    "#kontakt",
    "https://external.se/kontakt",
    "https://example.se/kontakt",
  ]);
  assertEquals(url, "https://example.se/kontakt");
});

Deno.test("chooseContactPage returns null when nothing matches", () => {
  assertEquals(chooseContactPage("example.se", ["https://example.se/blogg"]), null);
});

Deno.test("pickContactPage alias works", () => {
  assertEquals(pickContactPage, chooseContactPage);
});

Deno.test("calculateFitScore is deterministic sum of signal points and clamped 0..100", () => {
  const r = calculateFitScore({
    needType: "webb",
    industry: "restaurang",
    location: "Linköping",
    markdown: "Välkommen till vår restaurang i Linköping. © 2018 Aurora",
    contactUrl: "https://example.se/kontakt",
    domain: "example.se",
  });
  const sum = r.signals.reduce((s, x) => s + x.points, 0);
  assertEquals(r.score, Math.min(100, Math.max(0, sum)));
  const codes = r.signals.map((s) => s.signal);
  assert(codes.includes("has_contact_page"));
  assert(codes.includes("industry_match"));
  assert(codes.includes("location_match"));
  assert(codes.includes("old_copyright"));
  // Every signal must have concrete evidence text.
  for (const s of r.signals) {
    assert(s.evidence.length > 0, `signal ${s.signal} missing evidence`);
    assert(Number.isFinite(s.points));
  }
});

Deno.test("calculateFitScore returns 0 when no signals observed", () => {
  const r = calculateFitScore({
    needType: "valfritt",
    industry: null,
    location: null,
    markdown: "Kort text utan signaler.",
    contactUrl: null,
    domain: "example.se",
  });
  assertEquals(r.score, 0);
  assertEquals(r.signals.length, 0);
});

Deno.test("calculateFitScore flags placeholder site and caps at 100", () => {
  const r = calculateFitScore({
    needType: "ehandel",
    industry: "möbler",
    location: "Malmö",
    markdown: "möbler i Malmö. © 2015 under ombyggnad tillfällig sida placeholder",
    contactUrl: "https://example.se/contact",
    domain: "example.se",
  });
  assert(r.signals.some((s) => s.signal === "placeholder_site"));
  assert(r.score <= 100);
  assert(r.score >= 0);
});

Deno.test("scoreFit alias works", () => {
  assertEquals(scoreFit, calculateFitScore);
});
