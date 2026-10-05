// Generated from the original server handlers; types only, never runtime code.
export declare const getMe: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    userId: string;
    profile: {
        created_at: string;
        email: string | null;
        full_name: string | null;
        id: string;
    } | null;
    roles: string[];
    isStaff: boolean;
    isAdmin: boolean;
    memberships: {
        org_id: string;
        is_owner: boolean;
        organizations: {
            id: string;
            name: string;
            vertical: "trafikskola" | "hospitality" | "hantverk" | "bilverkstad" | "salong" | "klinik";
        };
    }[];
}>;
/** Endast serverns uttryckligen tillåtna användare kan bli första Aurora-administratören. */
export declare const claimFirstAdmin: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    granted: boolean;
    reason: string;
}>;
export declare const getOverview: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    organizations: {
        id: string;
        name: string;
        vertical: "trafikskola" | "hospitality" | "hantverk" | "bilverkstad" | "salong" | "klinik";
        status: "paused" | "prospect" | "onboarding" | "active" | "churned";
        demo_mode: boolean;
        created_at: string;
    }[];
    agents: {
        id: string;
        org_id: string;
        status: "draft" | "testing" | "live" | "paused";
        provider: string;
    }[];
    calls: {
        id: string;
        org_id: string;
        outcome: "answered" | "qualified_lead" | "booked" | "transferred" | "voicemail" | "abandoned" | "failed" | "unknown";
        duration_seconds: number;
        cost_sek: number;
        is_demo: boolean;
        started_at: string;
    }[];
    leads: {
        id: string;
        org_id: string;
        status: "booked" | "new" | "qualified" | "contacted" | "won" | "lost";
        is_demo: boolean;
    }[];
    usage: {
        org_id: string;
        cost_sek: number;
        is_demo: boolean;
        occurred_at: string;
    }[];
    subscriptions: {
        org_id: string;
        status: string;
        mrr_sek: number;
    }[];
    voiceTests: {
        scenario_key: string;
        status: "failed" | "planned" | "running" | "passed" | "blocked";
        is_real_call: boolean;
    }[];
}>;
export declare const listOrganizations: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    city: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    created_by: string | null;
    demo_mode: boolean;
    id: string;
    name: string;
    notes: string | null;
    onboarding_step: number;
    org_number: string | null;
    status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["org_status"];
    updated_at: string;
    vertical: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["vertical"];
    website_url: string | null;
}[]>;
export declare const listTemplates: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    description: string | null;
    id: string;
    key: string;
    name: string;
    payload: import("@/modules/connect/integrations/supabase/types").Json;
    vertical: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["vertical"];
}[]>;
export declare const listPlans: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    features: import("@/modules/connect/integrations/supabase/types").Json;
    id: string;
    included_minutes: number;
    is_active: boolean;
    key: string;
    monthly_fee_sek: number;
    name: string;
    overage_sek_per_minute: number;
    position: number;
    setup_fee_sek: number;
}[]>;
export declare const onboardOrganization: (options?: {
    data?: {
        vertical: "trafikskola" | "hospitality";
        name: string;
        templateKey: string;
        planKey: string;
        monthlyBudgetSek: number;
        city?: string | null | undefined;
        orgNumber?: string | null | undefined;
        contactEmail?: string | null | undefined;
        contactPhone?: string | null | undefined;
        fallbackNumber?: string | null | undefined;
    } | undefined;
} | undefined) => Promise<{
    orgId: string;
    agentId: string;
}>;
export declare const getOrganization: (options?: {
    data?: {
        orgId: string;
    } | undefined;
} | undefined) => Promise<{
    organization: {
        city: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        created_at: string;
        created_by: string | null;
        demo_mode: boolean;
        id: string;
        name: string;
        notes: string | null;
        onboarding_step: number;
        org_number: string | null;
        status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["org_status"];
        updated_at: string;
        vertical: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["vertical"];
        website_url: string | null;
    };
    agents: {
        consent_required: boolean;
        created_at: string;
        disclosure_text: string;
        fallback_number: string | null;
        greeting: string | null;
        id: string;
        language: string;
        max_call_seconds: number;
        name: string;
        org_id: string;
        persona: string | null;
        provider: string;
        provider_agent_id: string | null;
        status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["agent_status"];
        updated_at: string;
        vertical: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["vertical"];
    }[];
    openingHours: {
        closed: boolean;
        closes: string | null;
        id: string;
        opens: string | null;
        org_id: string;
        weekday: number;
    }[];
    knowledge: {
        agent_id: string | null;
        answer: string;
        created_at: string;
        id: string;
        is_active: boolean;
        org_id: string;
        question: string;
        source: string | null;
        tags: string[];
    }[];
    questions: {
        agent_id: string;
        field_key: string;
        id: string;
        org_id: string;
        position: number;
        question: string;
        required: boolean;
    }[];
    handoff: {
        action: string;
        agent_id: string;
        condition_key: string;
        description: string;
        id: string;
        is_active: boolean;
        org_id: string;
        position: number;
        requires_approval: boolean;
        target: string | null;
    }[];
    integrations: {
        config: import("@/modules/connect/integrations/supabase/types").Json;
        created_at: string;
        id: string;
        kind: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["integration_kind"];
        last_checked_at: string | null;
        last_error: string | null;
        org_id: string;
        provider: string;
        requires_approval: boolean;
        status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["integration_status"];
    }[];
    guardrails: {
        alert_threshold_pct: number;
        hard_cap_sek: number | null;
        hard_stop: boolean;
        id: string;
        included_minutes: number;
        monthly_budget_sek: number;
        org_id: string;
        updated_at: string;
    } | null;
    subscriptions: {
        created_at: string;
        ended_at: string | null;
        id: string;
        mrr_sek: number;
        org_id: string;
        plan_id: string;
        setup_invoiced: boolean;
        started_at: string;
        status: string;
        plans: {
            features: import("@/modules/connect/integrations/supabase/types").Json;
            id: string;
            included_minutes: number;
            is_active: boolean;
            key: string;
            monthly_fee_sek: number;
            name: string;
            overage_sek_per_minute: number;
            position: number;
            setup_fee_sek: number;
        };
    }[];
    voiceTests: {
        agent_id: string | null;
        created_at: string;
        executed_at: string | null;
        executed_by: string | null;
        id: string;
        is_real_call: boolean;
        metrics: import("@/modules/connect/integrations/supabase/types").Json;
        notes: string | null;
        org_id: string | null;
        scenario_key: string;
        status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["voice_test_status"];
        verdict: string | null;
    }[];
}>;
export declare const updateAgent: (options?: {
    data?: {
        agentId: string;
        patch: {
            consent_required?: boolean | undefined;
            disclosure_text?: string | undefined;
            fallback_number?: string | null | undefined;
            greeting?: string | null | undefined;
            max_call_seconds?: number | undefined;
            name?: string | undefined;
            persona?: string | null | undefined;
            status?: "draft" | "testing" | "live" | "paused" | undefined;
        };
    } | undefined;
} | undefined) => Promise<{
    consent_required: boolean;
    created_at: string;
    disclosure_text: string;
    fallback_number: string | null;
    greeting: string | null;
    id: string;
    language: string;
    max_call_seconds: number;
    name: string;
    org_id: string;
    persona: string | null;
    provider: string;
    provider_agent_id: string | null;
    status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["agent_status"];
    updated_at: string;
    vertical: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["vertical"];
}>;
export declare const saveKnowledgeItem: (options?: {
    data?: {
        answer: string;
        question: string;
        orgId: string;
        isActive: boolean;
        id?: string | undefined;
        agentId?: string | null | undefined;
    } | undefined;
} | undefined) => Promise<{
    agent_id: string | null;
    answer: string;
    created_at: string;
    id: string;
    is_active: boolean;
    org_id: string;
    question: string;
    source: string | null;
    tags: string[];
}>;
export declare const deleteKnowledgeItem: (options?: {
    data?: {
        id: string;
        orgId: string;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const saveOpeningHours: (options?: {
    data?: {
        orgId: string;
        hours: {
            closed: boolean;
            closes: string | null;
            opens: string | null;
            weekday: number;
        }[];
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const saveGuardrails: (options?: {
    data?: {
        monthlyBudgetSek: number;
        orgId: string;
        alertThresholdPct: number;
        hardStop: boolean;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const saveIntegration: (options?: {
    data?: {
        id: string;
        provider: string;
        status: "not_configured" | "configured" | "healthy" | "degraded" | "failing";
        orgId: string;
        requiresApproval: boolean;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const listCalls: (options?: {
    data?: {
        orgId?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    agent_id: string | null;
    avg_latency_ms: number | null;
    cost_sek: number;
    created_at: string;
    direction: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["call_direction"];
    duration_seconds: number;
    ended_at: string | null;
    external_id: string | null;
    from_number: string | null;
    id: string;
    is_demo: boolean;
    language: string;
    org_id: string;
    outcome: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["call_outcome"];
    provider: string;
    started_at: string;
    summary: string | null;
    to_number: string | null;
    transferred_to: string | null;
    organizations: {
        name: string;
    };
    agents: {
        name: string;
    } | null;
}[]>;
export declare const getCall: (options?: {
    data?: {
        callId: string;
    } | undefined;
} | undefined) => Promise<{
    call: {
        agent_id: string | null;
        avg_latency_ms: number | null;
        cost_sek: number;
        created_at: string;
        direction: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["call_direction"];
        duration_seconds: number;
        ended_at: string | null;
        external_id: string | null;
        from_number: string | null;
        id: string;
        is_demo: boolean;
        language: string;
        org_id: string;
        outcome: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["call_outcome"];
        provider: string;
        started_at: string;
        summary: string | null;
        to_number: string | null;
        transferred_to: string | null;
        organizations: {
            name: string;
        };
        agents: {
            name: string;
        } | null;
    };
    messages: {
        call_id: string;
        confidence: number | null;
        content: string;
        id: string;
        is_demo: boolean;
        offset_ms: number | null;
        org_id: string;
        position: number;
        speaker: string;
    }[];
    scorecards: {
        call_id: string;
        created_at: string;
        criteria: import("@/modules/connect/integrations/supabase/types").Json;
        id: string;
        max_score: number;
        notes: string | null;
        org_id: string;
        reviewer_id: string | null;
        total_score: number;
    }[];
    lead: {
        answers: import("@/modules/connect/integrations/supabase/types").Json;
        call_id: string | null;
        created_at: string;
        delivered_at: string | null;
        email: string | null;
        follow_up_required: boolean;
        id: string;
        intent: string | null;
        is_demo: boolean;
        name: string | null;
        notes: string | null;
        org_id: string;
        phone: string | null;
        score: number;
        sla_due_at: string | null;
        status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["lead_status"];
        updated_at: string;
    } | null;
}>;
export declare const listLeads: (options?: {
    data?: {
        orgId?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    answers: import("@/modules/connect/integrations/supabase/types").Json;
    call_id: string | null;
    created_at: string;
    delivered_at: string | null;
    email: string | null;
    follow_up_required: boolean;
    id: string;
    intent: string | null;
    is_demo: boolean;
    name: string | null;
    notes: string | null;
    org_id: string;
    phone: string | null;
    score: number;
    sla_due_at: string | null;
    status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["lead_status"];
    updated_at: string;
    organizations: {
        name: string;
    };
}[]>;
export declare const updateLeadStatus: (options?: {
    data?: {
        status: "booked" | "new" | "qualified" | "contacted" | "won" | "lost";
        orgId: string;
        leadId: string;
        notes?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const QA_CRITERIA: readonly [{
    readonly key: "greeting";
    readonly label: "Hälsning och AI-information";
}, {
    readonly key: "understanding";
    readonly label: "Uppfattade uppringaren korrekt";
}, {
    readonly key: "accuracy";
    readonly label: "Korrekta svar utan påhitt";
}, {
    readonly key: "qualification";
    readonly label: "Ställde kvalificeringsfrågorna";
}, {
    readonly key: "next_step";
    readonly label: "Tydligt nästa steg eller överkoppling";
}];
export declare const saveScorecard: (options?: {
    data?: {
        orgId: string;
        callId: string;
        scores: Record<string, number>;
        notes?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
    total: number;
}>;
export declare const getUsage: (options?: {
    data?: {
        orgId?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    usage: {
        call_id: string | null;
        cost_sek: number;
        id: string;
        is_demo: boolean;
        kind: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["usage_kind"];
        occurred_at: string;
        org_id: string;
        provider: string;
        unit: string;
        units: number;
        organizations: {
            name: string;
        };
    }[];
    guardrails: {
        alert_threshold_pct: number;
        hard_cap_sek: number | null;
        hard_stop: boolean;
        id: string;
        included_minutes: number;
        monthly_budget_sek: number;
        org_id: string;
        updated_at: string;
        organizations: {
            name: string;
        };
    }[];
}>;
export declare const listAudit: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    action: string;
    actor_id: string | null;
    created_at: string;
    entity: string | null;
    entity_id: string | null;
    id: string;
    meta: import("@/modules/connect/integrations/supabase/types").Json;
    org_id: string | null;
    organizations: {
        name: string;
    } | null;
}[]>;
export declare const getProviderHealth: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    health: import("@/modules/connect/lib/voice/types").ProviderHealth;
    capabilities: import("@/modules/connect/lib/voice/types").ProviderCapabilities;
}>;
export declare const listVoiceTests: (options?: {
    data?: {
        orgId?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    agent_id: string | null;
    created_at: string;
    executed_at: string | null;
    executed_by: string | null;
    id: string;
    is_real_call: boolean;
    metrics: import("@/modules/connect/integrations/supabase/types").Json;
    notes: string | null;
    org_id: string | null;
    scenario_key: string;
    status: import("@/modules/connect/integrations/supabase/types").Database["public"]["Enums"]["voice_test_status"];
    verdict: string | null;
    organizations: {
        name: string;
    } | null;
}[]>;
export declare const recordVoiceTest: (options?: {
    data?: {
        status: "failed" | "planned" | "running" | "passed" | "blocked";
        metrics: Record<string, string | number | boolean>;
        orgId: string;
        runId: string;
        isRealCall: boolean;
        notes?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const generateDemoActivity: (options?: {
    data?: {
        orgId: string;
    } | undefined;
} | undefined) => Promise<{
    created: number;
}>;
export declare const setDemoMode: (options?: {
    data?: {
        orgId: string;
        demoMode: boolean;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const deployAgentToProvider: (options?: {
    data?: {
        agentId: string;
        confirm: true;
    } | undefined;
} | undefined) => Promise<import("@/modules/connect/lib/voice/types").DeploymentResult>;
