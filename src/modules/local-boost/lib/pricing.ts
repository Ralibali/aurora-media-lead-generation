export type Plan = {
  code: string;
  name: string;
  monthly_price_sek: number;
  onboarding_fee_sek: number;
  description: string;
  sort_order: number;
};

export type BillableLocation = {
  plan_code: string | null;
  status: "onboarding" | "active" | "paused" | "churned";
};

/** MRR räknas endast på aktiva platser med en satt plan. */
export function calculateMrr(locations: BillableLocation[], plans: Plan[]): number {
  const priceByCode = new Map(plans.map((p) => [p.code, p.monthly_price_sek]));
  return locations.reduce((sum, location) => {
    if (location.status !== "active" || !location.plan_code) return sum;
    return sum + (priceByCode.get(location.plan_code) ?? 0);
  }, 0);
}

/** Engångsintäkt för platser som fortfarande är under onboarding. */
export function calculatePipelineOnboarding(
  locations: BillableLocation[],
  plans: Plan[],
): number {
  const feeByCode = new Map(plans.map((p) => [p.code, p.onboarding_fee_sek]));
  return locations.reduce((sum, location) => {
    if (location.status !== "onboarding" || !location.plan_code) return sum;
    return sum + (feeByCode.get(location.plan_code) ?? 0);
  }, 0);
}

export function formatSek(amount: number): string {
  return `${new Intl.NumberFormat("sv-SE").format(Math.round(amount))} kr`;
}
