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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          agent_name: string
          description: string | null
          id: number
          prompt_template: string
          prompt_variables: string[] | null
        }
        Insert: {
          agent_name: string
          description?: string | null
          id?: number
          prompt_template: string
          prompt_variables?: string[] | null
        }
        Update: {
          agent_name?: string
          description?: string | null
          id?: number
          prompt_template?: string
          prompt_variables?: string[] | null
        }
        Relationships: []
      }
      micro_pods: {
        Row: {
          audio_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: number
          like_count: number | null
          play_count: number | null
          script_text: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: number
          like_count?: number | null
          play_count?: number | null
          script_text?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: number
          like_count?: number | null
          play_count?: number | null
          script_text?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "micro_pods_user_id_fkey"
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
      podcast_creation_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          id: number
          job_title: string | null
          micro_pod_id: number | null
          payload: Json | null
          retry_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: number
          job_title?: string | null
          micro_pod_id?: number | null
          payload?: Json | null
          retry_count?: number | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: number
          job_title?: string | null
          micro_pod_id?: number | null
          payload?: Json | null
          retry_count?: number | null
          status?: string
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
      podcast_likes: {
        Row: {
          id: number
          liked_at: string
          podcast_id: number
          user_id: string
        }
        Insert: {
          id?: number
          liked_at?: string
          podcast_id: number
          user_id: string
        }
        Update: {
          id?: number
          liked_at?: string
          podcast_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_likes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_plays: {
        Row: {
          id: number
          played_at: string
          podcast_id: number
          user_id: string | null
        }
        Insert: {
          id?: number
          played_at?: string
          podcast_id: number
          user_id?: string | null
        }
        Update: {
          id?: number
          played_at?: string
          podcast_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_plays_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          plan_id: number | null
          status: string
        }
        Insert: {
          id: string
          plan_id?: number | null
          status: string
        }
        Update: {
          id?: string
          plan_id?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
