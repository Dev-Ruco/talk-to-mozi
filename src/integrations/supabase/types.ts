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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_logs: {
        Row: {
          action: string | null
          articles_found: number | null
          articles_saved: number | null
          details: Json | null
          error_message: string | null
          executed_at: string | null
          id: string
          source_id: string | null
          status: string | null
        }
        Insert: {
          action?: string | null
          articles_found?: number | null
          articles_saved?: number | null
          details?: Json | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          source_id?: string | null
          status?: string | null
        }
        Update: {
          action?: string | null
          articles_found?: number | null
          articles_saved?: number | null
          details?: Json | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          source_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          captured_at: string | null
          category: string | null
          confidence_score: number | null
          content: string | null
          created_at: string | null
          duplicate_of: string | null
          editor_id: string | null
          highlight_type: string | null
          id: string
          image_caption: string | null
          image_url: string | null
          is_duplicate: boolean | null
          lead: string | null
          location: string | null
          original_content: string | null
          original_title: string | null
          published_at: string | null
          quick_facts: string[] | null
          reading_time: number | null
          scheduled_at: string | null
          seo_slug: string | null
          seo_title: string | null
          source_id: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          captured_at?: string | null
          category?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          duplicate_of?: string | null
          editor_id?: string | null
          highlight_type?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          is_duplicate?: boolean | null
          lead?: string | null
          location?: string | null
          original_content?: string | null
          original_title?: string | null
          published_at?: string | null
          quick_facts?: string[] | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          captured_at?: string | null
          category?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          duplicate_of?: string | null
          editor_id?: string | null
          highlight_type?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          is_duplicate?: boolean | null
          lead?: string | null
          location?: string | null
          original_content?: string | null
          original_title?: string | null
          published_at?: string | null
          quick_facts?: string[] | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          articles_captured: number | null
          categories: string[] | null
          created_at: string | null
          credibility: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found: number | null
          fetch_interval_minutes: number | null
          id: string
          is_active: boolean | null
          last_fetch_at: string | null
          name: string
          type: Database["public"]["Enums"]["source_type"] | null
          url: string
        }
        Insert: {
          articles_captured?: number | null
          categories?: string[] | null
          created_at?: string | null
          credibility?: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found?: number | null
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_fetch_at?: string | null
          name: string
          type?: Database["public"]["Enums"]["source_type"] | null
          url: string
        }
        Update: {
          articles_captured?: number | null
          categories?: string[] | null
          created_at?: string | null
          credibility?: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found?: number | null
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_fetch_at?: string | null
          name?: string
          type?: Database["public"]["Enums"]["source_type"] | null
          url?: string
        }
        Relationships: []
      }
      sponsored_ads: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          created_at: string | null
          description: string | null
          frequency: number | null
          id: string
          image_url: string | null
          impressions: number | null
          is_active: boolean | null
          link: string | null
          placement: string | null
          title: string
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          link?: string | null
          placement?: string | null
          title: string
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          link?: string | null
          placement?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "sponsored_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_campaigns: {
        Row: {
          advertiser: string
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
        }
        Insert: {
          advertiser: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
        }
        Update: {
          advertiser?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor_chefe" | "editor" | "revisor"
      article_status:
        | "captured"
        | "rewritten"
        | "pending"
        | "approved"
        | "needs_image"
        | "scheduled"
        | "published"
        | "rejected"
      credibility_level: "high" | "medium" | "low"
      source_type: "rss" | "website" | "api"
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
    Enums: {
      app_role: ["admin", "editor_chefe", "editor", "revisor"],
      article_status: [
        "captured",
        "rewritten",
        "pending",
        "approved",
        "needs_image",
        "scheduled",
        "published",
        "rejected",
      ],
      credibility_level: ["high", "medium", "low"],
      source_type: ["rss", "website", "api"],
    },
  },
} as const
