export type SeoAutopilotQuery = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SeoAutopilotPage = SeoAutopilotQuery;

export type SeoAutopilotAction = {
  id: string;
  type: "quick-win" | "decay" | "ctr" | "ranking" | "content-gap";
  title: string;
  target: string;
  reason: string;
  expectedImpact: "low" | "medium" | "high";
  risk: "low" | "medium";
  approvalRequired: boolean;
};

const keyOf = (row: SeoAutopilotQuery) => row.keys?.[0]?.trim() || "okänd";
const safeCtr = (ctr: number) => Number.isFinite(ctr) ? ctr : 0;
const safePosition = (position: number) => Number.isFinite(position) ? position : 99;

export function buildSeoAutopilotActions(input: {
  queries?: SeoAutopilotQuery[];
  pages?: SeoAutopilotPage[];
}): SeoAutopilotAction[] {
  const actions: SeoAutopilotAction[] = [];

  for (const query of input.queries ?? []) {
    const keyword = keyOf(query);
    const position = safePosition(query.position);
    const ctr = safeCtr(query.ctr);

    if (query.impressions >= 150 && position > 3 && position <= 12) {
      actions.push({
        id: `quick-win:${keyword}`,
        type: "quick-win",
        title: `Lyft ${keyword} från sida ett till topp 3`,
        target: keyword,
        reason: `${query.impressions} visningar och snittposition ${position.toFixed(1)} visar att sidan redan har chans att vinna mer trafik.`,
        expectedImpact: query.impressions >= 500 ? "high" : "medium",
        risk: "low",
        approvalRequired: true,
      });
    }

    if (query.impressions >= 100 && position <= 8 && ctr < 0.025) {
      actions.push({
        id: `ctr:${keyword}`,
        type: "ctr",
        title: `Förbättra titel/meta för ${keyword}`,
        target: keyword,
        reason: `Sökordet syns högt men CTR är bara ${(ctr * 100).toFixed(1)} %. Testa tydligare titel, meta och erbjudande.`,
        expectedImpact: "medium",
        risk: "low",
        approvalRequired: true,
      });
    }

    if (query.impressions >= 80 && position > 12 && position <= 25) {
      actions.push({
        id: `content-gap:${keyword}`,
        type: "content-gap",
        title: `Skapa eller bygg ut innehåll för ${keyword}`,
        target: keyword,
        reason: `Sökordet har efterfrågan men rankar i genomsnitt ${position.toFixed(1)}. Det kräver oftast bättre innehåll eller internlänkning.`,
        expectedImpact: "medium",
        risk: "medium",
        approvalRequired: true,
      });
    }
  }

  for (const page of input.pages ?? []) {
    const pageUrl = keyOf(page);
    if (page.impressions >= 250 && safeCtr(page.ctr) < 0.015) {
      actions.push({
        id: `page-ctr:${pageUrl}`,
        type: "ctr",
        title: "Förbättra snippet för högvisad sida",
        target: pageUrl,
        reason: `${page.impressions} visningar men ${(safeCtr(page.ctr) * 100).toFixed(1)} % CTR. Sidan behöver tydligare sökresultatstext.`,
        expectedImpact: "medium",
        risk: "low",
        approvalRequired: true,
      });
    }
  }

  return actions
    .filter((action, index, list) => list.findIndex((other) => other.id === action.id) === index)
    .sort((a, b) => {
      const impact = { high: 3, medium: 2, low: 1 } as const;
      return impact[b.expectedImpact] - impact[a.expectedImpact] || a.risk.localeCompare(b.risk);
    })
    .slice(0, 12);
}

export function summarizeSeoAutopilot(actions: SeoAutopilotAction[]) {
  return {
    total: actions.length,
    approvalRequired: actions.filter((action) => action.approvalRequired).length,
    highImpact: actions.filter((action) => action.expectedImpact === "high").length,
    lowRisk: actions.filter((action) => action.risk === "low").length,
  };
}
