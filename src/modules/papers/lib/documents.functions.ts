import { invokeProductFunction } from "@/modules/shared/server-client";
import { supabase } from "../client";
import type { DocStatus } from "./aurora";

export function processDocument({ data }: { data: { documentId: string } }) {
  return invokeProductFunction<{ status: DocStatus; duplicateOf: string | null }>("papers", "processDocument", data, supabase);
}

export function exportApproved({ data }: { data: { orgId: string } }) {
  return invokeProductFunction<{ exportId: string; count: number; csv: string }>("papers", "exportApproved", data, supabase);
}

export function recoverExport({ data }: { data: { exportId: string } }) {
  return invokeProductFunction<{ exportId: string; count: number; csv: string }>("papers", "recoverExport", data, supabase);
}
