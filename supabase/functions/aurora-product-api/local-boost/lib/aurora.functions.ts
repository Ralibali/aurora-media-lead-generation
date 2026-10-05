import type { SupabaseClient } from "npm:@supabase/supabase-js@2.104.0";
import { productEnv } from "../env.ts";
import { createServerFn } from "../../runtime.ts";
import { requireSupabaseAuth } from "../../runtime.ts";
import { z } from "npm:zod@3.25.76";
import { nextStatus, type ApprovalStatus } from "./approval.ts";
import { calculateHealthScore, type ChecklistStatus } from "./health.ts";
import { resolveAuroraSightProvider, resolveGbpProvider, resolveLocalDataProvider } from "./providers/index.ts";

const uuid = z.string().uuid();

type Ctx = { supabase: SupabaseClient; userId: string };

async function loadAccess(context: Ctx) {
  const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  const roleList: string[] = (roles ?? []).map((r: { role: string }) => r.role);
  const { data: memberships } = await context.supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", context.userId);
  return {
    roles: roleList,
    isAdmin: roleList.includes("aurora_admin"),
    isStaff: roleList.includes("aurora_admin") || roleList.includes("operator"),
    orgIds: (memberships ?? []).map((m: { org_id: string }) => m.org_id),
  };
}

async function writeAudit(
  context: Ctx,
  entry: { action: string; entity?: string; entityId?: string | null; orgId?: string | null; meta?: unknown },
) {
  await context.supabase.from("audit_log").insert({
    actor_id: context.userId,
    org_id: entry.orgId ?? null,
    action: entry.action,
    entity: entry.entity ?? null,
    entity_id: entry.entityId ?? null,
    meta: entry.meta ?? {},
  });
}

function requireStaff(access: { isStaff: boolean }) {
  if (!access.isStaff) throw new Error("Behörighet saknas: endast Aurora-personal.");
}

/* ---------------------------------- Konto --------------------------------- */

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const access = await loadAccess(ctx);
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", ctx.userId)
      .maybeSingle();
    return { userId: ctx.userId, ...access, profile };
  });

/** Bootstrap kräver en uttryckligen konfigurerad användaridentitet på servern. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const allowedUserId = productEnv["AURORA_BOOTSTRAP_ADMIN_USER_ID"]?.trim();
    if (!allowedUserId || ctx.userId !== allowedUserId) {
      return { granted: false, message: "Administratörskontot behöver aktiveras av projektägaren." };
    }
    const { supabaseAdmin } = await import("../integrations/supabase/client.server.ts");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "aurora_admin");
    if (countError || count === null) throw new Error("Kunde inte kontrollera administratörsbehörighet.");
    if (count > 0) {
      return { granted: false, message: "Det finns redan en Aurora-admin." };
    }
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: ctx.userId, role: "aurora_admin" });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: ctx.userId,
      action: "role.bootstrap_admin",
      entity: "user_roles",
      meta: { note: "Första administratören registrerades." },
    });
    return { granted: true, message: "Du är nu Aurora-admin." };
  });

/* --------------------------------- Översikt -------------------------------- */

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const access = await loadAccess(ctx);
    const [{ data: plans }, { data: locations }, { data: orgs }, { data: actions }, { data: pending }] =
      await Promise.all([
        ctx.supabase.from("plans").select("*").order("sort_order"),
        ctx.supabase.from("locations").select("*").order("name"),
        ctx.supabase.from("organizations").select("*").order("name"),
        ctx.supabase.from("actions").select("*").order("due_date", { nullsFirst: false }),
        ctx.supabase
          .from("review_responses")
          .select("id, status, location_id, draft_text, created_at")
          .eq("status", "pending"),
      ]);
    return {
      access,
      plans: plans ?? [],
      locations: locations ?? [],
      organizations: orgs ?? [],
      actions: actions ?? [],
      pendingApprovals: pending ?? [],
    };
  });

/* --------------------------------- Platser --------------------------------- */

export const getLocationDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: uuid }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const { data: location } = await ctx.supabase.from("locations").select("*").eq("id", data.id).maybeSingle();
    if (!location) throw new Error("Platsen hittades inte eller så saknar du behörighet.");

    const [templates, items, reviews, responses, keywords, ranks, citations, competitors, aiv, actions] =
      await Promise.all([
        ctx.supabase.from("checklist_templates").select("*").order("sort_order"),
        ctx.supabase.from("checklist_items").select("*").eq("location_id", data.id),
        ctx.supabase.from("reviews").select("*").eq("location_id", data.id).order("review_date", { ascending: false }),
        ctx.supabase.from("review_responses").select("*").eq("location_id", data.id),
        ctx.supabase.from("keywords").select("*").eq("location_id", data.id),
        ctx.supabase
          .from("rank_snapshots")
          .select("*")
          .eq("location_id", data.id)
          .order("captured_at", { ascending: false }),
        ctx.supabase.from("citations").select("*").eq("location_id", data.id),
        ctx.supabase.from("competitors").select("*").eq("location_id", data.id),
        ctx.supabase.from("ai_visibility_snapshots").select("*").eq("location_id", data.id),
        ctx.supabase.from("actions").select("*").eq("location_id", data.id),
      ]);

    const templateList = templates.data ?? [];
    const itemList = items.data ?? [];
    const weights = new Map(templateList.map((t) => [t.key, t.weight as number]));
    const health = calculateHealthScore(
      itemList.map((i) => ({
        status: i.status as ChecklistStatus,
        weight: weights.get(i.template_key) ?? 1,
      })),
    );

    return {
      location,
      health,
      templates: templateList,
      checklist: itemList,
      reviews: reviews.data ?? [],
      responses: responses.data ?? [],
      keywords: keywords.data ?? [],
      ranks: ranks.data ?? [],
      citations: citations.data ?? [],
      competitors: competitors.data ?? [],
      aiVisibility: aiv.data ?? [],
      actions: actions.data ?? [],
    };
  });

export const updateChecklistItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["todo", "in_progress", "done", "blocked", "not_applicable"]),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));
    const { data: updated, error } = await ctx.supabase
      .from("checklist_items")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("id, location_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await writeAudit(ctx, {
      action: "checklist.update",
      entity: "checklist_items",
      entityId: data.id,
      meta: { status: data.status },
    });
    return { ok: true, locationId: updated?.location_id ?? null };
  });

/* -------------------------------- Onboarding ------------------------------- */

export const createOnboarding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        organizationId: uuid.optional(),
        organizationName: z.string().min(2).max(120).optional(),
        contactEmail: z.string().email().max(160).optional(),
        locationName: z.string().min(2).max(120),
        street: z.string().max(160).optional(),
        postalCode: z.string().max(20).optional(),
        city: z.string().max(80).optional(),
        phone: z.string().max(40).optional(),
        website: z.string().max(200).optional(),
        planCode: z.enum(["bas", "tillvaxt", "premium"]),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));

    let orgId = data.organizationId ?? null;
    if (!orgId) {
      if (!data.organizationName) throw new Error("Ange ett kundnamn.");
      const { data: org, error } = await ctx.supabase
        .from("organizations")
        .insert({ name: data.organizationName, contact_email: data.contactEmail ?? null })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      orgId = org.id;
    }

    const { data: location, error: locError } = await ctx.supabase
      .from("locations")
      .insert({
        org_id: orgId,
        name: data.locationName,
        street: data.street ?? null,
        postal_code: data.postalCode ?? null,
        city: data.city ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        plan_code: data.planCode,
        status: "onboarding",
      })
      .select("id")
      .single();
    if (locError) throw new Error(locError.message);

    const { data: templates } = await ctx.supabase.from("checklist_templates").select("key");
    if (templates?.length) {
      await ctx.supabase.from("checklist_items").insert(
        templates.map((t: { key: string }) => ({
          location_id: location.id,
          template_key: t.key,
          status: "todo",
        })),
      );
    }

    await writeAudit(ctx, {
      action: "onboarding.create_location",
      entity: "locations",
      entityId: location.id,
      orgId,
      meta: { plan: data.planCode },
    });

    return { organizationId: orgId, locationId: location.id };
  });

/* -------------------------------- Recensioner ------------------------------- */

export const getReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const access = await loadAccess(ctx);
    const [{ data: responses }, { data: reviews }, { data: locations }] = await Promise.all([
      ctx.supabase.from("review_responses").select("*").order("created_at", { ascending: false }),
      ctx.supabase.from("reviews").select("*").order("review_date", { ascending: false }),
      ctx.supabase.from("locations").select("id, name, city, phone"),
    ]);
    return {
      access,
      responses: responses ?? [],
      reviews: reviews ?? [],
      locations: locations ?? [],
    };
  });

export const decideReviewResponse = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: uuid, decision: z.enum(["approve", "reject"]) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));
    const { data: current } = await ctx.supabase
      .from("review_responses")
      .select("id, status, location_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!current) throw new Error("Svaret hittades inte.");
    const target = nextStatus(current.status as ApprovalStatus, data.decision);
    const { error } = await ctx.supabase
      .from("review_responses")
      .update({
        status: target,
        approved_by: ctx.userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(ctx, {
      action: `review_response.${data.decision}`,
      entity: "review_responses",
      entityId: data.id,
      meta: { status: target },
    });
    return { status: target };
  });

/** Publicering är alltid spärrad tills en riktig leverantör är konfigurerad. */
export const publishReviewResponse = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: uuid }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));
    const { data: response } = await ctx.supabase
      .from("review_responses")
      .select("id, status, location_id, draft_text, review_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!response) throw new Error("Svaret hittades inte.");
    if (response.status !== "approved") {
      throw new Error("Svaret måste godkännas innan det kan publiceras.");
    }
    const { data: location } = await ctx.supabase
      .from("locations")
      .select("id, name, city, phone")
      .eq("id", response.location_id)
      .maybeSingle();
    const { data: review } = await ctx.supabase
      .from("reviews")
      .select("external_id")
      .eq("id", response.review_id)
      .maybeSingle();

    const provider = resolveGbpProvider(productEnv as Record<string, string | undefined>);
    const result = await provider.publishReviewReply(
      location ?? { id: response.location_id, name: "", city: null, phone: null },
      review?.external_id ?? "",
      response.draft_text,
    );

    if (!result.ok) {
      await ctx.supabase.from("review_responses").update({ publish_error: result.message }).eq("id", data.id);
      await writeAudit(ctx, {
        action: "review_response.publish_blocked",
        entity: "review_responses",
        entityId: data.id,
        meta: { provider: provider.info.key, message: result.message },
      });
      return { published: false, message: result.message, provider: provider.info };
    }

    await ctx.supabase
      .from("review_responses")
      .update({ status: "published", published_at: result.data.publishedAt, publish_error: null })
      .eq("id", data.id);
    await writeAudit(ctx, {
      action: "review_response.published",
      entity: "review_responses",
      entityId: data.id,
      meta: { provider: provider.info.key },
    });
    return { published: true, message: "Svaret publicerades.", provider: provider.info };
  });

/* ------------------------- Rankning, citeringar, m.m. ----------------------- */

export const getLocalDataOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const [
      { data: locations },
      { data: keywords },
      { data: ranks },
      { data: citations },
      { data: competitors },
      { data: aiv },
    ] = await Promise.all([
      ctx.supabase.from("locations").select("*").order("name"),
      ctx.supabase.from("keywords").select("*"),
      ctx.supabase.from("rank_snapshots").select("*").order("captured_at", { ascending: false }),
      ctx.supabase.from("citations").select("*"),
      ctx.supabase.from("competitors").select("*"),
      ctx.supabase.from("ai_visibility_snapshots").select("*").order("captured_at", { ascending: false }),
    ]);
    const env = productEnv as Record<string, string | undefined>;
    return {
      locations: locations ?? [],
      keywords: keywords ?? [],
      ranks: ranks ?? [],
      citations: citations ?? [],
      competitors: competitors ?? [],
      aiVisibility: aiv ?? [],
      providers: {
        localData: resolveLocalDataProvider(env).info,
        gbp: resolveGbpProvider(env).info,
        auroraSight: resolveAuroraSightProvider(env).info,
      },
    };
  });

/* --------------------------------- Åtgärder -------------------------------- */

export const updateActionStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["open", "in_progress", "waiting_client", "done"]),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));
    const { error } = await ctx.supabase.from("actions").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(ctx, {
      action: "action.update_status",
      entity: "actions",
      entityId: data.id,
      meta: { status: data.status },
    });
    return { ok: true };
  });

/* --------------------------------- Rapporter -------------------------------- */

export const getReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const [{ data: reports }, { data: locations }, { data: orgs }] = await Promise.all([
      ctx.supabase.from("reports").select("*").order("period_month", { ascending: false }),
      ctx.supabase.from("locations").select("id, name"),
      ctx.supabase.from("organizations").select("id, name"),
    ]);
    return { reports: reports ?? [], locations: locations ?? [], organizations: orgs ?? [] };
  });

export const generateMonthlyReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ locationId: uuid }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    requireStaff(await loadAccess(ctx));
    const { data: location } = await ctx.supabase
      .from("locations")
      .select("id, org_id, name, is_demo")
      .eq("id", data.locationId)
      .maybeSingle();
    if (!location) throw new Error("Platsen hittades inte.");

    const [{ data: ranks }, { data: reviews }, { data: actions }] = await Promise.all([
      ctx.supabase.from("rank_snapshots").select("position, is_demo").eq("location_id", data.locationId),
      ctx.supabase.from("reviews").select("rating").eq("location_id", data.locationId),
      ctx.supabase.from("actions").select("status").eq("location_id", data.locationId),
    ]);

    const positions = (ranks ?? []).map((r) => r.position).filter((p: number | null) => p != null);
    const ratings = (reviews ?? []).map((r) => r.rating as number);
    const metrics = {
      snittposition: positions.length
        ? Number((positions.reduce((a: number, b: number) => a + b, 0) / positions.length).toFixed(1))
        : null,
      recensioner: ratings.length,
      snittbetyg: ratings.length
        ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
        : null,
      atgarder_klara: (actions ?? []).filter((a) => a.status === "done").length,
      innehaller_demodata: (ranks ?? []).some((r) => r.is_demo) || location.is_demo,
    };

    const period = new Date();
    period.setDate(1);
    const { data: report, error } = await ctx.supabase
      .from("reports")
      .insert({
        org_id: location.org_id,
        location_id: location.id,
        period_month: period.toISOString().slice(0, 10),
        summary: metrics.innehaller_demodata
          ? "DEMO: rapporten bygger helt eller delvis på simulerad data."
          : "Rapport genererad från insamlad data.",
        metrics,
        status: "draft",
        is_demo: Boolean(metrics.innehaller_demodata),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await writeAudit(ctx, {
      action: "report.generate",
      entity: "reports",
      entityId: report.id,
      orgId: location.org_id,
      meta: metrics,
    });
    return { reportId: report.id, metrics };
  });

/* --------------------- Integrationer, kostnader, revision -------------------- */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const access = await loadAccess(ctx);
    requireStaff(access);
    const env = productEnv as Record<string, string | undefined>;
    const [{ data: integrations }, { data: usage }] = await Promise.all([
      ctx.supabase.from("integration_settings").select("*").order("kind"),
      ctx.supabase.from("usage_costs").select("*").order("period_month", { ascending: false }),
    ]);
    return {
      access,
      integrations: integrations ?? [],
      usage: usage ?? [],
      resolved: {
        localData: resolveLocalDataProvider(env).info,
        gbp: resolveGbpProvider(env).info,
        auroraSight: resolveAuroraSightProvider(env).info,
        demoMode: env["AURORA_DEMO_MODE"] === "true",
      },
    };
  });

export const updateUsageCap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: uuid, cap: z.number().min(0).max(1000000) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const access = await loadAccess(ctx);
    if (!access.isAdmin) throw new Error("Endast Aurora-admin kan ändra kostnadstak.");
    const { error } = await ctx.supabase.from("usage_costs").update({ monthly_cap_sek: data.cap }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(ctx, {
      action: "usage.update_cap",
      entity: "usage_costs",
      entityId: data.id,
      meta: { cap: data.cap },
    });
    return { ok: true };
  });

export const getAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const { data } = await ctx.supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return { entries: data ?? [] };
  });
