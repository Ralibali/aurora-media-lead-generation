import { productEnv } from "../env.ts";
import { createServerFn } from "../../runtime.ts";
import { requireSupabaseAuth } from "../../runtime.ts";
import { z } from "npm:zod@3.25.76";
import { resolveVoiceProvider } from "./voice/index.ts";
import { VOICE_SCENARIOS } from "./voice-readiness.ts";

const uuid = z.string().uuid();

type AuditableClient = {
  // Loose shape: both the RLS-scoped and admin clients satisfy this.
  from: (table: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: (values: any) => PromiseLike<unknown>;
  };
};

async function logAudit(
  supabase: AuditableClient,
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  orgId: string | null,
  meta: Record<string, unknown> = {},
) {
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId,
    org_id: orgId,
    meta,
  });
}

/* ------------------------------------------------------------------ */
/* Identity & bootstrap                                                */
/* ------------------------------------------------------------------ */

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: memberships }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("org_members").select("org_id, is_owner, organizations(id, name, vertical)").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role as string);
    return {
      userId,
      profile: profile ?? null,
      roles: roleList,
      isStaff: roleList.includes("aurora_admin") || roleList.includes("aurora_operator"),
      isAdmin: roleList.includes("aurora_admin"),
      memberships: memberships ?? [],
    };
  });

/** Endast serverns uttryckligen tillåtna användare kan bli första Aurora-administratören. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const allowedUserId = productEnv["AURORA_BOOTSTRAP_ADMIN_USER_ID"]?.trim();
    if (!allowedUserId || context.userId !== allowedUserId) {
      return { granted: false, reason: "Administratörskontot behöver aktiveras av projektägaren." };
    }
    const { supabaseAdmin } = await import("../integrations/supabase/client.server.ts");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "aurora_admin");
    if (countError || count === null) throw new Error("Kunde inte kontrollera administratörsbehörighet.");
    if (count > 0) return { granted: false, reason: "Det finns redan en administratör." };
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "aurora_admin" });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "role.granted",
      entity: "user_roles",
      entity_id: context.userId,
      meta: { role: "aurora_admin", reason: "first_admin_bootstrap" },
    });
    return { granted: true, reason: "Du är nu Aurora-administratör." };
  });

/* ------------------------------------------------------------------ */
/* Commercial overview                                                 */
/* ------------------------------------------------------------------ */

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [orgs, agents, calls, leads, usage, subs, tests] = await Promise.all([
      supabase.from("organizations").select("id, name, vertical, status, demo_mode, created_at"),
      supabase.from("agents").select("id, org_id, status, provider"),
      supabase.from("calls").select("id, org_id, outcome, duration_seconds, cost_sek, is_demo, started_at"),
      supabase.from("leads").select("id, org_id, status, is_demo"),
      supabase.from("usage_events").select("org_id, cost_sek, is_demo, occurred_at"),
      supabase.from("subscriptions").select("org_id, status, mrr_sek"),
      supabase.from("voice_test_runs").select("scenario_key, status, is_real_call"),
    ]);
    return {
      organizations: orgs.data ?? [],
      agents: agents.data ?? [],
      calls: calls.data ?? [],
      leads: leads.data ?? [],
      usage: usage.data ?? [],
      subscriptions: subs.data ?? [],
      voiceTests: tests.data ?? [],
    };
  });

export const listOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("vertical_templates").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("plans").select("*").order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

const OnboardInput = z.object({
  name: z.string().min(2),
  orgNumber: z.string().optional().nullable(),
  vertical: z.enum(["trafikskola", "hospitality"]),
  city: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  contactPhone: z.string().optional().nullable(),
  templateKey: z.string(),
  planKey: z.string(),
  fallbackNumber: z.string().optional().nullable(),
  monthlyBudgetSek: z.number().min(0).default(2000),
});

interface TemplatePayload {
  greeting?: string;
  persona?: string;
  knowledge?: { question: string; answer: string }[];
  qualification?: { field_key: string; question: string; required?: boolean }[];
  handoff?: {
    description: string;
    condition_key: string;
    action: string;
    requires_approval?: boolean;
  }[];
}

export const onboardOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OnboardInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: template, error: templateError } = await supabase
      .from("vertical_templates")
      .select("*")
      .eq("key", data.templateKey)
      .maybeSingle();
    if (templateError) throw new Error(templateError.message);
    if (!template) throw new Error("Branschmallen hittades inte.");

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: data.name,
        org_number: data.orgNumber || null,
        vertical: data.vertical,
        city: data.city || null,
        contact_email: data.contactEmail || null,
        contact_phone: data.contactPhone || null,
        status: "onboarding",
        demo_mode: true,
        onboarding_step: 4,
        created_by: userId,
      })
      .select()
      .single();
    if (orgError) throw new Error(orgError.message);

    const payload = (template.payload ?? {}) as TemplatePayload;
    const greeting = (payload.greeting ?? "").replace("{{org_name}}", data.name);

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        org_id: org.id,
        name: `${data.name} – receptionist`,
        vertical: data.vertical,
        status: "draft",
        persona: payload.persona ?? null,
        greeting: greeting || null,
        fallback_number: data.fallbackNumber || null,
        provider: "demo",
      })
      .select()
      .single();
    if (agentError) throw new Error(agentError.message);

    const knowledge = (payload.knowledge ?? []).map((k) => ({
      org_id: org.id,
      agent_id: agent.id,
      question: k.question,
      answer: k.answer,
      source: "mall",
    }));
    const qualification = (payload.qualification ?? []).map((q, index) => ({
      org_id: org.id,
      agent_id: agent.id,
      position: index,
      field_key: q.field_key,
      question: q.question,
      required: q.required ?? true,
    }));
    const handoff = (payload.handoff ?? []).map((h, index) => ({
      org_id: org.id,
      agent_id: agent.id,
      position: index,
      description: h.description,
      condition_key: h.condition_key,
      action: h.action,
      target: data.fallbackNumber || null,
      requires_approval: h.requires_approval ?? false,
    }));
    const hours = Array.from({ length: 7 }, (_, weekday) => ({
      org_id: org.id,
      weekday,
      opens: weekday < 5 ? "08:00" : null,
      closes: weekday < 5 ? "17:00" : null,
      closed: weekday >= 5,
    }));
    const integrations = (["telephony", "stt", "tts", "llm", "booking", "crm"] as const).map((kind) => ({
      org_id: org.id,
      kind,
      provider: "ej vald",
      status: "not_configured" as const,
    }));

    await Promise.all([
      knowledge.length ? supabase.from("knowledge_items").insert(knowledge) : Promise.resolve(),
      qualification.length ? supabase.from("qualification_questions").insert(qualification) : Promise.resolve(),
      handoff.length ? supabase.from("handoff_rules").insert(handoff) : Promise.resolve(),
      supabase.from("opening_hours").insert(hours),
      supabase.from("integrations").insert(integrations),
      supabase.from("cost_guardrails").insert({
        org_id: org.id,
        monthly_budget_sek: data.monthlyBudgetSek,
      }),
      supabase.from("voice_test_runs").insert(
        VOICE_SCENARIOS.map((s) => ({
          org_id: org.id,
          agent_id: agent.id,
          scenario_key: s.key,
          status: "planned" as const,
        })),
      ),
    ]);

    const { data: plan } = await supabase.from("plans").select("*").eq("key", data.planKey).maybeSingle();
    if (plan) {
      await supabase.from("subscriptions").insert({
        org_id: org.id,
        plan_id: plan.id,
        status: "pending",
        mrr_sek: plan.monthly_fee_sek,
      });
    }

    await logAudit(supabase, userId, "org.onboarded", "organizations", org.id, org.id, {
      template: data.templateKey,
      plan: data.planKey,
    });

    return { orgId: org.id as string, agentId: agent.id as string };
  });

/* ------------------------------------------------------------------ */
/* Organization detail                                                 */
/* ------------------------------------------------------------------ */

export const getOrganization = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const orgId = data.orgId;
    const [org, agents, hours, knowledge, questions, handoff, integrations, guardrails, subs, tests] =
      await Promise.all([
        supabase.from("organizations").select("*").eq("id", orgId).maybeSingle(),
        supabase.from("agents").select("*").eq("org_id", orgId).order("created_at"),
        supabase.from("opening_hours").select("*").eq("org_id", orgId).order("weekday"),
        supabase.from("knowledge_items").select("*").eq("org_id", orgId).order("created_at"),
        supabase.from("qualification_questions").select("*").eq("org_id", orgId).order("position"),
        supabase.from("handoff_rules").select("*").eq("org_id", orgId).order("position"),
        supabase.from("integrations").select("*").eq("org_id", orgId).order("kind"),
        supabase.from("cost_guardrails").select("*").eq("org_id", orgId).maybeSingle(),
        supabase.from("subscriptions").select("*, plans(*)").eq("org_id", orgId),
        supabase.from("voice_test_runs").select("*").eq("org_id", orgId),
      ]);
    if (!org.data) throw new Error("Kunden hittades inte.");
    return {
      organization: org.data,
      agents: agents.data ?? [],
      openingHours: hours.data ?? [],
      knowledge: knowledge.data ?? [],
      questions: questions.data ?? [],
      handoff: handoff.data ?? [],
      integrations: integrations.data ?? [],
      guardrails: guardrails.data ?? null,
      subscriptions: subs.data ?? [],
      voiceTests: tests.data ?? [],
    };
  });

const AgentUpdate = z.object({
  agentId: uuid,
  patch: z.object({
    name: z.string().min(2).optional(),
    status: z.enum(["draft", "testing", "live", "paused"]).optional(),
    persona: z.string().nullable().optional(),
    greeting: z.string().nullable().optional(),
    disclosure_text: z.string().min(5).optional(),
    consent_required: z.boolean().optional(),
    fallback_number: z.string().nullable().optional(),
    max_call_seconds: z.number().int().min(60).max(3600).optional(),
  }),
});

export const updateAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AgentUpdate.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: agent, error } = await supabase
      .from("agents")
      .update({
        ...(Object.fromEntries(Object.entries(data.patch).filter(([, value]) => value !== undefined)) as Record<
          string,
          unknown
        >),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.agentId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "agent.updated", "agents", agent.id, agent.org_id, data.patch);
    return agent;
  });

const KnowledgeInput = z.object({
  orgId: uuid,
  agentId: uuid.nullable().optional(),
  id: uuid.optional(),
  question: z.string().min(3),
  answer: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const saveKnowledgeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => KnowledgeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = {
      org_id: data.orgId,
      agent_id: data.agentId ?? null,
      question: data.question,
      answer: data.answer,
      is_active: data.isActive,
      source: "manuell",
    };
    const query = data.id
      ? supabase.from("knowledge_items").update(row).eq("id", data.id).select().single()
      : supabase.from("knowledge_items").insert(row).select().single();
    const { data: item, error } = await query;
    if (error) throw new Error(error.message);
    await logAudit(
      supabase,
      userId,
      data.id ? "knowledge.updated" : "knowledge.created",
      "knowledge_items",
      item.id,
      data.orgId,
      {},
    );
    return item;
  });

export const deleteKnowledgeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: uuid, orgId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("knowledge_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "knowledge.deleted", "knowledge_items", data.id, data.orgId, {});
    return { ok: true };
  });

const HoursInput = z.object({
  orgId: uuid,
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        opens: z.string().nullable(),
        closes: z.string().nullable(),
        closed: z.boolean(),
      }),
    )
    .length(7),
});

export const saveOpeningHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => HoursInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    for (const h of data.hours) {
      const { error } = await supabase
        .from("opening_hours")
        .update({ opens: h.closed ? null : h.opens, closes: h.closed ? null : h.closes, closed: h.closed })
        .eq("org_id", data.orgId)
        .eq("weekday", h.weekday);
      if (error) throw new Error(error.message);
    }
    await logAudit(supabase, userId, "hours.updated", "opening_hours", data.orgId, data.orgId, {});
    return { ok: true };
  });

const GuardrailInput = z.object({
  orgId: uuid,
  monthlyBudgetSek: z.number().min(0),
  alertThresholdPct: z.number().int().min(10).max(100),
  hardStop: z.boolean(),
});

export const saveGuardrails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GuardrailInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("cost_guardrails")
      .update({
        monthly_budget_sek: data.monthlyBudgetSek,
        alert_threshold_pct: data.alertThresholdPct,
        hard_stop: data.hardStop,
        updated_at: new Date().toISOString(),
      })
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "guardrails.updated", "cost_guardrails", data.orgId, data.orgId, {
      budget: data.monthlyBudgetSek,
    });
    return { ok: true };
  });

const IntegrationInput = z.object({
  id: uuid,
  orgId: uuid,
  provider: z.string().min(1),
  status: z.enum(["not_configured", "configured", "healthy", "degraded", "failing"]),
  requiresApproval: z.boolean(),
});

export const saveIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IntegrationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("integrations")
      .update({
        provider: data.provider,
        status: data.status,
        requires_approval: data.requiresApproval,
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "integration.updated", "integrations", data.id, data.orgId, {
      provider: data.provider,
      status: data.status,
    });
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Calls, leads, QA                                                    */
/* ------------------------------------------------------------------ */

export const listCalls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("calls")
      .select("*, organizations(name), agents(name)")
      .order("started_at", { ascending: false })
      .limit(200);
    if (data.orgId) query = query.eq("org_id", data.orgId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getCall = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ callId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const [call, messages, scorecards, lead] = await Promise.all([
      context.supabase.from("calls").select("*, organizations(name), agents(name)").eq("id", data.callId).maybeSingle(),
      context.supabase.from("call_messages").select("*").eq("call_id", data.callId).order("position"),
      context.supabase.from("qa_scorecards").select("*").eq("call_id", data.callId),
      context.supabase.from("leads").select("*").eq("call_id", data.callId).maybeSingle(),
    ]);
    if (!call.data) throw new Error("Samtalet hittades inte.");
    return {
      call: call.data,
      messages: messages.data ?? [],
      scorecards: scorecards.data ?? [],
      lead: lead.data ?? null,
    };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("leads")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.orgId) query = query.eq("org_id", data.orgId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        leadId: uuid,
        orgId: uuid,
        status: z.enum(["new", "qualified", "contacted", "booked", "won", "lost"]),
        notes: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("leads")
      .update({
        status: data.status,
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.leadId);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "lead.status_changed", "leads", data.leadId, data.orgId, {
      status: data.status,
    });
    return { ok: true };
  });

export const QA_CRITERIA = [
  { key: "greeting", label: "Hälsning och AI-information" },
  { key: "understanding", label: "Uppfattade uppringaren korrekt" },
  { key: "accuracy", label: "Korrekta svar utan påhitt" },
  { key: "qualification", label: "Ställde kvalificeringsfrågorna" },
  { key: "next_step", label: "Tydligt nästa steg eller överkoppling" },
] as const;

export const saveScorecard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        callId: uuid,
        orgId: uuid,
        scores: z.record(z.string(), z.number().int().min(0).max(5)),
        notes: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const total = Object.values(data.scores).reduce((sum, v) => sum + v, 0);
    const { error } = await context.supabase.from("qa_scorecards").insert({
      call_id: data.callId,
      org_id: data.orgId,
      reviewer_id: context.userId,
      criteria: data.scores,
      total_score: total,
      max_score: QA_CRITERIA.length * 5,
      notes: data.notes ?? null,
    });
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "qa.scored", "qa_scorecards", data.callId, data.orgId, {
      total,
    });
    return { ok: true, total };
  });

/* ------------------------------------------------------------------ */
/* Usage, audit, provider health, voice tests                          */
/* ------------------------------------------------------------------ */

export const getUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let usageQuery = context.supabase
      .from("usage_events")
      .select("*, organizations(name)")
      .order("occurred_at", { ascending: false })
      .limit(500);
    let guardQuery = context.supabase.from("cost_guardrails").select("*, organizations(name)");
    if (data.orgId) {
      usageQuery = usageQuery.eq("org_id", data.orgId);
      guardQuery = guardQuery.eq("org_id", data.orgId);
    }
    const [usage, guards] = await Promise.all([usageQuery, guardQuery]);
    return { usage: usage.data ?? [], guardrails: guards.data ?? [] };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audit_log")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getProviderHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const provider = resolveVoiceProvider(productEnv as Record<string, string | undefined>);
    const health = await provider.health();
    return { health, capabilities: provider.capabilities };
  });

export const listVoiceTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("voice_test_runs")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false });
    if (data.orgId) query = query.eq("org_id", data.orgId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const recordVoiceTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        runId: uuid,
        orgId: uuid,
        status: z.enum(["planned", "running", "passed", "failed", "blocked"]),
        isRealCall: z.boolean(),
        metrics: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
        notes: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if ((data.status === "passed" || data.status === "failed") && !data.isRealCall) {
      throw new Error("Ett testresultat får bara godkännas eller underkännas när det bygger på ett riktigt samtal.");
    }
    const { error } = await context.supabase
      .from("voice_test_runs")
      .update({
        status: data.status,
        is_real_call: data.isRealCall,
        metrics: data.metrics,
        notes: data.notes ?? null,
        executed_by: context.userId,
        executed_at: new Date().toISOString(),
      })
      .eq("id", data.runId);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "voice_test.recorded", "voice_test_runs", data.runId, data.orgId, {
      status: data.status,
      real_call: data.isRealCall,
    });
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Demo data (always labelled)                                         */
/* ------------------------------------------------------------------ */

export const generateDemoActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, vertical, demo_mode")
      .eq("id", data.orgId)
      .maybeSingle();
    if (!org) throw new Error("Kunden hittades inte.");
    if (!org.demo_mode) throw new Error("DEMO-data kan bara skapas när kunden står i demoläge.");
    const { data: agent } = await supabase.from("agents").select("id").eq("org_id", data.orgId).limit(1).maybeSingle();

    const isDriving = org.vertical === "trafikskola";
    const scripts = isDriving
      ? [
          {
            outcome: "qualified_lead" as const,
            lead: { name: "DEMO Anna Lind", phone: "+46700000001", intent: "B-körkort" },
            turns: [
              ["agent", "Hej och välkommen till trafikskolan. Du talar med en AI-assistent. Hur kan jag hjälpa dig?"],
              ["caller", "Hej, jag vill börja ta körkort."],
              ["agent", "Vad roligt. Har du körkortstillstånd sedan tidigare?"],
              ["caller", "Nej, inte än."],
              ["agent", "Då hjälper vi dig med det. Vad heter du och vilket nummer når vi dig på?"],
              ["caller", "Anna Lind, 070-000 00 01."],
              ["agent", "Tack Anna. En handledare ringer upp dig under kontorstid."],
            ],
          },
          {
            outcome: "transferred" as const,
            lead: null,
            turns: [
              ["agent", "Hej, du talar med trafikskolans AI-assistent."],
              ["caller", "Jag vill klaga på en inställd lektion."],
              ["agent", "Det beklagar jag. Jag kopplar dig till en medarbetare direkt."],
              ["system", "Samtalet kopplades till reservnumret."],
            ],
          },
        ]
      : [
          {
            outcome: "qualified_lead" as const,
            lead: { name: "DEMO Johan Berg", phone: "+46700000002", intent: "Helgvistelse" },
            turns: [
              ["agent", "Hej och välkommen. Du talar med vår AI-assistent. Vill du boka eller ställa en fråga?"],
              ["caller", "Hej, har ni ledigt första helgen i juli?"],
              ["agent", "Jag kollar gärna. Hur många gäster är ni?"],
              ["caller", "Vi är två vuxna och en hund."],
              ["agent", "Tack. Vad heter du och vilket nummer når vi dig på?"],
              ["caller", "Johan Berg, 070-000 00 02."],
              ["agent", "Tack Johan. Receptionen bekräftar tillgängligheten och återkommer."],
            ],
          },
          {
            outcome: "answered" as const,
            lead: null,
            turns: [
              ["agent", "Hej, du talar med vår AI-assistent."],
              ["caller", "När är incheckning?"],
              ["agent", "Incheckning sker enligt uppgifterna i kunskapsbasen. Vill du att jag tar ett meddelande?"],
              ["caller", "Nej tack, det räcker."],
            ],
          },
        ];

    const createdCallIds: string[] = [];
    for (const [index, script] of scripts.entries()) {
      const startedAt = new Date(Date.now() - (index + 1) * 3600_000);
      const duration = 90 + index * 40;
      const { data: call, error } = await supabase
        .from("calls")
        .insert({
          org_id: data.orgId,
          agent_id: agent?.id ?? null,
          provider: "demo",
          direction: "inbound",
          from_number: "+46700000000",
          to_number: "+46812345678",
          started_at: startedAt.toISOString(),
          ended_at: new Date(startedAt.getTime() + duration * 1000).toISOString(),
          duration_seconds: duration,
          outcome: script.outcome,
          avg_latency_ms: 850 + index * 60,
          cost_sek: Number(((duration / 60) * 1.6).toFixed(2)),
          is_demo: true,
          summary: "DEMO-samtal skapat i Aurora. Inget riktigt samtal har ägt rum.",
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      createdCallIds.push(call.id);

      await supabase.from("call_messages").insert(
        script.turns.map((turn, position) => ({
          call_id: call.id,
          org_id: data.orgId,
          position,
          speaker: turn[0] as string,
          content: `DEMO: ${turn[1]}`,
          offset_ms: position * 6000,
          is_demo: true,
        })),
      );

      await supabase.from("usage_events").insert([
        {
          org_id: data.orgId,
          call_id: call.id,
          kind: "telephony",
          provider: "demo",
          units: Number((duration / 60).toFixed(2)),
          unit: "minute",
          cost_sek: Number(((duration / 60) * 0.6).toFixed(2)),
          is_demo: true,
        },
        {
          org_id: data.orgId,
          call_id: call.id,
          kind: "llm",
          provider: "demo",
          units: script.turns.length,
          unit: "turn",
          cost_sek: Number((script.turns.length * 0.12).toFixed(2)),
          is_demo: true,
        },
      ]);

      if (script.lead) {
        await supabase.from("leads").insert({
          org_id: data.orgId,
          call_id: call.id,
          name: script.lead.name,
          phone: script.lead.phone,
          intent: script.lead.intent,
          status: "qualified",
          score: 70,
          is_demo: true,
          notes: "DEMO-lead skapad av Aurora för demonstration.",
        });
      }
    }

    await logAudit(supabase, userId, "demo.generated", "calls", null, data.orgId, {
      calls: createdCallIds.length,
    });
    return { created: createdCallIds.length };
  });

export const setDemoMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orgId: uuid, demoMode: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("organizations")
      .update({ demo_mode: data.demoMode, updated_at: new Date().toISOString() })
      .eq("id", data.orgId);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "org.demo_mode", "organizations", data.orgId, data.orgId, {
      demo_mode: data.demoMode,
    });
    return { ok: true };
  });

export const deployAgentToProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ agentId: uuid, confirm: z.literal(true) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Reading an organization's agent does not grant permission to deploy it.
    // Check the same staff boundary as the agents write policy before any
    // credentialed provider action, which cannot be protected by database RLS.
    const { data: isStaff, error: staffError } = await supabase.rpc("is_aurora_staff", { _user_id: userId });
    if (staffError || isStaff !== true) throw new Error("Endast Aurora-personal kan publicera agenter.");
    const { data: agent } = await supabase.from("agents").select("*").eq("id", data.agentId).maybeSingle();
    if (!agent) throw new Error("Agenten hittades inte.");
    const [org, knowledge, questions, handoff, hours] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", agent.org_id).maybeSingle(),
      supabase.from("knowledge_items").select("question, answer").eq("org_id", agent.org_id).eq("is_active", true),
      supabase.from("qualification_questions").select("field_key, question, required").eq("agent_id", agent.id),
      supabase.from("handoff_rules").select("description, condition_key, action, target").eq("agent_id", agent.id),
      supabase.from("opening_hours").select("weekday, opens, closes, closed").eq("org_id", agent.org_id),
    ]);

    const provider = resolveVoiceProvider(productEnv as Record<string, string | undefined>);
    const result = await provider.deployAgent({
      agentId: agent.id,
      orgName: org.data?.name ?? "",
      name: agent.name,
      language: agent.language,
      persona: agent.persona,
      greeting: agent.greeting,
      disclosureText: agent.disclosure_text,
      consentRequired: agent.consent_required,
      maxCallSeconds: agent.max_call_seconds,
      fallbackNumber: agent.fallback_number,
      knowledge: knowledge.data ?? [],
      qualification: (questions.data ?? []).map((q) => ({
        fieldKey: q.field_key,
        question: q.question,
        required: q.required,
      })),
      handoff: (handoff.data ?? []).map((h) => ({
        description: h.description,
        conditionKey: h.condition_key,
        action: h.action,
        target: h.target,
      })),
      openingHours: hours.data ?? [],
    });

    if (result.ok && !result.simulated) {
      const { error: updateError } = await supabase
        .from("agents")
        .update({ provider: provider.id, provider_agent_id: result.providerAgentId, status: "testing" })
        .eq("id", agent.id)
        .select("id")
        .single();
      if (updateError) throw new Error("Röstmotorn svarade, men agentens publiceringsstatus kunde inte sparas.");
    }
    await logAudit(supabase, userId, "agent.deploy_attempt", "agents", agent.id, agent.org_id, {
      provider: provider.id,
      simulated: result.simulated,
      ok: result.ok,
    });
    return result;
  });
