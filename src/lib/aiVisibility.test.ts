import { describe, expect, it } from "vitest";
import { citationRate, competitorShare, mentionRate, weightedVisibilityScore } from "./aiVisibility";

const observations = [
  { brand_mentioned: true, position: 2, cited_urls: ["https://example.se"], competitor_mentions: ["rival.se"], engine: "chatgpt", observed_at: "2026-09-27T10:00:00Z" },
  { brand_mentioned: true, position: 8, cited_urls: [], competitor_mentions: ["rival.se", "other.se"], engine: "perplexity", observed_at: "2026-09-27T10:00:00Z" },
  { brand_mentioned: false, position: null, cited_urls: [], competitor_mentions: ["other.se"], engine: "google_ai", observed_at: "2026-09-27T10:00:00Z" },
];

describe("AI visibility metrics", () => {
  it("calculates mention and citation rates", () => {
    expect(mentionRate(observations)).toBeCloseTo(2 / 3);
    expect(citationRate(observations)).toBeCloseTo(1 / 3);
  });

  it("rewards stronger positions without inventing a rank", () => {
    expect(weightedVisibilityScore(observations)).toBe(58);
  });

  it("summarizes competitor mentions", () => {
    expect(competitorShare(observations)[0]).toEqual({ name: "other.se", mentions: 2 });
  });
});
