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
          notes: string | null
          pain_areas: string[]
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
          notes?: string | null
          pain_areas?: string[]
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
          notes?: string | null
          pain_areas?: string[]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
