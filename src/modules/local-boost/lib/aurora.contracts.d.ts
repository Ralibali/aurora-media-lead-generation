// Generated from the original server handlers; types only, never runtime code.
import { type ApprovalStatus } from "./approval";
export declare const getMe: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    profile: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
    roles: string[];
    isAdmin: boolean;
    isStaff: boolean;
    orgIds: string[];
    userId: string;
}>;
/** Bootstrap kräver en uttryckligen konfigurerad användaridentitet på servern. */
export declare const claimFirstAdmin: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    granted: boolean;
    message: string;
}>;
export declare const getOverview: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    access: {
        roles: string[];
        isAdmin: boolean;
        isStaff: boolean;
        orgIds: string[];
    };
    plans: {
        code: string;
        description: string;
        monthly_price_sek: number;
        name: string;
        onboarding_fee_sek: number;
        sort_order: number;
    }[];
    locations: {
        city: string | null;
        created_at: string;
        gbp_place_id: string | null;
        health_score: number;
        id: string;
        is_demo: boolean;
        lat: number | null;
        lng: number | null;
        name: string;
        org_id: string;
        phone: string | null;
        plan_code: string | null;
        postal_code: string | null;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["location_status"];
        street: string | null;
        website: string | null;
    }[];
    organizations: {
        contact_email: string | null;
        created_at: string;
        id: string;
        is_demo: boolean;
        name: string;
        org_number: string | null;
    }[];
    actions: {
        created_at: string;
        description: string | null;
        due_date: string | null;
        id: string;
        is_demo: boolean;
        location_id: string | null;
        org_id: string;
        owner: string;
        priority: number;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["action_status"];
        title: string;
    }[];
    pendingApprovals: {
        id: string;
        status: "draft" | "pending" | "approved" | "rejected" | "published";
        location_id: string;
        draft_text: string;
        created_at: string;
    }[];
}>;
export declare const getLocationDetail: (options?: {
    data?: {
        id: string;
    } | undefined;
} | undefined) => Promise<{
    location: {
        city: string | null;
        created_at: string;
        gbp_place_id: string | null;
        health_score: number;
        id: string;
        is_demo: boolean;
        lat: number | null;
        lng: number | null;
        name: string;
        org_id: string;
        phone: string | null;
        plan_code: string | null;
        postal_code: string | null;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["location_status"];
        street: string | null;
        website: string | null;
    };
    health: number;
    templates: {
        category: string;
        help_text: string | null;
        key: string;
        sort_order: number;
        title: string;
        weight: number;
    }[];
    checklist: {
        id: string;
        is_demo: boolean;
        location_id: string;
        note: string | null;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["checklist_status"];
        template_key: string;
        updated_at: string;
    }[];
    reviews: {
        author_name: string | null;
        body: string | null;
        created_at: string;
        external_id: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        rating: number;
        review_date: string;
        source: string;
    }[];
    responses: {
        approved_at: string | null;
        approved_by: string | null;
        created_at: string;
        created_by: string | null;
        draft_text: string;
        id: string;
        is_demo: boolean;
        location_id: string;
        publish_error: string | null;
        published_at: string | null;
        review_id: string;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["approval_status"];
    }[];
    keywords: {
        created_at: string;
        geo: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        phrase: string;
    }[];
    ranks: {
        captured_at: string;
        id: string;
        is_demo: boolean;
        keyword_id: string;
        local_pack_position: number | null;
        location_id: string;
        position: number | null;
        provider_key: string;
    }[];
    citations: {
        checked_at: string | null;
        directory: string;
        found_address: string | null;
        found_name: string | null;
        found_phone: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["nap_status"];
        url: string | null;
    }[];
    competitors: {
        created_at: string;
        gbp_rating: number | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        name: string;
        notes: string | null;
        review_count: number | null;
    }[];
    aiVisibility: {
        captured_at: string;
        engine: string;
        id: string;
        is_demo: boolean;
        location_id: string;
        mentioned: boolean;
        prompt: string;
        provider_key: string;
        rank_in_answer: number | null;
    }[];
    actions: {
        created_at: string;
        description: string | null;
        due_date: string | null;
        id: string;
        is_demo: boolean;
        location_id: string | null;
        org_id: string;
        owner: string;
        priority: number;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["action_status"];
        title: string;
    }[];
}>;
export declare const updateChecklistItem: (options?: {
    data?: {
        id: string;
        status: "in_progress" | "done" | "todo" | "blocked" | "not_applicable";
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
    locationId: string | null;
}>;
export declare const createOnboarding: (options?: {
    data?: {
        locationName: string;
        planCode: "bas" | "tillvaxt" | "premium";
        city?: string | undefined;
        phone?: string | undefined;
        street?: string | undefined;
        website?: string | undefined;
        organizationId?: string | undefined;
        organizationName?: string | undefined;
        contactEmail?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
} | undefined) => Promise<{
    organizationId: string;
    locationId: string;
}>;
export declare const getReviewQueue: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    access: {
        roles: string[];
        isAdmin: boolean;
        isStaff: boolean;
        orgIds: string[];
    };
    responses: {
        approved_at: string | null;
        approved_by: string | null;
        created_at: string;
        created_by: string | null;
        draft_text: string;
        id: string;
        is_demo: boolean;
        location_id: string;
        publish_error: string | null;
        published_at: string | null;
        review_id: string;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["approval_status"];
    }[];
    reviews: {
        author_name: string | null;
        body: string | null;
        created_at: string;
        external_id: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        rating: number;
        review_date: string;
        source: string;
    }[];
    locations: {
        id: string;
        name: string;
        city: string | null;
        phone: string | null;
    }[];
}>;
export declare const decideReviewResponse: (options?: {
    data?: {
        id: string;
        decision: "approve" | "reject";
    } | undefined;
} | undefined) => Promise<{
    status: ApprovalStatus;
}>;
/** Publicering är alltid spärrad tills en riktig leverantör är konfigurerad. */
export declare const publishReviewResponse: (options?: {
    data?: {
        id: string;
    } | undefined;
} | undefined) => Promise<{
    published: boolean;
    message: string;
    provider: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
}>;
export declare const getLocalDataOverview: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    locations: {
        city: string | null;
        created_at: string;
        gbp_place_id: string | null;
        health_score: number;
        id: string;
        is_demo: boolean;
        lat: number | null;
        lng: number | null;
        name: string;
        org_id: string;
        phone: string | null;
        plan_code: string | null;
        postal_code: string | null;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["location_status"];
        street: string | null;
        website: string | null;
    }[];
    keywords: {
        created_at: string;
        geo: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        phrase: string;
    }[];
    ranks: {
        captured_at: string;
        id: string;
        is_demo: boolean;
        keyword_id: string;
        local_pack_position: number | null;
        location_id: string;
        position: number | null;
        provider_key: string;
    }[];
    citations: {
        checked_at: string | null;
        directory: string;
        found_address: string | null;
        found_name: string | null;
        found_phone: string | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["nap_status"];
        url: string | null;
    }[];
    competitors: {
        created_at: string;
        gbp_rating: number | null;
        id: string;
        is_demo: boolean;
        location_id: string;
        name: string;
        notes: string | null;
        review_count: number | null;
    }[];
    aiVisibility: {
        captured_at: string;
        engine: string;
        id: string;
        is_demo: boolean;
        location_id: string;
        mentioned: boolean;
        prompt: string;
        provider_key: string;
        rank_in_answer: number | null;
    }[];
    providers: {
        localData: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
        gbp: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
        auroraSight: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
    };
}>;
export declare const updateActionStatus: (options?: {
    data?: {
        id: string;
        status: "open" | "in_progress" | "waiting_client" | "done";
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const getReports: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    reports: {
        created_at: string;
        id: string;
        is_demo: boolean;
        location_id: string | null;
        metrics: import("@/modules/local-boost/integrations/supabase/types").Json;
        org_id: string;
        period_month: string;
        status: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["approval_status"];
        summary: string | null;
    }[];
    locations: {
        id: string;
        name: string;
    }[];
    organizations: {
        id: string;
        name: string;
    }[];
}>;
export declare const generateMonthlyReport: (options?: {
    data?: {
        locationId: string;
    } | undefined;
} | undefined) => Promise<{
    reportId: string;
    metrics: {
        snittposition: number | null;
        recensioner: number;
        snittbetyg: number | null;
        atgarder_klara: number;
        innehaller_demodata: boolean;
    };
}>;
export declare const getSettings: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    access: {
        roles: string[];
        isAdmin: boolean;
        isStaff: boolean;
        orgIds: string[];
    };
    integrations: {
        kind: string;
        mode: import("@/modules/local-boost/integrations/supabase/types").Database["public"]["Enums"]["provider_mode"];
        notes: string | null;
        provider_key: string;
        provider_name: string;
        updated_at: string;
    }[];
    usage: {
        cost_sek: number;
        id: string;
        is_demo: boolean;
        monthly_cap_sek: number;
        period_month: string;
        provider_key: string;
        units: number;
    }[];
    resolved: {
        localData: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
        gbp: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
        auroraSight: import("@/modules/local-boost/lib/providers/types").ProviderInfo;
        demoMode: boolean;
    };
}>;
export declare const updateUsageCap: (options?: {
    data?: {
        id: string;
        cap: number;
    } | undefined;
} | undefined) => Promise<{
    ok: boolean;
}>;
export declare const getAuditLog: (options?: {
    data?: undefined;
} | undefined) => Promise<{
    entries: {
        action: string;
        actor_id: string | null;
        created_at: string;
        entity: string | null;
        entity_id: string | null;
        id: string;
        meta: import("@/modules/local-boost/integrations/supabase/types").Json;
        org_id: string | null;
    }[];
}>;
