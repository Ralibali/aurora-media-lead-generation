import type { Database } from "@/modules/papers/types";

export type DocStatus = Database["public"]["Enums"]["doc_status"];
export type OrgRole = Database["public"]["Enums"]["org_role"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export const STATUS_LABEL: Record<DocStatus, string> = {
  new: "Ny",
  needs_review: "Att granska",
  approved: "Godkänd",
  exported: "Exporterad",
};

export const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  reviewer: "Reviewer",
};

export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_BYTES = 20 * 1024 * 1024;

export function formatSek(v: number | null | undefined) {
  if (v == null) return "–";
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(Number(v));
}

export function formatDateTime(v: string | null | undefined) {
  if (!v) return "–";
  return new Date(v).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

export function canManage(role: OrgRole | undefined) {
  return role === "owner" || role === "admin";
}

export function errorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "Något gick fel";
}

export function downloadText(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

