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
      ai_karta_clicks: {
        Row: {
          button: string
          created_at: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          button: string
          created_at?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          button?: string
          created_at?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_kontoret_asset_revisions: {
        Row: {
          archive_path: string
          created_at: string
          file_bytes: number | null
          id: string
          is_current: boolean
          note: string | null
          original_filename: string | null
          product: string
          restored_at: string | null
          revision: number
          updated_at: string
          uploaded_by: string | null
          version: string
        }
        Insert: {
          archive_path: string
          created_at?: string
          file_bytes?: number | null
          id?: string
          is_current?: boolean
          note?: string | null
          original_filename?: string | null
          product: string
          restored_at?: string | null
          revision: number
          updated_at?: string
          uploaded_by?: string | null
          version?: string
        }
        Update: {
          archive_path?: string
          created_at?: string
          file_bytes?: number | null
          id?: string
          is_current?: boolean
          note?: string | null
          original_filename?: string | null
          product?: string
          restored_at?: string | null
          revision?: number
          updated_at?: string
          uploaded_by?: string | null
          version?: string
        }
        Relationships: []
      }
      ai_kontoret_assets: {
        Row: {
          active: boolean
          created_at: string
          file_bytes: number | null
          id: string
          label: string
          product: string
          storage_path: string
          updated_at: string
          uploaded_at: string | null
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          file_bytes?: number | null
          id?: string
          label: string
          product: string
          storage_path: string
          updated_at?: string
          uploaded_at?: string | null
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          file_bytes?: number | null
          id?: string
          label?: string
          product?: string
          storage_path?: string
          updated_at?: string
          uploaded_at?: string | null
          version?: string
        }
        Relationships: []
      }
      ai_kontoret_launch: {
        Row: {
          id: boolean
          legal_confirmed: boolean
          legal_confirmed_at: string | null
          legal_confirmed_by: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          legal_confirmed?: boolean
          legal_confirmed_at?: string | null
          legal_confirmed_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: boolean
          legal_confirmed?: boolean
          legal_confirmed_at?: string | null
          legal_confirmed_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_kontoret_purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          delivered_at: string | null
          delivery_count: number
          delivery_status: string
          email: string
          id: string
          last_delivery_at: string | null
          metadata: Json
          payment_status: string
          product: string
          stripe_customer_id: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          delivered_at?: string | null
          delivery_count?: number
          delivery_status?: string
          email: string
          id?: string
          last_delivery_at?: string | null
          metadata?: Json
          payment_status?: string
          product: string
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          delivered_at?: string | null
          delivery_count?: number
          delivery_status?: string
          email?: string
          id?: string
          last_delivery_at?: string | null
          metadata?: Json
          payment_status?: string
          product?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
        }
        Relationships: []
      }
      ai_kontoret_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          handled: boolean
          note: string | null
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          handled?: boolean
          note?: string | null
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          handled?: boolean
          note?: string | null
          received_at?: string
        }
        Relationships: []
      }
      ai_kontoret_withdrawals: {
        Row: {
          created_at: string
          description: string | null
          email: string
          id: string
          metadata: Json
          name: string
          product: string | null
          receipt_emailed: boolean
          session_id: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          id?: string
          metadata?: Json
          name: string
          product?: string | null
          receipt_emailed?: boolean
          session_id?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          metadata?: Json
          name?: string
          product?: string | null
          receipt_emailed?: boolean
          session_id?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      ai_map_email_sequence: {
        Row: {
          created_at: string
          email: string
          id: string
          lead_id: string
          step_14_sent_at: string | null
          step_2_sent_at: string | null
          step_5_sent_at: string | null
          step_9_sent_at: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
          unsubscribed_reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lead_id: string
          step_14_sent_at?: string | null
          step_2_sent_at?: string | null
          step_5_sent_at?: string | null
          step_9_sent_at?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          unsubscribed_reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lead_id?: string
          step_14_sent_at?: string | null
          step_2_sent_at?: string | null
          step_5_sent_at?: string | null
          step_9_sent_at?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          unsubscribed_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_map_email_sequence_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "ai_map_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_map_leads: {
        Row: {
          ai_analysis: Json | null
          company_name: string
          consent: boolean
          contact_name: string
          created_at: string
          email: string
          employee_count: string
          followup_at: string | null
          id: string
          industry: string
          ip: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          notes: string | null
          pain_areas: string[]
          pdf_sent_at: string | null
          phone: string | null
          share_token: string
          status: string
          total_potential: string
          total_score: number
          user_agent: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          company_name: string
          consent?: boolean
          contact_name: string
          created_at?: string
          email: string
          employee_count: string
          followup_at?: string | null
          id?: string
          industry: string
          ip?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          pain_areas?: string[]
          pdf_sent_at?: string | null
          phone?: string | null
          share_token?: string
          status?: string
          total_potential?: string
          total_score?: number
          user_agent?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          company_name?: string
          consent?: boolean
          contact_name?: string
          created_at?: string
          email?: string
          employee_count?: string
          followup_at?: string | null
          id?: string
          industry?: string
          ip?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          pain_areas?: string[]
          pdf_sent_at?: string | null
          phone?: string | null
          share_token?: string
          status?: string
          total_potential?: string
          total_score?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_map_processes: {
        Row: {
          business_value: string
          created_at: string
          data_available: string
          frequency: string
          id: string
          lead_id: string
          next_step: string | null
          position: number
          potential: string
          process_name: string
          recommended_solution: string
          rule_based: string
          saved_hours_per_week: number | null
          score: number
          systems: string | null
          weekly_time: string
        }
        Insert: {
          business_value: string
          created_at?: string
          data_available: string
          frequency: string
          id?: string
          lead_id: string
          next_step?: string | null
          position?: number
          potential: string
          process_name: string
          recommended_solution: string
          rule_based: string
          saved_hours_per_week?: number | null
          score?: number
          systems?: string | null
          weekly_time: string
        }
        Update: {
          business_value?: string
          created_at?: string
          data_available?: string
          frequency?: string
          id?: string
          lead_id?: string
          next_step?: string | null
          position?: number
          potential?: string
          process_name?: string
          recommended_solution?: string
          rule_based?: string
          saved_hours_per_week?: number | null
          score?: number
          systems?: string | null
          weekly_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_map_processes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "ai_map_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_agent_sessions: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          last_error: string | null
          model: string | null
          question: string
          recommended_product_ids: string[]
          status: string
          store_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          model?: string | null
          question: string
          recommended_product_ids?: string[]
          status?: string
          store_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          model?: string | null
          question?: string
          recommended_product_ids?: string[]
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_agent_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "commerce_ops_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_ops_catalog: {
        Row: {
          active: boolean
          captured_at: string
          category: string | null
          description: string | null
          external_id: string
          id: string
          inventory: number | null
          metadata: Json
          price: number | null
          product_url: string | null
          source: string
          store_id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          captured_at?: string
          category?: string | null
          description?: string | null
          external_id: string
          id?: string
          inventory?: number | null
          metadata?: Json
          price?: number | null
          product_url?: string | null
          source?: string
          store_id: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          captured_at?: string
          category?: string | null
          description?: string | null
          external_id?: string
          id?: string
          inventory?: number | null
          metadata?: Json
          price?: number | null
          product_url?: string | null
          source?: string
          store_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_ops_catalog_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "commerce_ops_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_ops_changes: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          created_at: string
          guardrail_notes: string[]
          id: string
          items: Json
          kind: string
          last_error: string | null
          rationale: string | null
          source: string
          status: string
          store_id: string
          summary: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          created_at?: string
          guardrail_notes?: string[]
          id?: string
          items?: Json
          kind: string
          last_error?: string | null
          rationale?: string | null
          source?: string
          status?: string
          store_id: string
          summary: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          created_at?: string
          guardrail_notes?: string[]
          id?: string
          items?: Json
          kind?: string
          last_error?: string | null
          rationale?: string | null
          source?: string
          status?: string
          store_id?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_ops_changes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "commerce_ops_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_ops_snapshots: {
        Row: {
          average_order_value: number | null
          captured_at: string
          conversion_rate: number | null
          id: string
          low_stock_count: number
          note: string | null
          order_issues_count: number
          orders: number
          period_end: string
          period_start: string
          sales: number
          sales_change_pct: number | null
          slow_movers_count: number
          source: string
          store_id: string
          traffic: number | null
        }
        Insert: {
          average_order_value?: number | null
          captured_at?: string
          conversion_rate?: number | null
          id?: string
          low_stock_count?: number
          note?: string | null
          order_issues_count?: number
          orders?: number
          period_end: string
          period_start: string
          sales?: number
          sales_change_pct?: number | null
          slow_movers_count?: number
          source?: string
          store_id: string
          traffic?: number | null
        }
        Update: {
          average_order_value?: number | null
          captured_at?: string
          conversion_rate?: number | null
          id?: string
          low_stock_count?: number
          note?: string | null
          order_issues_count?: number
          orders?: number
          period_end?: string
          period_start?: string
          sales?: number
          sales_change_pct?: number | null
          slow_movers_count?: number
          source?: string
          store_id?: string
          traffic?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_ops_snapshots_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "commerce_ops_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_ops_stores: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          name: string
          platform: string
          shop_domain: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          name: string
          platform?: string
          shop_domain?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          name?: string
          platform?: string
          shop_domain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coworker_profiles: {
        Row: {
          active: boolean
          allowed_action_prefixes: string[]
          approval_mode: string
          created_at: string
          description: string
          id: string
          key: string
          name: string
          system_role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_action_prefixes?: string[]
          approval_mode?: string
          created_at?: string
          description: string
          id?: string
          key: string
          name: string
          system_role: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_action_prefixes?: string[]
          approval_mode?: string
          created_at?: string
          description?: string
          id?: string
          key?: string
          name?: string
          system_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      coworker_tasks: {
        Row: {
          approved_at: string | null
          created_at: string
          executed_at: string | null
          goal: string
          id: string
          last_error: string | null
          plan: Json
          profile_id: string
          requires_approval: boolean
          result_summary: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          executed_at?: string | null
          goal: string
          id?: string
          last_error?: string | null
          plan?: Json
          profile_id: string
          requires_approval?: boolean
          result_summary?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          executed_at?: string | null
          goal?: string
          id?: string
          last_error?: string | null
          plan?: Json
          profile_id?: string
          requires_approval?: boolean
          result_summary?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coworker_tasks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "coworker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_clicks: {
        Row: {
          button: string
          created_at: string
          id: string
          lead_label: string | null
          location: string | null
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          button: string
          created_at?: string
          id?: string
          lead_label?: string | null
          location?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          button?: string
          created_at?: string
          id?: string
          lead_label?: string | null
          location?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string
          created_at: string
          id: string
          key: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_html: string
          body_text?: string
          created_at?: string
          id?: string
          key: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          body_text?: string
          created_at?: string
          id?: string
          key?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_cta_clicks: {
        Row: {
          category: string | null
          created_at: string
          cta_label: string | null
          cta_source: string
          id: string
          opened_question: string | null
          page_path: string | null
          paket: string | null
          query: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          cta_label?: string | null
          cta_source?: string
          id?: string
          opened_question?: string | null
          page_path?: string | null
          paket?: string | null
          query?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          cta_label?: string | null
          cta_source?: string
          id?: string
          opened_question?: string | null
          page_path?: string | null
          paket?: string | null
          query?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      faq_search_events: {
        Row: {
          created_at: string
          id: string
          opened_question: string | null
          page_path: string | null
          query: string
          result_count: number
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          opened_question?: string | null
          page_path?: string | null
          query: string
          result_count?: number
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          opened_question?: string | null
          page_path?: string | null
          query?: string
          result_count?: number
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      genomlysning_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          followup_at: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          followup_at?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          followup_at?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      guardian_checks: {
        Row: {
          created_at: string
          details: Json
          id: string
          site_id: string
          slot: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          site_id: string
          slot: string
          status: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          site_id?: string
          slot?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_checks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "guardian_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_flow_runs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          details: Json
          duration_ms: number | null
          flow_id: string
          id: string
          incident_state: string
          lease_expires_at: string
          lease_token: string
          status: string
          steps_snapshot: Json
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          details?: Json
          duration_ms?: number | null
          flow_id: string
          id?: string
          incident_state?: string
          lease_expires_at: string
          lease_token?: string
          status?: string
          steps_snapshot: Json
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          details?: Json
          duration_ms?: number | null
          flow_id?: string
          id?: string
          incident_state?: string
          lease_expires_at?: string
          lease_token?: string
          status?: string
          steps_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "guardian_flow_runs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "guardian_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_flows: {
        Row: {
          active: boolean
          check_interval_minutes: number
          created_at: string
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string
          site_id: string
          steps: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          check_interval_minutes?: number
          created_at?: string
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string
          site_id: string
          steps: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          check_interval_minutes?: number
          created_at?: string
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string
          site_id?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_flows_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "guardian_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_sites: {
        Row: {
          active: boolean
          check_interval_minutes: number
          created_at: string
          expected_text: string
          id: string
          last_checked_at: string | null
          last_notified_at: string | null
          last_notified_state: string
          name: string
          notify_email: string
          url: string
        }
        Insert: {
          active?: boolean
          check_interval_minutes?: number
          created_at?: string
          expected_text?: string
          id?: string
          last_checked_at?: string | null
          last_notified_at?: string | null
          last_notified_state?: string
          name: string
          notify_email?: string
          url: string
        }
        Update: {
          active?: boolean
          check_interval_minutes?: number
          created_at?: string
          expected_text?: string
          id?: string
          last_checked_at?: string | null
          last_notified_at?: string | null
          last_notified_state?: string
          name?: string
          notify_email?: string
          url?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          account_label: string | null
          active: boolean
          allowed_actions: string[]
          connection_alias: string
          created_at: string
          id: string
          last_error: string | null
          last_verified_at: string | null
          name: string
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          account_label?: string | null
          active?: boolean
          allowed_actions?: string[]
          connection_alias?: string
          created_at?: string
          id?: string
          last_error?: string | null
          last_verified_at?: string | null
          name: string
          service: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_label?: string | null
          active?: boolean
          allowed_actions?: string[]
          connection_alias?: string
          created_at?: string
          id?: string
          last_error?: string | null
          last_verified_at?: string | null
          name?: string
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_runs: {
        Row: {
          action_id: string
          approved_at: string | null
          connection_id: string
          created_at: string
          executed_at: string | null
          execution_id: string | null
          id: string
          idempotency_key: string
          input: Json
          last_error: string | null
          output_summary: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          action_id: string
          approved_at?: string | null
          connection_id: string
          created_at?: string
          executed_at?: string | null
          execution_id?: string | null
          id?: string
          idempotency_key?: string
          input?: Json
          last_error?: string | null
          output_summary?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_id?: string
          approved_at?: string | null
          connection_id?: string
          created_at?: string
          executed_at?: string | null
          execution_id?: string | null
          id?: string
          idempotency_key?: string
          input?: Json
          last_error?: string | null
          output_summary?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          followup_at: string | null
          id: string
          internal_note: string | null
          ip: string | null
          lead_label: string | null
          message: string
          name: string
          notes: string | null
          paket: string
          platform: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          followup_at?: string | null
          id?: string
          internal_note?: string | null
          ip?: string | null
          lead_label?: string | null
          message: string
          name: string
          notes?: string | null
          paket: string
          platform?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          followup_at?: string | null
          id?: string
          internal_note?: string | null
          ip?: string | null
          lead_label?: string | null
          message?: string
          name?: string
          notes?: string | null
          paket?: string
          platform?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      managed_channel_outbox: {
        Row: {
          approved_at: string | null
          conversation_id: string | null
          created_at: string
          id: string
          last_error: string | null
          message_body: string
          message_type: string
          provider_message_id: string | null
          recipient_e164: string
          sent_at: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          approved_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          message_body: string
          message_type?: string
          provider_message_id?: string | null
          recipient_e164: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          approved_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          message_body?: string
          message_type?: string
          provider_message_id?: string | null
          recipient_e164?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managed_channel_outbox_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "managed_channel_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_channel_workspaces: {
        Row: {
          active: boolean
          base_url: string
          created_at: string
          credential_env_name: string
          external_account_id: string | null
          external_account_name: string | null
          id: string
          last_error: string | null
          last_verified_at: string | null
          name: string
          provider: string
          scopes: string[]
          status: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_url: string
          created_at?: string
          credential_env_name?: string
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error?: string | null
          last_verified_at?: string | null
          name: string
          provider?: string
          scopes?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_url?: string
          created_at?: string
          credential_env_name?: string
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error?: string | null
          last_verified_at?: string | null
          name?: string
          provider?: string
          scopes?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_checks: {
        Row: {
          payload: Json
          project_id: string
          updated_at: string
        }
        Insert: {
          payload: Json
          project_id: string
          updated_at?: string
        }
        Update: {
          payload?: Json
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          payload: Json
          project_id: string
          updated_at: string
        }
        Insert: {
          payload: Json
          project_id: string
          updated_at?: string
        }
        Update: {
          payload?: Json
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          payload: Json
          project_id: string
          range_days: number
          source: string
          updated_at: string
        }
        Insert: {
          payload: Json
          project_id: string
          range_days: number
          source: string
          updated_at?: string
        }
        Update: {
          payload?: Json
          project_id?: string
          range_days?: number
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_source_states: {
        Row: {
          payload: Json
          project_id: string
          range_days: number
          source: string
          updated_at: string
        }
        Insert: {
          payload: Json
          project_id: string
          range_days?: number
          source: string
          updated_at?: string
        }
        Update: {
          payload?: Json
          project_id?: string
          range_days?: number
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospecting_audits: {
        Row: {
          audit_signals: Json
          audited_at: string
          campaign_id: string
          created_at: string
          demo_brief: Json
          error_message: string | null
          http_status: number | null
          id: string
          lead_id: string
          meta_description: string | null
          opportunity_score: number
          opportunity_summary: string | null
          page_title: string | null
          pitch_draft: string | null
          robots: string | null
          screenshot_expires_at: string | null
          screenshot_url: string | null
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          audit_signals?: Json
          audited_at?: string
          campaign_id: string
          created_at?: string
          demo_brief?: Json
          error_message?: string | null
          http_status?: number | null
          id?: string
          lead_id: string
          meta_description?: string | null
          opportunity_score?: number
          opportunity_summary?: string | null
          page_title?: string | null
          pitch_draft?: string | null
          robots?: string | null
          screenshot_expires_at?: string | null
          screenshot_url?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          audit_signals?: Json
          audited_at?: string
          campaign_id?: string
          created_at?: string
          demo_brief?: Json
          error_message?: string | null
          http_status?: number | null
          id?: string
          lead_id?: string
          meta_description?: string | null
          opportunity_score?: number
          opportunity_summary?: string | null
          page_title?: string | null
          pitch_draft?: string | null
          robots?: string | null
          screenshot_expires_at?: string | null
          screenshot_url?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospecting_audits_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "prospecting_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospecting_audits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "prospecting_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      prospecting_campaigns: {
        Row: {
          admin_id: string
          created_at: string
          error_message: string | null
          id: string
          industry: string | null
          location: string
          name: string
          need_type: string
          query: string
          result_limit: number
          status: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          industry?: string | null
          location?: string
          name: string
          need_type: string
          query: string
          result_limit?: number
          status?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          industry?: string | null
          location?: string
          name?: string
          need_type?: string
          query?: string
          result_limit?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospecting_leads: {
        Row: {
          campaign_id: string
          city: string | null
          company_name: string
          contact_page_url: string | null
          contacted_at: string | null
          created_at: string
          description: string | null
          domain: string
          fit_score: number
          id: string
          industry: string | null
          observed_signals: Json
          outreach_note: string | null
          source_url: string
          status: string
          updated_at: string
          website_url: string
        }
        Insert: {
          campaign_id: string
          city?: string | null
          company_name: string
          contact_page_url?: string | null
          contacted_at?: string | null
          created_at?: string
          description?: string | null
          domain: string
          fit_score: number
          id?: string
          industry?: string | null
          observed_signals?: Json
          outreach_note?: string | null
          source_url: string
          status?: string
          updated_at?: string
          website_url: string
        }
        Update: {
          campaign_id?: string
          city?: string | null
          company_name?: string
          contact_page_url?: string | null
          contacted_at?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          fit_score?: number
          id?: string
          industry?: string | null
          observed_signals?: Json
          outreach_note?: string | null
          source_url?: string
          status?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospecting_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "prospecting_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      text_library: {
        Row: {
          blocked_phrases_found: string[]
          character_count: number | null
          context: string | null
          created_at: string
          generated_content: Json
          id: string
          quality_rating: number | null
          regeneration_count: number
          status: string
          target_keyword: string | null
          text_type: string
          topic: string
          updated_at: string
          used_on_page: string | null
          word_count: number | null
        }
        Insert: {
          blocked_phrases_found?: string[]
          character_count?: number | null
          context?: string | null
          created_at?: string
          generated_content: Json
          id?: string
          quality_rating?: number | null
          regeneration_count?: number
          status?: string
          target_keyword?: string | null
          text_type: string
          topic: string
          updated_at?: string
          used_on_page?: string | null
          word_count?: number | null
        }
        Update: {
          blocked_phrases_found?: string[]
          character_count?: number | null
          context?: string | null
          created_at?: string
          generated_content?: Json
          id?: string
          quality_rating?: number | null
          regeneration_count?: number
          status?: string
          target_keyword?: string | null
          text_type?: string
          topic?: string
          updated_at?: string
          used_on_page?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      guardian_claim_flows: {
        Args: { p_limit?: number; p_origins?: string[] }
        Returns: {
          flow_id: string
          lease_expires_at: string
          lease_token: string
          name: string
          run_id: string
          site_id: string
          site_url: string
          steps: Json
        }[]
      }
      guardian_complete_flow: {
        Args: { p_lease_token: string; p_result: Json; p_run_id: string }
        Returns: Json
      }
      guardian_edit_flow: {
        Args: { p_changes: Json; p_id: string }
        Returns: undefined
      }
      portfolio_claim_refresh: {
        Args: {
          p_attempted_at: string
          p_project_id: string
          p_range_days?: number
          p_source: string
        }
        Returns: boolean
      }
      try_contact_rate_limit: {
        Args: {
          p_email: string
          p_ip: string
          p_max_per_email?: number
          p_max_per_ip?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      try_prospecting_rate_limit: {
        Args: { p_admin_id: string; p_max?: number; p_window_seconds?: number }
        Returns: boolean
      }
      upsert_vault_secret: {
        Args: { p_name: string; p_value: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
