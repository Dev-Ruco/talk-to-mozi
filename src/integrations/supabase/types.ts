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
      agent_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          captured_at: string | null
          category: string | null
          confidence_score: number | null
          content: string | null
          content_type: string
          created_at: string | null
          curation_score: number | null
          duplicate_of: string | null
          editor_id: string | null
          gallery_urls: string[] | null
          highlight_type: string | null
          id: string
          image_caption: string | null
          image_url: string | null
          ingestion_method: string | null
          is_duplicate: boolean | null
          lead: string | null
          location: string | null
          normalized_title: string | null
          original_content: string | null
          original_title: string | null
          published_at: string | null
          queued_by: string | null
          quick_facts: string[] | null
          reading_time: number | null
          scheduled_at: string | null
          seo_slug: string | null
          seo_title: string | null
          similarity_hash: string | null
          source_id: string | null
          source_name: string | null
          source_type: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          visual_format: string | null
        }
        Insert: {
          author?: string | null
          captured_at?: string | null
          category?: string | null
          confidence_score?: number | null
          content?: string | null
          content_type?: string
          created_at?: string | null
          curation_score?: number | null
          duplicate_of?: string | null
          editor_id?: string | null
          gallery_urls?: string[] | null
          highlight_type?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          ingestion_method?: string | null
          is_duplicate?: boolean | null
          lead?: string | null
          location?: string | null
          normalized_title?: string | null
          original_content?: string | null
          original_title?: string | null
          published_at?: string | null
          queued_by?: string | null
          quick_facts?: string[] | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          similarity_hash?: string | null
          source_id?: string | null
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          visual_format?: string | null
        }
        Update: {
          author?: string | null
          captured_at?: string | null
          category?: string | null
          confidence_score?: number | null
          content?: string | null
          content_type?: string
          created_at?: string | null
          curation_score?: number | null
          duplicate_of?: string | null
          editor_id?: string | null
          gallery_urls?: string[] | null
          highlight_type?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          ingestion_method?: string | null
          is_duplicate?: boolean | null
          lead?: string | null
          location?: string | null
          normalized_title?: string | null
          original_content?: string | null
          original_title?: string | null
          published_at?: string | null
          queued_by?: string | null
          quick_facts?: string[] | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          similarity_hash?: string | null
          source_id?: string | null
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          visual_format?: string | null
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
      daily_capture_counter: {
        Row: {
          blocked_count: number
          captured_count: number
          day: string
          updated_at: string
        }
        Insert: {
          blocked_count?: number
          captured_count?: number
          day: string
          updated_at?: string
        }
        Update: {
          blocked_count?: number
          captured_count?: number
          day?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      pipeline_logs: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          level: string | null
          message: string | null
          meta: Json | null
          node: string
          source_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          message?: string | null
          meta?: Json | null
          node: string
          source_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          message?: string | null
          meta?: Json | null
          node?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_logs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      rewrite_queue: {
        Row: {
          article_id: string
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          priority: number | null
          queued_at: string | null
          queued_by: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          article_id: string
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          priority?: number | null
          queued_at?: string | null
          queued_by?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          article_id?: string
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          priority?: number | null
          queued_at?: string | null
          queued_by?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewrite_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          allow_auto_capture: boolean | null
          allow_manual: boolean | null
          articles_captured: number | null
          blocked: boolean | null
          categories: string[] | null
          country: string | null
          created_at: string | null
          credibility: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found: number | null
          exclude_keywords: string[] | null
          feed_url: string | null
          fetch_interval_minutes: number | null
          id: string
          include_keywords: string[] | null
          is_active: boolean | null
          language: string | null
          last_fetch_at: string | null
          max_items_per_run: number | null
          name: string
          priority: number | null
          type: Database["public"]["Enums"]["source_type"] | null
          updated_at: string | null
          url: string
        }
        Insert: {
          allow_auto_capture?: boolean | null
          allow_manual?: boolean | null
          articles_captured?: number | null
          blocked?: boolean | null
          categories?: string[] | null
          country?: string | null
          created_at?: string | null
          credibility?: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found?: number | null
          exclude_keywords?: string[] | null
          feed_url?: string | null
          fetch_interval_minutes?: number | null
          id?: string
          include_keywords?: string[] | null
          is_active?: boolean | null
          language?: string | null
          last_fetch_at?: string | null
          max_items_per_run?: number | null
          name: string
          priority?: number | null
          type?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
          url: string
        }
        Update: {
          allow_auto_capture?: boolean | null
          allow_manual?: boolean | null
          articles_captured?: number | null
          blocked?: boolean | null
          categories?: string[] | null
          country?: string | null
          created_at?: string | null
          credibility?: Database["public"]["Enums"]["credibility_level"] | null
          duplicates_found?: number | null
          exclude_keywords?: string[] | null
          feed_url?: string | null
          fetch_interval_minutes?: number | null
          id?: string
          include_keywords?: string[] | null
          is_active?: boolean | null
          language?: string | null
          last_fetch_at?: string | null
          max_items_per_run?: number | null
          name?: string
          priority?: number | null
          type?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
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
      user_events: {
        Row: {
          anonymous_id: string
          article_id: string | null
          category: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["event_type_enum"]
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          anonymous_id: string
          article_id?: string | null
          category?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type_enum"]
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string
          article_id?: string | null
          category?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type_enum"]
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
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
      get_user_top_categories: {
        Args: { _anonymous_id: string; _limit?: number }
        Returns: {
          category: string
          score: number
        }[]
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_daily_capture: { Args: { _count: number }; Returns: number }
      is_duplicate_article: {
        Args: { _title: string; _url: string }
        Returns: boolean
      }
      normalize_title: { Args: { _title: string }; Returns: string }
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
        | "filtered"
        | "reviewed"
        | "queued"
        | "discarded"
      credibility_level: "high" | "medium" | "low"
      event_type_enum:
        | "impression"
        | "view"
        | "read_complete"
        | "like"
        | "save"
        | "share"
        | "ai_action"
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
        "filtered",
        "reviewed",
        "queued",
        "discarded",
      ],
      credibility_level: ["high", "medium", "low"],
      event_type_enum: [
        "impression",
        "view",
        "read_complete",
        "like",
        "save",
        "share",
        "ai_action",
      ],
      source_type: ["rss", "website", "api"],
    },
  },
} as const
