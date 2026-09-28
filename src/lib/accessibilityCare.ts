export type AccessibilityPlan = "audit" | "monitor" | "monitor_plus";

export const ACCESSIBILITY_PLAN_DEFAULTS: Record<AccessibilityPlan, { price: number; frequency: "manual" | "weekly"; label: string }> = {
  audit: { price: 2995, frequency: "manual", label: "Audit" },
  monitor: { price: 495, frequency: "weekly", label: "Monitor" },
  monitor_plus: { price: 995, frequency: "weekly", label: "Monitor Plus" },
};

export function accessibilityHealth(scan: { critical_count:number; serious_count:number; moderate_count:number; scan_errors:number } | null) {
  if (!scan) return { level: "unknown" as const, label: "Ingen baseline" };
  if (scan.scan_errors > 0) return { level: "error" as const, label: "Scan behöver kontrolleras" };
  if (scan.critical_count > 0) return { level: "critical" as const, label: "Kritiska fynd" };
  if (scan.serious_count > 0) return { level: "serious" as const, label: "Allvarliga fynd" };
  if (scan.moderate_count > 0) return { level: "moderate" as const, label: "Måttliga fynd" };
  return { level: "good" as const, label: "Inga höga automatiska fynd" };
}

export function openRemediationCount(tasks: Array<{ status:string }>) {
  return tasks.filter((task) => !["done","wont_fix"].includes(task.status)).length;
}
