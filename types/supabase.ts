// types/supabase.ts
// VERSIÓN FINAL Y ROBUSTA QUE EXPORTA TIPOS DE UTILIDAD

// [INTERVENCIÓN ARQUITECTÓNICA]: Se añade este bloque para convertir el archivo en un módulo
// y proporcionar tipos de utilidad que harán toda la aplicación más robusta.
export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row']
export type Enums<
  T extends keyof Database['public']['Enums']
> = Database['public']['Enums'][T]

// -----------------------------------------------------------------------------------
// El siguiente bloque es el que genera la CLI de Supabase.
// Si vuelves a ejecutar `npx supabase gen types...`, solo necesitas reemplazar
// el contenido de aquí hacia abajo.
// -----------------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      micro_pods: {
        Row: {
          audio_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          creation_data: Json | null
          description: string | null
          duration_seconds: number | null
          id: number
          like_count: number
          play_count: number
          script_text: string | null
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creation_data?: Json | null
          description?: string | null
          duration_seconds?: number | null
          id?: number
          like_count?: number
          play_count?: number
          script_text?: string | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creation_data?: Json | null
          description?: string | null
          duration_seconds?: number | null
          id?: number
          like_count?: number
          play_count?: number
          script_text?: string | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "micro_pods_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_creation_jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_testimonials_profile_user_id_fkey"
            columns: ["profile_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_profile_and_free_subscription: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          aud: string
          role: string
          email: string
          phone: string
          created_at: string
          updated_at: string
          email_confirmed_at: string
          phone_confirmed_at: string
          last_sign_in_at: string
          app_metadata: Json
          user_metadata: Json
          identities: Json
          is_anonymous: boolean
        }
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      increment_jobs_and_queue: {
        Args: {
          p_user_id: string
          p_payload: Json
        }
        Returns: number
      }
      notify_job_processor: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      search_podcasts: {
        Args: {
          search_term: string
        }
        Returns: {
          id: number
          user_id: string
          title: string
          description: string
          script_text: string
          audio_url: string
          cover_image_url: string
          duration_seconds: number
          category: string
          status: Database["public"]["Enums"]["podcast_status"]
          play_count: number
          like_count: number
          created_at: string
          updated_at: string
          creation_data: Json
          profiles: Json
        }[]
      }
      update_follow_counts: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_like_count: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      job_status: "pending" | "processing" | "completed" | "failed"
      podcast_status:
        | "pending_approval"
        | "published"
        | "archived"
        | "failed"
      subscription_status:
        | "active"
        | "inactive"
        | "trialing"
        | "past_due"
      testimonial_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}