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
      ai_map_leads: {
        Row: {
          company_name: string
          consent: boolean
          contact_name: string
          created_at: string
          email: string
          employee_count: string
          id: string
          industry: string
          ip: string | null
          pain_areas: string[]
          phone: string | null
          total_potential: string
          total_score: number
          user_agent: string | null
        }
        Insert: {
          company_name: string
          consent?: boolean
          contact_name: string
          created_at?: string
          email: string
          employee_count: string
          id?: string
          industry: string
          ip?: string | null
          pain_areas?: string[]
          phone?: string | null
          total_potential?: string
          total_score?: number
          user_agent?: string | null
        }
        Update: {
          company_name?: string
          consent?: boolean
          contact_name?: string
          created_at?: string
          email?: string
          employee_count?: string
          id?: string
          industry?: string
          ip?: string | null
          pain_areas?: string[]
          phone?: string | null
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
          position: number
          potential: string
          process_name: string
          recommended_solution: string
          rule_based: string
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
          position?: number
          potential: string
          process_name: string
          recommended_solution: string
          rule_based: string
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
          position?: number
          potential?: string
          process_name?: string
          recommended_solution?: string
          rule_based?: string
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
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          internal_note: string | null
          ip: string | null
          lead_label: string | null
          message: string
          name: string
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
          id?: string
          internal_note?: string | null
          ip?: string | null
          lead_label?: string | null
          message: string
          name: string
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
          id?: string
          internal_note?: string | null
          ip?: string | null
          lead_label?: string | null
          message?: string
          name?: string
          paket?: string
          platform?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
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
      [_ in never]: never
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
