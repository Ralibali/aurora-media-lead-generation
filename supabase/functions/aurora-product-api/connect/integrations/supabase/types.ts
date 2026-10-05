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
      agents: {
        Row: {
          consent_required: boolean
          created_at: string
          disclosure_text: string
          fallback_number: string | null
          greeting: string | null
          id: string
          language: string
          max_call_seconds: number
          name: string
          org_id: string
          persona: string | null
          provider: string
          provider_agent_id: string | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Insert: {
          consent_required?: boolean
          created_at?: string
          disclosure_text?: string
          fallback_number?: string | null
          greeting?: string | null
          id?: string
          language?: string
          max_call_seconds?: number
          name: string
          org_id: string
          persona?: string | null
          provider?: string
          provider_agent_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Update: {
          consent_required?: boolean
          created_at?: string
          disclosure_text?: string
          fallback_number?: string | null
          greeting?: string | null
          id?: string
          language?: string
          max_call_seconds?: number
          name?: string
          org_id?: string
          persona?: string | null
          provider?: string
          provider_agent_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical"]
        }
        Relationships: [
          {
            foreignKeyName: "agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_messages: {
        Row: {
          call_id: string
          confidence: number | null
          content: string
          id: string
          is_demo: boolean
          offset_ms: number | null
          org_id: string
          position: number
          speaker: string
        }
        Insert: {
          call_id: string
          confidence?: number | null
          content: string
          id?: string
          is_demo?: boolean
          offset_ms?: number | null
          org_id: string
          position?: number
          speaker: string
        }
        Update: {
          call_id?: string
          confidence?: number | null
          content?: string
          id?: string
          is_demo?: boolean
          offset_ms?: number | null
          org_id?: string
          position?: number
          speaker?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_messages_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          avg_latency_ms: number | null
          cost_sek: number
          created_at: string
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds: number
          ended_at: string | null
          external_id: string | null
          from_number: string | null
          id: string
          is_demo: boolean
          language: string
          org_id: string
          outcome: Database["public"]["Enums"]["call_outcome"]
          provider: string
          started_at: string
          summary: string | null
          to_number: string | null
          transferred_to: string | null
        }
        Insert: {
          agent_id?: string | null
          avg_latency_ms?: number | null
          cost_sek?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number
          ended_at?: string | null
          external_id?: string | null
          from_number?: string | null
          id?: string
          is_demo?: boolean
          language?: string
          org_id: string
          outcome?: Database["public"]["Enums"]["call_outcome"]
          provider?: string
          started_at?: string
          summary?: string | null
          to_number?: string | null
          transferred_to?: string | null
        }
        Update: {
          agent_id?: string | null
          avg_latency_ms?: number | null
          cost_sek?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number
          ended_at?: string | null
          external_id?: string | null
          from_number?: string | null
          id?: string
          is_demo?: boolean
          language?: string
          org_id?: string
          outcome?: Database["public"]["Enums"]["call_outcome"]
          provider?: string
          started_at?: string
          summary?: string | null
          to_number?: string | null
          transferred_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_guardrails: {
        Row: {
          alert_threshold_pct: number
          hard_cap_sek: number | null
          hard_stop: boolean
          id: string
          included_minutes: number
          monthly_budget_sek: number
          org_id: string
          updated_at: string
        }
        Insert: {
          alert_threshold_pct?: number
          hard_cap_sek?: number | null
          hard_stop?: boolean
          id?: string
          included_minutes?: number
          monthly_budget_sek?: number
          org_id: string
          updated_at?: string
        }
        Update: {
          alert_threshold_pct?: number
          hard_cap_sek?: number | null
          hard_stop?: boolean
          id?: string
          included_minutes?: number
          monthly_budget_sek?: number
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_guardrails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_rules: {
        Row: {
          action: string
          agent_id: string
          condition_key: string
          description: string
          id: string
          is_active: boolean
          org_id: string
          position: number
          requires_approval: boolean
          target: string | null
        }
        Insert: {
          action: string
          agent_id: string
          condition_key: string
          description: string
          id?: string
          is_active?: boolean
          org_id: string
          position?: number
          requires_approval?: boolean
          target?: string | null
        }
        Update: {
          action?: string
          agent_id?: string
          condition_key?: string
          description?: string
          id?: string
          is_active?: boolean
          org_id?: string
          position?: number
          requires_approval?: boolean
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handoff_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoff_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["integration_kind"]
          last_checked_at: string | null
          last_error: string | null
          org_id: string
          provider: string
          requires_approval: boolean
          status: Database["public"]["Enums"]["integration_status"]
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["integration_kind"]
          last_checked_at?: string | null
          last_error?: string | null
          org_id: string
          provider: string
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["integration_status"]
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["integration_kind"]
          last_checked_at?: string | null
          last_error?: string | null
          org_id?: string
          provider?: string
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["integration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          agent_id: string | null
          answer: string
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          question: string
          source: string | null
          tags: string[]
        }
        Insert: {
          agent_id?: string | null
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          question: string
          source?: string | null
          tags?: string[]
        }
        Update: {
          agent_id?: string | null
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          question?: string
          source?: string | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_suggestions: {
        Row: {
          answer: string
          created_at: string
          id: string
          org_id: string
          question: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          org_id: string
          question: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          org_id?: string
          question?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_suggestions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_deliveries: {
        Row: {
          attempts: number
          created_at: string
          delivered_at: string | null
          id: string
          kind: string
          last_error: string | null
          lead_id: string
          org_id: string
          response_status: number | null
          status: Database["public"]["Enums"]["delivery_status"]
          target_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          id?: string
          kind: string
          last_error?: string | null
          lead_id: string
          org_id: string
          response_status?: number | null
          status?: Database["public"]["Enums"]["delivery_status"]
          target_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          id?: string
          kind?: string
          last_error?: string | null
          lead_id?: string
          org_id?: string
          response_status?: number | null
          status?: Database["public"]["Enums"]["delivery_status"]
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_deliveries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_deliveries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_deliveries_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "lead_delivery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_delivery_targets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: string
          org_id: string
          secret: string | null
          target: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          org_id: string
          secret?: string | null
          target: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          org_id?: string
          secret?: string | null
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_delivery_targets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          answers: Json
          call_id: string | null
          created_at: string
          delivered_at: string | null
          email: string | null
          follow_up_required: boolean
          id: string
          intent: string | null
          is_demo: boolean
          name: string | null
          notes: string | null
          org_id: string
          phone: string | null
          score: number
          sla_due_at: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          answers?: Json
          call_id?: string | null
          created_at?: string
          delivered_at?: string | null
          email?: string | null
          follow_up_required?: boolean
          id?: string
          intent?: string | null
          is_demo?: boolean
          name?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          score?: number
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          answers?: Json
          call_id?: string | null
          created_at?: string
          delivered_at?: string | null
          email?: string | null
          follow_up_required?: boolean
          id?: string
          intent?: string | null
          is_demo?: boolean
          name?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          score?: number
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          closed: boolean
          closes: string | null
          id: string
          opens: string | null
          org_id: string
          weekday: number
        }
        Insert: {
          closed?: boolean
          closes?: string | null
          id?: string
          opens?: string | null
          org_id: string
          weekday: number
        }
        Update: {
          closed?: boolean
          closes?: string | null
          id?: string
          opens?: string | null
          org_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "opening_hours_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          is_owner: boolean
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_owner?: boolean
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_owner?: boolean
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
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
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          demo_mode: boolean
          id: string
          name: string
          notes: string | null
          onboarding_step: number
          org_number: string | null
          status: Database["public"]["Enums"]["org_status"]
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical"]
          website_url: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          demo_mode?: boolean
          id?: string
          name: string
          notes?: string | null
          onboarding_step?: number
          org_number?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          vertical: Database["public"]["Enums"]["vertical"]
          website_url?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          demo_mode?: boolean
          id?: string
          name?: string
          notes?: string | null
          onboarding_step?: number
          org_number?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical"]
          website_url?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          features: Json
          id: string
          included_minutes: number
          is_active: boolean
          key: string
          monthly_fee_sek: number
          name: string
          overage_sek_per_minute: number
          position: number
          setup_fee_sek: number
        }
        Insert: {
          features?: Json
          id?: string
          included_minutes?: number
          is_active?: boolean
          key: string
          monthly_fee_sek?: number
          name: string
          overage_sek_per_minute?: number
          position?: number
          setup_fee_sek?: number
        }
        Update: {
          features?: Json
          id?: string
          included_minutes?: number
          is_active?: boolean
          key?: string
          monthly_fee_sek?: number
          name?: string
          overage_sek_per_minute?: number
          position?: number
          setup_fee_sek?: number
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
      qa_scorecards: {
        Row: {
          call_id: string
          created_at: string
          criteria: Json
          id: string
          max_score: number
          notes: string | null
          org_id: string
          reviewer_id: string | null
          total_score: number
        }
        Insert: {
          call_id: string
          created_at?: string
          criteria?: Json
          id?: string
          max_score?: number
          notes?: string | null
          org_id: string
          reviewer_id?: string | null
          total_score?: number
        }
        Update: {
          call_id?: string
          created_at?: string
          criteria?: Json
          id?: string
          max_score?: number
          notes?: string | null
          org_id?: string
          reviewer_id?: string | null
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "qa_scorecards_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_scorecards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_questions: {
        Row: {
          agent_id: string
          field_key: string
          id: string
          org_id: string
          position: number
          question: string
          required: boolean
        }
        Insert: {
          agent_id: string
          field_key: string
          id?: string
          org_id: string
          position?: number
          question: string
          required?: boolean
        }
        Update: {
          agent_id?: string
          field_key?: string
          id?: string
          org_id?: string
          position?: number
          question?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "qualification_questions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_questions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          mrr_sek: number
          org_id: string
          plan_id: string
          setup_invoiced: boolean
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          mrr_sek?: number
          org_id: string
          plan_id: string
          setup_invoiced?: boolean
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          mrr_sek?: number
          org_id?: string
          plan_id?: string
          setup_invoiced?: boolean
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          call_id: string | null
          cost_sek: number
          id: string
          is_demo: boolean
          kind: Database["public"]["Enums"]["usage_kind"]
          occurred_at: string
          org_id: string
          provider: string
          unit: string
          units: number
        }
        Insert: {
          call_id?: string | null
          cost_sek?: number
          id?: string
          is_demo?: boolean
          kind: Database["public"]["Enums"]["usage_kind"]
          occurred_at?: string
          org_id: string
          provider?: string
          unit?: string
          units?: number
        }
        Update: {
          call_id?: string | null
          cost_sek?: number
          id?: string
          is_demo?: boolean
          kind?: Database["public"]["Enums"]["usage_kind"]
          occurred_at?: string
          org_id?: string
          provider?: string
          unit?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      vertical_templates: {
        Row: {
          description: string | null
          id: string
          key: string
          name: string
          payload: Json
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          name: string
          payload?: Json
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          name?: string
          payload?: Json
          vertical?: Database["public"]["Enums"]["vertical"]
        }
        Relationships: []
      }
      voice_test_runs: {
        Row: {
          agent_id: string | null
          created_at: string
          executed_at: string | null
          executed_by: string | null
          id: string
          is_real_call: boolean
          metrics: Json
          notes: string | null
          org_id: string | null
          scenario_key: string
          status: Database["public"]["Enums"]["voice_test_status"]
          verdict: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          is_real_call?: boolean
          metrics?: Json
          notes?: string | null
          org_id?: string | null
          scenario_key: string
          status?: Database["public"]["Enums"]["voice_test_status"]
          verdict?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          is_real_call?: boolean
          metrics?: Json
          notes?: string | null
          org_id?: string | null
          scenario_key?: string
          status?: Database["public"]["Enums"]["voice_test_status"]
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_test_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_test_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      can_read_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_aurora_staff: { Args: { _user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      org_role_of: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
    }
    Enums: {
      agent_status: "draft" | "testing" | "live" | "paused"
      app_role: "aurora_admin" | "aurora_operator" | "client_user"
      call_direction: "inbound" | "outbound_return"
      call_outcome:
        | "answered"
        | "qualified_lead"
        | "booked"
        | "transferred"
        | "voicemail"
        | "abandoned"
        | "failed"
        | "unknown"
      delivery_status: "pending" | "sent" | "failed" | "skipped"
      integration_kind:
        | "telephony"
        | "stt"
        | "tts"
        | "llm"
        | "booking"
        | "crm"
        | "calendar"
        | "email"
      integration_status:
        | "not_configured"
        | "configured"
        | "healthy"
        | "degraded"
        | "failing"
      lead_status: "new" | "qualified" | "contacted" | "booked" | "won" | "lost"
      org_role: "owner" | "admin" | "sales" | "agent_viewer"
      org_status: "prospect" | "onboarding" | "active" | "paused" | "churned"
      suggestion_status: "pending" | "approved" | "rejected"
      usage_kind: "telephony" | "stt" | "tts" | "llm"
      vertical:
        | "trafikskola"
        | "hospitality"
        | "hantverk"
        | "bilverkstad"
        | "salong"
        | "klinik"
      voice_test_status: "planned" | "running" | "passed" | "failed" | "blocked"
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
      agent_status: ["draft", "testing", "live", "paused"],
      app_role: ["aurora_admin", "aurora_operator", "client_user"],
      call_direction: ["inbound", "outbound_return"],
      call_outcome: [
        "answered",
        "qualified_lead",
        "booked",
        "transferred",
        "voicemail",
        "abandoned",
        "failed",
        "unknown",
      ],
      delivery_status: ["pending", "sent", "failed", "skipped"],
      integration_kind: [
        "telephony",
        "stt",
        "tts",
        "llm",
        "booking",
        "crm",
        "calendar",
        "email",
      ],
      integration_status: [
        "not_configured",
        "configured",
        "healthy",
        "degraded",
        "failing",
      ],
      lead_status: ["new", "qualified", "contacted", "booked", "won", "lost"],
      org_role: ["owner", "admin", "sales", "agent_viewer"],
      org_status: ["prospect", "onboarding", "active", "paused", "churned"],
      suggestion_status: ["pending", "approved", "rejected"],
      usage_kind: ["telephony", "stt", "tts", "llm"],
      vertical: [
        "trafikskola",
        "hospitality",
        "hantverk",
        "bilverkstad",
        "salong",
        "klinik",
      ],
      voice_test_status: ["planned", "running", "passed", "failed", "blocked"],
    },
  },
} as const
