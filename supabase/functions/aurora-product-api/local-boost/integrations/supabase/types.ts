export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_demo: boolean
          location_id: string | null
          org_id: string
          owner: string
          priority: number
          status: Database["public"]["Enums"]["action_status"]
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          location_id?: string | null
          org_id: string
          owner?: string
          priority?: number
          status?: Database["public"]["Enums"]["action_status"]
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          location_id?: string | null
          org_id?: string
          owner?: string
          priority?: number
          status?: Database["public"]["Enums"]["action_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_visibility_snapshots: {
        Row: {
          captured_at: string
          engine: string
          id: string
          is_demo: boolean
          location_id: string
          mentioned: boolean
          prompt: string
          provider_key: string
          rank_in_answer: number | null
        }
        Insert: {
          captured_at?: string
          engine: string
          id?: string
          is_demo?: boolean
          location_id: string
          mentioned?: boolean
          prompt: string
          provider_key?: string
          rank_in_answer?: number | null
        }
        Update: {
          captured_at?: string
          engine?: string
          id?: string
          is_demo?: boolean
          location_id?: string
          mentioned?: boolean
          prompt?: string
          provider_key?: string
          rank_in_answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_visibility_snapshots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json
          org_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
          org_id?: string | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          id: string
          is_demo: boolean
          location_id: string
          note: string | null
          status: Database["public"]["Enums"]["checklist_status"]
          template_key: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_demo?: boolean
          location_id: string
          note?: string | null
          status?: Database["public"]["Enums"]["checklist_status"]
          template_key: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_demo?: boolean
          location_id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["checklist_status"]
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["key"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          category: string
          help_text: string | null
          key: string
          sort_order: number
          title: string
          weight: number
        }
        Insert: {
          category: string
          help_text?: string | null
          key: string
          sort_order?: number
          title: string
          weight?: number
        }
        Update: {
          category?: string
          help_text?: string | null
          key?: string
          sort_order?: number
          title?: string
          weight?: number
        }
        Relationships: []
      }
      citations: {
        Row: {
          checked_at: string | null
          directory: string
          found_address: string | null
          found_name: string | null
          found_phone: string | null
          id: string
          is_demo: boolean
          location_id: string
          status: Database["public"]["Enums"]["nap_status"]
          url: string | null
        }
        Insert: {
          checked_at?: string | null
          directory: string
          found_address?: string | null
          found_name?: string | null
          found_phone?: string | null
          id?: string
          is_demo?: boolean
          location_id: string
          status?: Database["public"]["Enums"]["nap_status"]
          url?: string | null
        }
        Update: {
          checked_at?: string | null
          directory?: string
          found_address?: string | null
          found_name?: string | null
          found_phone?: string | null
          id?: string
          is_demo?: boolean
          location_id?: string
          status?: Database["public"]["Enums"]["nap_status"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string
          gbp_rating: number | null
          id: string
          is_demo: boolean
          location_id: string
          name: string
          notes: string | null
          review_count: number | null
        }
        Insert: {
          created_at?: string
          gbp_rating?: number | null
          id?: string
          is_demo?: boolean
          location_id: string
          name: string
          notes?: string | null
          review_count?: number | null
        }
        Update: {
          created_at?: string
          gbp_rating?: number | null
          id?: string
          is_demo?: boolean
          location_id?: string
          name?: string
          notes?: string | null
          review_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitors_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_scan_points: {
        Row: {
          col_idx: number
          created_at: string
          found: boolean
          id: string
          lat: number
          lng: number
          location_id: string
          rank: number | null
          row_idx: number
          scan_id: string
          top_results: Json
        }
        Insert: {
          col_idx: number
          created_at?: string
          found?: boolean
          id?: string
          lat: number
          lng: number
          location_id: string
          rank?: number | null
          row_idx: number
          scan_id: string
          top_results?: Json
        }
        Update: {
          col_idx?: number
          created_at?: string
          found?: boolean
          id?: string
          lat?: number
          lng?: number
          location_id?: string
          rank?: number | null
          row_idx?: number
          scan_id?: string
          top_results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "geo_scan_points_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_scan_points_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "geo_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_scan_schedules: {
        Row: {
          cadence: Database["public"]["Enums"]["scan_cadence"]
          created_at: string
          grid_size: number
          id: string
          is_active: boolean
          keyword_id: string | null
          keyword_phrase: string
          last_run_at: string | null
          location_id: string
          next_run_at: string | null
          radius_km: number
          updated_at: string
        }
        Insert: {
          cadence?: Database["public"]["Enums"]["scan_cadence"]
          created_at?: string
          grid_size?: number
          id?: string
          is_active?: boolean
          keyword_id?: string | null
          keyword_phrase: string
          last_run_at?: string | null
          location_id: string
          next_run_at?: string | null
          radius_km?: number
          updated_at?: string
        }
        Update: {
          cadence?: Database["public"]["Enums"]["scan_cadence"]
          created_at?: string
          grid_size?: number
          id?: string
          is_active?: boolean
          keyword_id?: string | null
          keyword_phrase?: string
          last_run_at?: string | null
          location_id?: string
          next_run_at?: string | null
          radius_km?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_scan_schedules_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_scan_schedules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_scans: {
        Row: {
          center_lat: number
          center_lng: number
          completed_at: string | null
          cost_estimate_sek: number | null
          created_at: string
          created_by: string | null
          error_message: string | null
          grid_size: number
          id: string
          is_demo: boolean
          keyword_id: string | null
          keyword_phrase: string
          location_id: string
          metrics: Json
          provider_key: string
          provider_mode: Database["public"]["Enums"]["provider_mode"]
          radius_km: number
          started_at: string | null
          status: Database["public"]["Enums"]["geo_scan_status"]
          updated_at: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          completed_at?: string | null
          cost_estimate_sek?: number | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          grid_size: number
          id?: string
          is_demo?: boolean
          keyword_id?: string | null
          keyword_phrase: string
          location_id: string
          metrics?: Json
          provider_key?: string
          provider_mode?: Database["public"]["Enums"]["provider_mode"]
          radius_km: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["geo_scan_status"]
          updated_at?: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          completed_at?: string | null
          cost_estimate_sek?: number | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          grid_size?: number
          id?: string
          is_demo?: boolean
          keyword_id?: string | null
          keyword_phrase?: string
          location_id?: string
          metrics?: Json
          provider_key?: string
          provider_mode?: Database["public"]["Enums"]["provider_mode"]
          radius_km?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["geo_scan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_scans_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_scans_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          kind: string
          mode: Database["public"]["Enums"]["provider_mode"]
          notes: string | null
          provider_key: string
          provider_name: string
          updated_at: string
        }
        Insert: {
          kind: string
          mode?: Database["public"]["Enums"]["provider_mode"]
          notes?: string | null
          provider_key: string
          provider_name: string
          updated_at?: string
        }
        Update: {
          kind?: string
          mode?: Database["public"]["Enums"]["provider_mode"]
          notes?: string | null
          provider_key?: string
          provider_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          created_at: string
          geo: string | null
          id: string
          is_demo: boolean
          location_id: string
          phrase: string
        }
        Insert: {
          created_at?: string
          geo?: string | null
          id?: string
          is_demo?: boolean
          location_id: string
          phrase: string
        }
        Update: {
          created_at?: string
          geo?: string | null
          id?: string
          is_demo?: boolean
          location_id?: string
          phrase?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string | null
          created_at: string
          gbp_place_id: string | null
          health_score: number
          id: string
          is_demo: boolean
          lat: number | null
          lng: number | null
          name: string
          org_id: string
          phone: string | null
          plan_code: string | null
          postal_code: string | null
          status: Database["public"]["Enums"]["location_status"]
          street: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          gbp_place_id?: string | null
          health_score?: number
          id?: string
          is_demo?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          org_id: string
          phone?: string | null
          plan_code?: string | null
          postal_code?: string | null
          status?: Database["public"]["Enums"]["location_status"]
          street?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          gbp_place_id?: string | null
          health_score?: number
          id?: string
          is_demo?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          org_id?: string
          phone?: string | null
          plan_code?: string | null
          postal_code?: string | null
          status?: Database["public"]["Enums"]["location_status"]
          street?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          is_demo: boolean
          name: string
          org_number: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          org_number?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          org_number?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          description: string
          monthly_price_sek: number
          name: string
          onboarding_fee_sek: number
          sort_order: number
        }
        Insert: {
          code: string
          description: string
          monthly_price_sek: number
          name: string
          onboarding_fee_sek?: number
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string
          monthly_price_sek?: number
          name?: string
          onboarding_fee_sek?: number
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      rank_snapshots: {
        Row: {
          captured_at: string
          id: string
          is_demo: boolean
          keyword_id: string
          local_pack_position: number | null
          location_id: string
          position: number | null
          provider_key: string
        }
        Insert: {
          captured_at?: string
          id?: string
          is_demo?: boolean
          keyword_id: string
          local_pack_position?: number | null
          location_id: string
          position?: number | null
          provider_key?: string
        }
        Update: {
          captured_at?: string
          id?: string
          is_demo?: boolean
          keyword_id?: string
          local_pack_position?: number | null
          location_id?: string
          position?: number | null
          provider_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_snapshots_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_snapshots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          location_id: string | null
          metrics: Json
          org_id: string
          period_month: string
          status: Database["public"]["Enums"]["approval_status"]
          summary: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location_id?: string | null
          metrics?: Json
          org_id: string
          period_month: string
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location_id?: string | null
          metrics?: Json
          org_id?: string
          period_month?: string
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          draft_text: string
          id: string
          is_demo: boolean
          location_id: string
          publish_error: string | null
          published_at: string | null
          review_id: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          draft_text: string
          id?: string
          is_demo?: boolean
          location_id: string
          publish_error?: string | null
          published_at?: string | null
          review_id: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          draft_text?: string
          id?: string
          is_demo?: boolean
          location_id?: string
          publish_error?: string | null
          published_at?: string | null
          review_id?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string | null
          body: string | null
          created_at: string
          external_id: string | null
          id: string
          is_demo: boolean
          location_id: string
          rating: number
          review_date: string
          source: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          is_demo?: boolean
          location_id: string
          rating: number
          review_date?: string
          source?: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          is_demo?: boolean
          location_id?: string
          rating?: number
          review_date?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_competitors: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          is_demo: boolean
          location_id: string
          name: string
          place_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          location_id: string
          name: string
          place_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          location_id?: string
          name?: string
          place_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_competitors_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_costs: {
        Row: {
          cost_sek: number
          id: string
          is_demo: boolean
          monthly_cap_sek: number
          period_month: string
          provider_key: string
          units: number
        }
        Insert: {
          cost_sek?: number
          id?: string
          is_demo?: boolean
          monthly_cap_sek?: number
          period_month: string
          provider_key: string
          units?: number
        }
        Update: {
          cost_sek?: number
          id?: string
          is_demo?: boolean
          monthly_cap_sek?: number
          period_month?: string
          provider_key?: string
          units?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_org: { Args: { _org_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      location_org: { Args: { _location_id: string }; Returns: string }
    }
    Enums: {
      action_status: "open" | "in_progress" | "waiting_client" | "done"
      app_role: "aurora_admin" | "operator" | "client"
      approval_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "published"
      checklist_status:
        | "todo"
        | "in_progress"
        | "done"
        | "blocked"
        | "not_applicable"
      geo_scan_status: "queued" | "running" | "completed" | "failed"
      location_status: "onboarding" | "active" | "paused" | "churned"
      nap_status: "ok" | "mismatch" | "missing" | "unknown"
      provider_mode: "demo" | "not_configured" | "live"
      scan_cadence: "weekly" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_status: ["open", "in_progress", "waiting_client", "done"],
      app_role: ["aurora_admin", "operator", "client"],
      approval_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "published",
      ],
      checklist_status: [
        "todo",
        "in_progress",
        "done",
        "blocked",
        "not_applicable",
      ],
      geo_scan_status: ["queued", "running", "completed", "failed"],
      location_status: ["onboarding", "active", "paused", "churned"],
      nap_status: ["ok", "mismatch", "missing", "unknown"],
      provider_mode: ["demo", "not_configured", "live"],
      scan_cadence: ["weekly", "monthly"],
    },
  },
} as const
