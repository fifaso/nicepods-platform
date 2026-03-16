export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          agent_name: string
          agent_type: Database["public"]["Enums"]["agent_type"]
          description: string | null
          id: number
          model_identifier: string | null
          output_schema: Json | null
          parameters: Json | null
          prompt_template: string
          prompt_variables: string[] | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
          version: number
        }
        Insert: {
          agent_name: string
          agent_type?: Database["public"]["Enums"]["agent_type"]
          description?: string | null
          id?: number
          model_identifier?: string | null
          output_schema?: Json | null
          parameters?: Json | null
          prompt_template: string
          prompt_variables?: string[] | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          agent_name?: string
          agent_type?: Database["public"]["Enums"]["agent_type"]
          description?: string | null
          id?: number
          model_identifier?: string | null
          output_schema?: Json | null
          parameters?: Json | null
          prompt_template?: string
          prompt_variables?: string[] | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string | null
          function_name: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          function_name: string
          id?: never
          user_id: string
        }
        Update: {
          created_at?: string | null
          function_name?: string
          id?: never
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          podcast_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          podcast_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          podcast_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_pods: {
        Row: {
          admin_notes: string | null
          agent_version: string | null
          ai_consistency_drift: Json | null
          ai_coordinates: unknown
          ai_summary: string | null
          ai_tags: string[] | null
          audio_url: string | null
          category: string | null
          consistency_level:
            | Database["public"]["Enums"]["consistency_level"]
            | null
          cover_image_url: string | null
          created_at: string
          creation_context: Json | null
          creation_data: Json | null
          creation_mode: string | null
          description: string | null
          duration_seconds: number | null
          final_coordinates: unknown
          id: number
          is_featured: boolean | null
          like_count: number
          narrative_lens: string | null
          parent_id: number | null
          play_count: number
          processing_status: Database["public"]["Enums"]["processing_status"]
          published_at: string | null
          quote_context: string | null
          quote_timestamp: number | null
          reviewed_by_user: boolean | null
          root_id: number | null
          script_text: string | null
          sources: Json | null
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at: string
          user_id: string
          user_tags: string[] | null
        }
        Insert: {
          admin_notes?: string | null
          agent_version?: string | null
          ai_consistency_drift?: Json | null
          ai_coordinates?: unknown
          ai_summary?: string | null
          ai_tags?: string[] | null
          audio_url?: string | null
          category?: string | null
          consistency_level?:
            | Database["public"]["Enums"]["consistency_level"]
            | null
          cover_image_url?: string | null
          created_at?: string
          creation_context?: Json | null
          creation_data?: Json | null
          creation_mode?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_coordinates?: unknown
          id?: number
          is_featured?: boolean | null
          like_count?: number
          narrative_lens?: string | null
          parent_id?: number | null
          play_count?: number
          processing_status?: Database["public"]["Enums"]["processing_status"]
          published_at?: string | null
          quote_context?: string | null
          quote_timestamp?: number | null
          reviewed_by_user?: boolean | null
          root_id?: number | null
          script_text?: string | null
          sources?: Json | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at?: string
          user_id: string
          user_tags?: string[] | null
        }
        Update: {
          admin_notes?: string | null
          agent_version?: string | null
          ai_consistency_drift?: Json | null
          ai_coordinates?: unknown
          ai_summary?: string | null
          ai_tags?: string[] | null
          audio_url?: string | null
          category?: string | null
          consistency_level?:
            | Database["public"]["Enums"]["consistency_level"]
            | null
          cover_image_url?: string | null
          created_at?: string
          creation_context?: Json | null
          creation_data?: Json | null
          creation_mode?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_coordinates?: unknown
          id?: number
          is_featured?: boolean | null
          like_count?: number
          narrative_lens?: string | null
          parent_id?: number | null
          play_count?: number
          processing_status?: Database["public"]["Enums"]["processing_status"]
          published_at?: string | null
          quote_context?: string | null
          quote_timestamp?: number | null
          reviewed_by_user?: boolean | null
          root_id?: number | null
          script_text?: string | null
          sources?: Json | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title?: string
          updated_at?: string
          user_id?: string
          user_tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "micro_pods_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "micro_pods_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "micro_pods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: number
          is_read: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
          is_read?: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
          is_read?: boolean
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          description: string | null
          features: string[] | null
          id: number
          monthly_creation_limit: number
          name: string
          price_monthly: number | null
        }
        Insert: {
          active?: boolean
          description?: string | null
          features?: string[] | null
          id?: number
          monthly_creation_limit?: number
          name: string
          price_monthly?: number | null
        }
        Update: {
          active?: boolean
          description?: string | null
          features?: string[] | null
          id?: number
          monthly_creation_limit?: number
          name?: string
          price_monthly?: number | null
        }
        Relationships: []
      }
      platform_limits: {
        Row: {
          created_at: string | null
          id: number
          key_name: string
          max_listening_minutes: number | null
          max_podcasts_per_month: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          key_name: string
          max_listening_minutes?: number | null
          max_podcasts_per_month?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          key_name?: string
          max_listening_minutes?: number | null
          max_podcasts_per_month?: number | null
        }
        Relationships: []
      }
      playback_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["interaction_event_type"]
          id: number
          podcast_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["interaction_event_type"]
          id?: number
          podcast_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["interaction_event_type"]
          id?: number
          podcast_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playback_events_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playback_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_analysis_history: {
        Row: {
          agent_version: string
          analysis_data: Json
          analysis_id: string
          created_at: string
          podcast_id: number
          triggered_by: string
        }
        Insert: {
          agent_version: string
          analysis_data: Json
          analysis_id?: string
          created_at?: string
          podcast_id: number
          triggered_by?: string
        }
        Update: {
          agent_version?: string
          analysis_data?: Json
          analysis_id?: string
          created_at?: string
          podcast_id?: number
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_analysis_history_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_creation_jobs: {
        Row: {
          archived: boolean
          created_at: string
          error_message: string | null
          id: number
          job_title: string | null
          micro_pod_id: number | null
          payload: Json | null
          retry_count: number
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          error_message?: string | null
          id?: number
          job_title?: string | null
          micro_pod_id?: number | null
          payload?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          error_message?: string | null
          id?: number
          job_title?: string | null
          micro_pod_id?: number | null
          payload?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_creation_jobs_micro_pod_id_fkey"
            columns: ["micro_pod_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_creation_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_embeddings: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          podcast_id: number
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: never
          podcast_id: number
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: never
          podcast_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "podcast_embeddings_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_errors: {
        Row: {
          created_at: string
          error_message: string | null
          error_stack: string | null
          id: number
          podcast_id: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          error_stack?: string | null
          id?: number
          podcast_id?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          error_stack?: string | null
          id?: number
          podcast_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_errors_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_testimonials: {
        Row: {
          author_user_id: string
          comment_text: string
          created_at: string
          id: number
          profile_user_id: string
          status: Database["public"]["Enums"]["testimonial_status"]
        }
        Insert: {
          author_user_id: string
          comment_text: string
          created_at?: string
          id?: number
          profile_user_id: string
          status?: Database["public"]["Enums"]["testimonial_status"]
        }
        Update: {
          author_user_id?: string
          comment_text?: string
          created_at?: string
          id?: number
          profile_user_id?: string
          status?: Database["public"]["Enums"]["testimonial_status"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_testimonials_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_testimonials_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_creation_jobs: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          followers_count: number
          following_count: number
          full_name: string | null
          id: string
          role: string
          stripe_customer_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          active_creation_jobs?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          active_creation_jobs?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          plan_id: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          plan_id: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          plan_id?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_resonance_profiles: {
        Row: {
          created_at: string
          current_center: unknown
          last_calculated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_center?: unknown
          last_calculated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_center?: unknown
          last_calculated_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_resonance_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          last_reset_date: string | null
          minutes_listened_this_month: number | null
          podcasts_created_this_month: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_reset_date?: string | null
          minutes_listened_this_month?: number | null
          podcasts_created_this_month?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_reset_date?: string | null
          minutes_listened_this_month?: number | null
          podcasts_created_this_month?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_limit: number
          p_user_id: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      get_curated_library_shelves: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_generic_library_shelves: { Args: never; Returns: Json }
      get_resonant_podcasts: {
        Args: { center_point: unknown; count_limit: number }
        Returns: {
          admin_notes: string | null
          agent_version: string | null
          ai_consistency_drift: Json | null
          ai_coordinates: unknown
          ai_summary: string | null
          ai_tags: string[] | null
          audio_url: string | null
          category: string | null
          consistency_level:
            | Database["public"]["Enums"]["consistency_level"]
            | null
          cover_image_url: string | null
          created_at: string
          creation_context: Json | null
          creation_data: Json | null
          creation_mode: string | null
          description: string | null
          duration_seconds: number | null
          final_coordinates: unknown
          id: number
          is_featured: boolean | null
          like_count: number
          narrative_lens: string | null
          parent_id: number | null
          play_count: number
          processing_status: Database["public"]["Enums"]["processing_status"]
          published_at: string | null
          quote_context: string | null
          quote_timestamp: number | null
          reviewed_by_user: boolean | null
          root_id: number | null
          script_text: string | null
          sources: Json | null
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at: string
          user_id: string
          user_tags: string[] | null
        }[]
        SetofOptions: {
          from: "*"
          to: "micro_pods"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_discovery_feed: { Args: { p_user_id: string }; Returns: Json }
      handle_zombie_jobs: { Args: never; Returns: undefined }
      hybrid_search: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          content: string
          id: number
          podcast_id: number
          similarity: number
        }[]
      }
      increment_jobs_and_queue: {
        Args: { p_payload: Json; p_user_id: string }
        Returns: number
      }
      increment_play_count: { Args: { podcast_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      mark_notifications_as_read: { Args: never; Returns: undefined }
      reset_monthly_quotas: { Args: never; Returns: undefined }
      save_analysis_and_embedding: {
        Args: {
          p_agent_version: string
          p_ai_coordinates: unknown
          p_ai_summary: string
          p_ai_tags: string[]
          p_consistency_level: Database["public"]["Enums"]["consistency_level"]
          p_embedding: string
          p_narrative_lens: string
          p_podcast_id: number
        }
        Returns: undefined
      }
      search_omni: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: number[]
          query_text: string
        }
        Returns: {
          id: string
          image_url: string
          similarity: number
          subtitle: string
          title: string
          type: string
        }[]
      }
      search_podcasts: {
        Args: { search_term: string }
        Returns: {
          audio_url: string
          category: string
          cover_image_url: string
          created_at: string
          creation_data: Json
          description: string
          duration_seconds: number
          id: number
          like_count: number
          play_count: number
          profiles: Json
          script_text: string
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at: string
          user_id: string
        }[]
      }
    }
    Enums: {
      agent_status: "active" | "experimental" | "archived"
      agent_type: "script" | "image"
      consistency_level: "high" | "medium" | "low"
      interaction_event_type: "completed_playback" | "liked" | "shared"
      job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "pending_audio"
      notification_type:
        | "podcast_created_success"
        | "podcast_created_failure"
        | "new_follower"
        | "new_like"
        | "new_podcast_from_followed_user"
        | "new_testimonial"
      podcast_status: "pending_approval" | "published" | "archived" | "failed"
      processing_status: "pending" | "processing" | "completed" | "failed"
      subscription_status: "active" | "inactive" | "trialing" | "past_due"
      testimonial_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      podcast_shelf_item: {
        id: number | null
        title: string | null
        description: string | null
        audio_url: string | null
        cover_image_url: string | null
        duration_seconds: number | null
        like_count: number | null
        play_count: number | null
        created_at: string | null
        user_id: string | null
        status: Database["public"]["Enums"]["podcast_status"] | null
        creation_data: Json | null
        final_coordinates: unknown
        ai_tags: string[] | null
        profiles: Json | null
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_status: ["active", "experimental", "archived"],
      agent_type: ["script", "image"],
      consistency_level: ["high", "medium", "low"],
      interaction_event_type: ["completed_playback", "liked", "shared"],
      job_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "pending_audio",
      ],
      notification_type: [
        "podcast_created_success",
        "podcast_created_failure",
        "new_follower",
        "new_like",
        "new_podcast_from_followed_user",
        "new_testimonial",
      ],
      podcast_status: ["pending_approval", "published", "archived", "failed"],
      processing_status: ["pending", "processing", "completed", "failed"],
      subscription_status: ["active", "inactive", "trialing", "past_due"],
      testimonial_status: ["pending", "approved", "rejected"],
    },
  },
} as const

