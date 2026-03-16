// types/database.types.ts
// VERSIÓN: 12.6 (NicePod V2.6 - Sovereign DB Architecture Final)
// Misión: Unificar el esquema global de la plataforma con la Soberanía Geoespacial.
// [ESTABILIZACIÓN]: Re-inyección de website_url y campos sociales para eliminar fallos de build.

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
      // --- CAPA DE INTELIGENCIA (AGENTES) ---
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

      // --- CAPA GEOESPACIAL (MALLA URBANA V2.6) ---
      points_of_interest: {
        Row: {
          id: number
          author_id: string
          name: string
          category_id: string
          geo_location: any // Mapeado a GeoPoint en geo-sovereignty.ts
          historical_fact: string | null
          rich_description: string | null
          gallery_urls: string[]
          ambient_audio_url: string | null
          resonance_radius: number
          importance_score: number
          status: Database["public"]["Enums"]["poi_lifecycle"]
          is_published: boolean
          reference_podcast_id: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          author_id?: string
          name: string
          category_id: string
          geo_location: any
          historical_fact?: string | null
          rich_description?: string | null
          gallery_urls?: string[]
          ambient_audio_url?: string | null
          resonance_radius?: number
          importance_score?: number
          status?: Database["public"]["Enums"]["poi_lifecycle"]
          is_published?: boolean
          reference_podcast_id?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          name?: string
          category_id?: string
          geo_location?: any
          historical_fact?: string | null
          rich_description?: string | null
          gallery_urls?: string[]
          ambient_audio_url?: string | null
          resonance_radius?: number
          importance_score?: number
          status?: Database["public"]["Enums"]["poi_lifecycle"]
          is_published?: boolean
          reference_podcast_id?: number | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_of_interest_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      poi_ingestion_buffer: {
        Row: {
          id: number
          poi_id: number
          raw_ocr_text: string | null
          weather_snapshot: Json
          visual_analysis_dossier: Json
          sensor_accuracy: number
          ingested_at: string
        }
        Insert: {
          id?: number
          poi_id: number
          raw_ocr_text?: string | null
          weather_snapshot?: Json
          visual_analysis_dossier?: Json
          sensor_accuracy: number
          ingested_at?: string
        }
        Update: {
          raw_ocr_text?: string | null
          weather_snapshot?: Json
          visual_analysis_dossier?: Json
          sensor_accuracy?: number
        }
        Relationships: [
          {
            foreignKeyName: "poi_ingestion_buffer_poi_id_fkey"
            columns: ["poi_id"]
            referencedRelation: "points_of_interest"
            referencedColumns: ["id"]
          }
        ]
      }

      // --- CONOCIMIENTO UNIVERSAL (PODCASTS) ---
      micro_pods: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string | null
          script_text: Json | null
          audio_url: string | null
          cover_image_url: string | null
          duration_seconds: number | null
          status: Database["public"]["Enums"]["podcast_status"]
          processing_status: Database["public"]["Enums"]["processing_status"]
          audio_ready: boolean | null
          image_ready: boolean | null
          embedding_ready: boolean | null
          creation_data: Json | null
          sources: Json | null
          created_at: string
          updated_at: string
          like_count: number
          play_count: number
          category: string | null
          creation_mode: string | null
          parent_id: number | null
          root_id: number | null
          final_coordinates: any
          review_by_user: boolean | null
          reviewed_by_user: boolean | null
          admin_notes: string | null
          narrative_lens: string | null
          consistency_level: Database["public"]["Enums"]["consistency_level"] | null
          audio_assembly_status: Database["public"]["Enums"]["assembly_status"] | null
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description?: string | null
          script_text?: Json | null
          audio_url?: string | null
          cover_image_url?: string | null
          duration_seconds?: number | null
          status?: Database["public"]["Enums"]["podcast_status"]
          processing_status?: Database["public"]["Enums"]["processing_status"]
          audio_ready?: boolean | null
          image_ready?: boolean | null
          embedding_ready?: boolean | null
          creation_data?: Json | null
          sources?: Json | null
          created_at?: string
          updated_at?: string
          like_count?: number
          play_count?: number
          category?: string | null
          creation_mode?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          script_text?: Json | null
          audio_url?: string | null
          cover_image_url?: string | null
          duration_seconds?: number | null
          status?: Database["public"]["Enums"]["podcast_status"]
          processing_status?: Database["public"]["Enums"]["processing_status"]
          audio_ready?: boolean | null
          image_ready?: boolean | null
          embedding_ready?: boolean | null
          creation_data?: Json | null
          sources?: Json | null
          updated_at?: string
          like_count?: number
          play_count?: number
          category?: string | null
          creation_mode?: string | null
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

      // --- INFRAESTRUCTURA SOCIAL Y PERFILES ---
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: string
          reputation_score: number | null
          created_at: string
          updated_at: string
          bio: string | null
          bio_short: string | null
          website_url: string | null // [FIX CRÍTICO]: Restaurado para eliminar error en Identity Form
          active_creation_jobs: number
          followers_count: number
          following_count: number
          stripe_customer_id: string | null
          is_verified: boolean | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          reputation_score?: number | null
          created_at?: string
          updated_at?: string
          bio?: string | null
          bio_short?: string | null
          website_url?: string | null
          active_creation_jobs?: number
          is_verified?: boolean | null
        }
        Update: {
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          reputation_score?: number | null
          updated_at?: string
          bio?: string | null
          bio_short?: string | null
          website_url?: string | null
          active_creation_jobs?: number
          is_verified?: boolean | null
        }
        Relationships: []
      }

      // --- GESTIÓN DE PAGOS Y LIMITES ---
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          plan_id: number
          status: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Update: {
          status?: Database["public"]["Enums"]["subscription_status"]
          plan_id?: number
          current_period_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "plans"
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
          max_concurrent_drafts: number | null
          name: string
          price_monthly: number | null
        }
        Insert: {
          name: string
          monthly_creation_limit: number
        }
        Update: {
          active?: boolean
          name?: string
          monthly_creation_limit?: number
        }
        Relationships: []
      }

      // --- COLA DE PROCESAMIENTO ---
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
          user_id: string
          job_title?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          payload?: Json | null
        }
        Update: {
          status?: Database["public"]["Enums"]["job_status"]
          error_message?: string | null
          retry_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      vw_map_resonance_active: {
        Row: {
          id: number | null
          name: string | null
          category_id: string | null
          category: string | null
          geo_location: any
          historical_fact: string | null
          importance_score: number | null
          resonance_radius: number | null
          gallery_urls: Json | null
          ambient_audio_url: string | null
          status: Database["public"]["Enums"]["poi_lifecycle"] | null
        }
      }
    }
    Functions: {
      is_admin: {
        Args: never
        Returns: boolean
      }
      promote_draft_to_production_v2: {
        Args: {
          p_draft_id: number
          p_final_script: Json
          p_final_title: string
          p_sources?: Json
        }
        Returns: {
          message: string
          pod_id: number
          success: boolean
        }[]
      }
    }
    Enums: {
      agent_status: "active" | "experimental" | "archived"
      agent_type: "script" | "image"
      poi_lifecycle: "ingested" | "analyzed" | "narrated" | "published" | "archived"
      podcast_status: "pending_approval" | "published" | "archived" | "failed" | "draft"
      processing_status: "pending" | "processing" | "completed" | "failed"
      subscription_status: "active" | "inactive" | "trialing" | "past_due"
      assembly_status: "idle" | "collecting" | "assembling" | "completed" | "failed"
      job_status: "pending" | "processing" | "completed" | "failed" | "pending_audio"
      testimonial_status: "pending" | "approved" | "rejected"
      consistency_level: "high" | "medium" | "low"
      notification_type: "podcast_created_success" | "podcast_created_failure" | "new_follower" | "new_like" | "new_podcast_from_followed_user" | "new_testimonial"
    }
  }
}

/**
 * HELPER TYPES: Sincronía determinista para componentes React
 */
export type Tables<
  T extends keyof (Database['public']['Tables'] & Database['public']['Views'])
> = T extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][T]['Row']
  : T extends keyof Database['public']['Views']
  ? Database['public']['Views'][T]['Row']
  : never;

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];