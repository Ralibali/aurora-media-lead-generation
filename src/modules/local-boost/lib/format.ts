export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value: number | null | undefined, fallback = "—"): string {
  if (value == null) return fallback;
  return new Intl.NumberFormat("sv-SE").format(value);
}

export const STATUS_LABEL: Record<string, string> = {
  onboarding: "Onboarding",
  active: "Aktiv",
  paused: "Pausad",
  churned: "Avslutad",
  todo: "Att göra",
  in_progress: "Pågår",
  done: "Klar",
  blocked: "Blockerad",
  not_applicable: "Ej tillämpligt",
  open: "Öppen",
  waiting_client: "Väntar på kund",
  ok: "Stämmer",
  mismatch: "Avviker",
  missing: "Saknas",
  unknown: "Okänt",
};

export function label(value: string | null | undefined): string {
  if (!value) return "—";
  return STATUS_LABEL[value] ?? value;
}
