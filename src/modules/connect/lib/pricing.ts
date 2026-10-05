/** Pris- och kostnadslogik för Aurora Voice. Rena funktioner, testade. */

export interface PlanPricing {
  key: string;
  name: string;
  setupFeeSek: number;
  monthlyFeeSek: number;
  includedMinutes: number;
  overageSekPerMinute: number;
}

export const PILOT_PLAN: PlanPricing = {
  key: "pilot",
  name: "Pilot",
  setupFeeSek: 4995,
  monthlyFeeSek: 1495,
  includedMinutes: 200,
  overageSekPerMinute: 3.9,
};

export const INTEGRATION_PLAN: PlanPricing = {
  key: "integration",
  name: "Integration",
  setupFeeSek: 9995,
  monthlyFeeSek: 2995,
  includedMinutes: 600,
  overageSekPerMinute: 3.5,
};

export function roundSek(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Fakturerbart belopp för en månad, exklusive moms. */
export function monthlyInvoiceSek(
  plan: PlanPricing,
  usedMinutes: number,
  options: { includeSetup?: boolean } = {},
): number {
  const overageMinutes = Math.max(0, usedMinutes - plan.includedMinutes);
  const total =
    plan.monthlyFeeSek +
    overageMinutes * plan.overageSekPerMinute +
    (options.includeSetup ? plan.setupFeeSek : 0);
  return roundSek(total);
}

/** Månatlig återkommande intäkt: abonnemang, aldrig uppstartsavgift. */
export function mrrSek(subscriptions: { monthlyFeeSek: number; active: boolean }[]): number {
  return roundSek(
    subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.monthlyFeeSek, 0),
  );
}

export function grossMarginSek(revenueSek: number, providerCostSek: number): number {
  return roundSek(revenueSek - providerCostSek);
}

export type BudgetLevel = "ok" | "warning" | "over";

export function budgetLevel(
  spentSek: number,
  budgetSek: number,
  alertThresholdPct: number,
): BudgetLevel {
  if (budgetSek <= 0) return "ok";
  const pct = (spentSek / budgetSek) * 100;
  if (pct >= 100) return "over";
  if (pct >= alertThresholdPct) return "warning";
  return "ok";
}

export function formatSek(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
