export type VisibilityObservation = {
  brand_mentioned: boolean;
  position: number | null;
  cited_urls: string[];
  competitor_mentions: string[];
  engine: string;
  observed_at: string;
};

export function mentionRate(observations: VisibilityObservation[]) {
  if (!observations.length) return 0;
  return observations.filter((row) => row.brand_mentioned).length / observations.length;
}

export function citationRate(observations: VisibilityObservation[]) {
  if (!observations.length) return 0;
  return observations.filter((row) => row.cited_urls.length > 0).length / observations.length;
}

export function weightedVisibilityScore(observations: VisibilityObservation[]) {
  if (!observations.length) return 0;
  const score = observations.reduce((sum, row) => {
    if (!row.brand_mentioned) return sum;
    if (row.position && row.position <= 3) return sum + 100;
    if (row.position && row.position <= 10) return sum + 75;
    return sum + 55;
  }, 0);
  return Math.round(score / observations.length);
}

export function competitorShare(observations: VisibilityObservation[]) {
  const counts = new Map<string, number>();
  for (const row of observations) {
    for (const competitor of row.competitor_mentions) {
      const key = competitor.trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, mentions]) => ({ name, mentions }))
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name));
}
