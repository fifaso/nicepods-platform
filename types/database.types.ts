// types/database.types.ts
// VERSIÓN: 12.0 (NicePod DB Restoration - Full System Integration)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
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
      }
      points_of_interest: {
        Row: {
          id: number
          author_id: string
          name: string
          category_id: string
          geo_location: unknown
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
      }
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
          review_by_user: boolean | null
          admin_notes: string | null
          creation_mode: string | null
          parent_id: number | null
          root_id: number | null
          final_coordinates: unknown
          reviewed_by_user: boolean | null
          ai_tags: string[] | null
          user_tags: string[] | null
          place_name: string | null
          quote_context: string | null
          quote_timestamp: number | null
          current_audio_segments: number | null
          total_audio_segments: number | null
          audio_assembly_status: Database["public"]["Enums"]["assembly_status"] | null
          consistency_level: Database["public"]["Enums"]["consistency_level"] | null
          narrative_lens: string | null
        }
      }
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
          active_creation_jobs: number
          followers_count: number
          following_count: number
          stripe_customer_id: string | null
          is_verified: boolean | null
          bio_short: string | null
        }
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
      }
      podcast_embeddings: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          podcast_id: number
        }
      }
    }
    Views: {
      vw_map_resonance_active: {
        Row: {
          id: number | null
          name: string | null
          category_id: string | null
          category: string | null
          geo_location: unknown
          historical_fact: string | null
          importance_score: number | null
          resonance_radius: number | null
          gallery_urls: Json | null
          ambient_audio_url: string | null
          status: Database["public"]["Enums"]["poi_lifecycle"] | null
        }
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];