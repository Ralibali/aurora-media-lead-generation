export type InboxPlan = "starter" | "team" | "agency";
export type InboxOnboarding = "draft" | "configuring" | "ready" | "live" | "paused";
export type InboxSubscription = "trialing" | "active" | "past_due" | "paused" | "canceled";
export type InboxPipelineStage = "new" | "qualified" | "followup" | "meeting" | "customer" | "lost";

export const PLAN_DEFAULTS: Record<InboxPlan, { price: number; seats: number; label: string }> = {
  starter: { price: 695, seats: 1, label: "Starter" },
  team: { price: 1295, seats: 5, label: "Team" },
  agency: { price: 2495, seats: 15, label: "Agency" },
};

export const PIPELINE_LABELS: Record<InboxPipelineStage, string> = {
  new: "Ny",
  qualified: "Kvalificerad",
  followup: "Följ upp",
  meeting: "Möte",
  customer: "Kund",
  lost: "Förlorad",
};

export function onboardingProgress(status: InboxOnboarding) {
  return ({ draft: 10, configuring: 45, ready: 75, live: 100, paused: 100 } as const)[status];
}

export function pipelineSummary(items: Array<{ stage: InboxPipelineStage }>) {
  return items.reduce<Record<InboxPipelineStage, number>>(
    (summary, item) => {
      summary[item.stage] += 1;
      return summary;
    },
    { new: 0, qualified: 0, followup: 0, meeting: 0, customer: 0, lost: 0 },
  );
}
