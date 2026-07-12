import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildQuery,
  isDirectoryDomain,
  normalizeDomain,
  pickContactPage,
  scoreFit,
} from "./lib.ts";

Deno.test("buildQuery combines free text, need term, industry and location", () => {
  const q = buildQuery({
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

Deno.test("buildQuery valfritt drops need term", () => {
  const q = buildQuery({ freeText: "bygg", needType: "valfritt", industry: null, location: "Sweden" });
  assertEquals(q, 'bygg Sweden');
});

Deno.test("normalizeDomain strips www and protocol", () => {
  assertEquals(normalizeDomain("https://www.Example.SE/kontakt"), "example.se");
  assertEquals(normalizeDomain("foo.bar.com"), "foo.bar.com");
  assertEquals(normalizeDomain("not a url"), null);
});

Deno.test("isDirectoryDomain filters LinkedIn/Hitta/Allabolag etc.", () => {
  for (const bad of ["linkedin.com", "www.linkedin.com", "hitta.se", "sub.allabolag.se", "facebook.com", "reco.se"]) {
    const d = normalizeDomain(bad)!;
    assert(isDirectoryDomain(d), `should filter ${bad}`);
  }
  assert(!isDirectoryDomain("aurorabageri.se"));
});

Deno.test("pickContactPage picks same-domain link with contact hint", () => {
  const url = pickContactPage("example.se", [
    "https://example.se/produkter",
    "https://example.se/kontakt",
    { url: "https://other.se/kontakt" },
  ]);
  assertEquals(url, "https://example.se/kontakt");
});

Deno.test("pickContactPage returns null when nothing matches", () => {
  assertEquals(pickContactPage("example.se", ["https://example.se/blogg"]), null);
});

Deno.test("scoreFit rewards industry/location match and old copyright", () => {
  const r = scoreFit({
    needType: "webb",
    industry: "restaurang",
    location: "Linköping",
    markdown: "Välkommen till vår restaurang i Linköping. © 2018 Aurora",
    contactUrl: "https://example.se/kontakt",
    domain: "example.se",
  });
  assert(r.score >= 60, `expected >=60, got ${r.score}`);
  const codes = r.signals.map((s) => s.code);
  assert(codes.includes("has_contact_page"));
  assert(codes.includes("industry_match"));
  assert(codes.includes("location_match"));
  assert(codes.includes("old_copyright"));
});

Deno.test("scoreFit flags placeholder site", () => {
  const r = scoreFit({
    needType: "valfritt",
    industry: null,
    location: null,
    markdown: "Sidan är under ombyggnad. Kom tillbaka snart.",
    contactUrl: null,
    domain: "example.se",
  });
  assert(r.signals.some((s) => s.code === "placeholder_site"));
});

Deno.test("scoreFit caps at 100", () => {
  const r = scoreFit({
    needType: "ehandel",
    industry: "möbler",
    location: "Malmö",
    markdown: "möbler i Malmö. © 2015 under ombyggnad tillfällig sida placeholder",
    contactUrl: "https://example.se/contact",
    domain: "example.se",
  });
  assert(r.score <= 100);
});
