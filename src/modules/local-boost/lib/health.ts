export type ChecklistStatus = "todo" | "in_progress" | "done" | "blocked" | "not_applicable";

export type ScoredChecklistItem = { status: ChecklistStatus; weight: number };

const STATUS_FACTOR: Record<ChecklistStatus, number | null> = {
  done: 1,
  in_progress: 0.5,
  todo: 0,
  blocked: 0,
  not_applicable: null,
};

/**
 * Hälsopoäng 0–100 baserad på checklistan. Poster markerade
 * "ej tillämpligt" räknas varken i täljare eller nämnare.
 */
export function calculateHealthScore(items: ScoredChecklistItem[]): number {
  let earned = 0;
  let possible = 0;
  for (const item of items) {
    const factor = STATUS_FACTOR[item.status];
    if (factor === null) continue;
    possible += item.weight;
    earned += item.weight * factor;
  }
  if (possible === 0) return 0;
  return Math.round((earned / possible) * 100);
}

export function healthLabel(score: number): "Kritisk" | "Behöver arbete" | "Stabil" | "Stark" {
  if (score < 40) return "Kritisk";
  if (score < 65) return "Behöver arbete";
  if (score < 85) return "Stabil";
  return "Stark";
}
