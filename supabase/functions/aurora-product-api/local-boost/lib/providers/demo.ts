import {
  type AiVisibilityPoint,
  type AuroraSightProvider,
  type CitationRecord,
  type CompetitorRecord,
  type GBPProvider,
  type LocalDataProvider,
  type ProviderInfo,
  type ProviderResult,
  type RankingPoint,
} from "./types.ts";

/** Deterministisk pseudoslump så demodata inte hoppar mellan sidladdningar. */
function seed(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return hash;
}

function ok<T>(provider: ProviderInfo, data: T): ProviderResult<T> {
  return { ok: true, provider, isDemo: true, data };
}

const demoInfo = (key: string, name: string): ProviderInfo => ({ key, name, mode: "demo" });

export function createDemoLocalData(): LocalDataProvider {
  const info = demoInfo("demo_local", "Demoleverantör (lokal data)");
  return {
    info,
    getRankings: async (location, keywords) => {
      const now = new Date().toISOString();
      const data: RankingPoint[] = keywords.map((keyword) => {
        const s = seed(location.id + keyword);
        return {
          keyword: `DEMO: ${keyword}`,
          geo: location.city,
          position: 2 + (s % 15),
          localPackPosition: 1 + (s % 3),
          capturedAt: now,
        };
      });
      return ok(info, data);
    },
    getCitations: async (location) => {
      const directories = ["hitta.se", "Eniro", "Facebook", "Bing Places", "Apple Business"];
      const data: CitationRecord[] = directories.map((directory, index) => {
        const s = seed(location.id + directory);
        const status = (["ok", "ok", "mismatch", "missing"] as const)[s % 4] ?? "unknown";
        return {
          directory: `DEMO: ${directory}`,
          url: status === "missing" ? null : `https://exempel.se/demo-${index}`,
          status,
          foundName: status === "missing" ? null : `DEMO ${location.name}`,
          foundPhone: status === "missing" ? null : location.phone,
          checkedAt: new Date().toISOString(),
        };
      });
      return ok(info, data);
    },
    getCompetitors: async (location) => {
      const data: CompetitorRecord[] = [1, 2, 3].map((n) => {
        const s = seed(location.id + String(n));
        return {
          name: `DEMO Konkurrent ${n} i ${location.city ?? "orten"}`,
          rating: Number((3.6 + (s % 13) / 10).toFixed(1)),
          reviewCount: 40 + (s % 320),
          notes: "DEMO: simulerad konkurrensdata.",
        };
      });
      return ok(info, data);
    },
  };
}

export function createDemoGbp(): GBPProvider {
  const info = demoInfo("demo_gbp", "Demoleverantör (företagsprofil)");
  return {
    info,
    getProfile: async (location) => {
      const s = seed(location.id);
      return ok(info, {
        name: `DEMO ${location.name}`,
        verified: s % 2 === 0,
        categories: ["DEMO Kategori"],
        rating: Number((3.9 + (s % 10) / 10).toFixed(1)),
        reviewCount: 20 + (s % 250),
      });
    },
    listReviews: async (location) => {
      const s = seed(location.id);
      return ok(info, [
        {
          externalId: `demo-${s}-1`,
          authorName: "DEMO Kund",
          rating: 4,
          body: "DEMO: simulerad recension.",
          reviewDate: new Date().toISOString(),
        },
      ]);
    },
    // Demoleverantören publicerar aldrig externt.
    publishReviewReply: async () => ({
      ok: false,
      provider: info,
      reason: "not_configured",
      message:
        "DEMO-läge: inget publiceras externt. Koppla Google-företagsprofil för riktig publicering.",
    }),
  };
}

export function createDemoAuroraSight(): AuroraSightProvider {
  const info = demoInfo("demo_aurora_sight", "Demoleverantör (AI-synlighet)");
  return {
    info,
    getAiVisibility: async (location, prompts) => {
      const now = new Date().toISOString();
      const data: AiVisibilityPoint[] = prompts.map((prompt) => {
        const s = seed(location.id + prompt);
        const mentioned = s % 3 !== 0;
        return {
          engine: "DEMO-motor",
          prompt: `DEMO: ${prompt}`,
          mentioned,
          rankInAnswer: mentioned ? 1 + (s % 4) : null,
          capturedAt: now,
        };
      });
      return ok(info, data);
    },
  };
}
