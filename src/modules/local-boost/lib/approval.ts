export type ApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "published";

/**
 * Godkännandespärr: inget externt svar får publiceras utan ett godkännande,
 * och ett godkänt svar får bara publiceras en gång.
 */
export function canPublish(status: ApprovalStatus): boolean {
  return status === "approved";
}

export function nextStatus(
  current: ApprovalStatus,
  decision: "approve" | "reject",
): ApprovalStatus {
  if (current === "published") {
    throw new Error("Svaret är redan publicerat och kan inte ändras.");
  }
  return decision === "approve" ? "approved" : "rejected";
}

export function approvalLabel(status: ApprovalStatus): string {
  switch (status) {
    case "draft":
      return "Utkast";
    case "pending":
      return "Väntar på godkännande";
    case "approved":
      return "Godkänt";
    case "rejected":
      return "Avvisat";
    case "published":
      return "Publicerat";
  }
}
