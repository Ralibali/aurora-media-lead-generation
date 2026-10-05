import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type DocStatus } from "@/modules/papers/lib/aurora";

export function StatusBadge({ status }: { status: DocStatus }) {
  const variant = status === "needs_review" ? "default" : status === "approved" ? "secondary" : "outline";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}

