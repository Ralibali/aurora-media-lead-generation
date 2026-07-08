// Edge Function: list-leads
// Unified admin API för lead-hantering. Skyddad med FAQ_ANALYTICS_PASSWORD (Bearer).
// Actions (POST): list | detail | update | delete
// GET behålls som legacy alias för action=list.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_STATUS = new Set([
  "ny",
  "kontaktad",
  "mote_bokat",
  "offert_skickad",
  "kund",
  "forlorad",
]);

type Source = "karta" | "kontakt" | "genomlysning";

const tableFor = (source: Source) =>
  source === "karta" ? "ai_map_leads" : source === "kontakt" ? "leads" : "genomlysning_leads";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function nextDripStep(row: {
  step_2_sent_at: string | null;
  step_5_sent_at: string | null;
  step_9_sent_at: string | null;
  step_14_sent_at: string | null;
}) {
  const steps = [
    { day: 2, at: row.step_2_sent_at },
    { day: 5, at: row.step_5_sent_at },
    { day: 9, at: row.step_9_sent_at },
    { day: 14, at: row.step_14_sent_at },
  ];
  const sent = steps.filter((s) => s.at);
  const last = sent.length ? sent[sent.length - 1] : null;
  const next = steps.find((s) => !s.at) ?? null;
  return {
    last_step: last ? `D${last.day}` : null,
    next_step: next ? `D${next.day}` : null,
    steps_sent: sent.length,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const ADMIN = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || (token !== PASSWORD && token !== ADMIN)) return json({ error: "Unauthorized" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body =
      req.method === "POST"
        ? ((await req.json().catch(() => ({}))) as {
            action?: string;
            id?: string;
            source?: Source;
            status?: string;
            notes?: string | null;
            followup_at?: string | null;
          })
        : { action: "list" as const };

    const action = body.action ?? "list";

    // ─────────────────────────── LIST ───────────────────────────
    if (action === "list") {
      const [karta, kontakt, genomlysning, processCounts, drip] = await Promise.all([
        admin
          .from("ai_map_leads")
          .select(
            "id, created_at, company_name, contact_name, email, phone, industry, employee_count, pain_areas, total_score, total_potential, status, notes, followup_at"
          )
          .order("created_at", { ascending: false }),
        admin
          .from("leads")
          .select(
            "id, created_at, name, email, company, paket, platform, lead_label, internal_note, message, status, notes, followup_at"
          )
          .order("created_at", { ascending: false }),
        admin
          .from("genomlysning_leads")
          .select("id, created_at, name, email, phone, company, message, status, notes, followup_at")
          .order("created_at", { ascending: false }),
        admin.from("ai_map_processes").select("lead_id"),
        admin
          .from("ai_map_email_sequence")
          .select(
            "lead_id, email, unsubscribed_at, unsubscribed_reason, step_2_sent_at, step_5_sent_at, step_9_sent_at, step_14_sent_at"
          ),
      ]);

      if (karta.error) throw karta.error;
      if (kontakt.error) throw kontakt.error;
      if (genomlysning.error) throw genomlysning.error;
      if (processCounts.error) console.warn("processCounts", processCounts.error);
      if (drip.error) console.warn("drip", drip.error);

      const procByLead = new Map<string, number>();
      for (const r of processCounts.data ?? []) {
        procByLead.set(r.lead_id as string, (procByLead.get(r.lead_id as string) ?? 0) + 1);
      }
      const dripByLead = new Map<string, (typeof drip.data)[number]>();
      for (const r of drip.data ?? []) dripByLead.set(r.lead_id as string, r);

      const kartaRows = (karta.data ?? []).map((l) => {
        const d = dripByLead.get(l.id);
        return {
          id: l.id,
          source: "karta" as const,
          created_at: l.created_at,
          name: l.contact_name,
          email: l.email,
          phone: l.phone,
          company: l.company_name,
          industry: l.industry,
          employee_count: l.employee_count,
          pain_areas: l.pain_areas,
          message: null as string | null,
          status: l.status,
          notes: l.notes,
          followup_at: l.followup_at,
          total_score: l.total_score,
          total_potential: l.total_potential,
          process_count: procByLead.get(l.id) ?? 0,
          drip: d
            ? {
                unsubscribed_at: d.unsubscribed_at,
                unsubscribed_reason: d.unsubscribed_reason,
                ...nextDripStep(d),
              }
            : null,
        };
      });

      const kontaktRows = (kontakt.data ?? []).map((l) => ({
        id: l.id,
        source: "kontakt" as const,
        created_at: l.created_at,
        name: l.name,
        email: l.email,
        phone: null as string | null,
        company: l.company,
        industry: null as string | null,
        employee_count: null as string | null,
        pain_areas: null as string[] | null,
        message: l.message,
        status: l.status,
        notes: l.notes,
        followup_at: l.followup_at,
        paket: l.paket,
        platform: l.platform,
        lead_label: l.lead_label,
        internal_note: l.internal_note,
      }));

      const genomlysningRows = (genomlysning.data ?? []).map((l) => ({
        id: l.id,
        source: "genomlysning" as const,
        created_at: l.created_at,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        industry: null as string | null,
        employee_count: null as string | null,
        pain_areas: null as string[] | null,
        message: l.message,
        status: l.status,
        notes: l.notes,
        followup_at: l.followup_at,
      }));

      const unified = [...kartaRows, ...kontaktRows, ...genomlysningRows].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const now = Date.now();
      const weekAgo = now - 1000 * 60 * 60 * 24 * 7;
      const stats = {
        total: unified.length,
        new_this_week: unified.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length,
        unhandled: unified.filter((l) => l.status === "ny").length,
        meetings_booked: unified.filter(
          (l) => l.source === "genomlysning" || l.status === "mote_bokat"
        ).length,
        karta_to_booking_pct:
          kartaRows.length > 0
            ? Math.round((genomlysningRows.length / kartaRows.length) * 1000) / 10
            : 0,
      };

      return json({ leads: unified, stats });
    }

    // ─────────────────────────── DETAIL ───────────────────────────
    if (action === "detail") {
      if (!body.id || body.source !== "karta") return json({ error: "Missing id/source" }, 400);
      const [{ data: processes, error: pErr }, { data: drip, error: dErr }] = await Promise.all([
        admin
          .from("ai_map_processes")
          .select("id, process_name, weekly_time, score, potential, recommended_solution")
          .eq("lead_id", body.id)
          .order("position", { ascending: true }),
        admin
          .from("ai_map_email_sequence")
          .select("*")
          .eq("lead_id", body.id)
          .maybeSingle(),
      ]);
      if (pErr) throw pErr;
      if (dErr) console.warn("drip detail", dErr);
      return json({ processes: processes ?? [], drip: drip ?? null });
    }

    // ─────────────────────────── UPDATE ───────────────────────────
    if (action === "update") {
      if (!body.id || !body.source) return json({ error: "Missing id/source" }, 400);
      const patch: Record<string, unknown> = {};
      if (body.status !== undefined) {
        if (!ALLOWED_STATUS.has(body.status)) return json({ error: "Invalid status" }, 400);
        patch.status = body.status;
      }
      if (body.notes !== undefined) patch.notes = body.notes;
      if (body.followup_at !== undefined) patch.followup_at = body.followup_at || null;
      if (Object.keys(patch).length === 0) return json({ error: "Nothing to update" }, 400);
      const { error } = await admin.from(tableFor(body.source)).update(patch).eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    // ─────────────────────────── DELETE ───────────────────────────
    if (action === "delete") {
      if (!body.id || !body.source) return json({ error: "Missing id/source" }, 400);
      if (body.source === "karta") {
        await admin.from("ai_map_email_sequence").delete().eq("lead_id", body.id);
        await admin.from("ai_map_processes").delete().eq("lead_id", body.id);
      }
      const { error } = await admin.from(tableFor(body.source)).delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("[list-leads] error", err);
    return json({ error: String(err) }, 500);
  }
});
