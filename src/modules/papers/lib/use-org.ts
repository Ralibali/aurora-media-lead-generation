import { useQuery } from "@tanstack/react-query";
import { useParams } from "@/modules/shared/router";

import { supabase } from "@/modules/papers/client";

export function useOrg() {
  const { orgId } = useParams({ from: "/_authenticated/o/$orgId" });
  const q = useQuery({
    queryKey: ["org", orgId],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      const [{ data: org, error }, { data: mem }] = await Promise.all([
        supabase.from("organisations").select("*").eq("id", orgId).maybeSingle(),
        supabase.from("memberships").select("role").eq("org_id", orgId).eq("user_id", uid ?? "").maybeSingle(),
      ]);
      if (error) throw error;
      return { org, role: mem?.role, userId: uid };
    },
  });
  return { orgId, ...q, org: q.data?.org, role: q.data?.role, userId: q.data?.userId };
}

