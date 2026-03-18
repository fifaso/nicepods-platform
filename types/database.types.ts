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
      audio_echoes: {
        Row: {
          audio_url: string
          author_id: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          parent_pod_id: number
          transcript: string | null
        }
        Insert: {
          audio_url: string
          author_id: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          parent_pod_id: number
          transcript?: string | null
        }
        Update: {
          audio_url?: string
          author_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          parent_pod_id?: number
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_echoes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_echoes_parent_pod_id_fkey"
            columns: ["parent_pod_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_segments: {
        Row: {
          byte_size: number | null
          created_at: string | null
          id: string
          podcast_id: number | null
          segment_index: number
          status: string | null
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          byte_size?: number | null
          created_at?: string | null
          id?: string
          podcast_id?: number | null
          segment_index: number
          status?: string | null
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          byte_size?: number | null
          created_at?: string | null
          id?: string
          podcast_id?: number | null
          segment_index?: number
          status?: string | null
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_segments_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          added_at: string | null
          collection_id: string
          curator_note: string | null
          pod_id: number
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          curator_note?: string | null
          pod_id: number
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          curator_note?: string | null
          pod_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          owner_id: string
          title: string
          total_listened_count: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          owner_id: string
          title: string
          total_listened_count?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          owner_id?: string
          title?: string
          total_listened_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      geo_drafts_staging: {
        Row: {
          accuracy_meters: number | null
          altitude: number | null
          created_at: string | null
          detected_place_id: string | null
          heading: number | null
          id: number
          location: unknown
          rejection_reason: string | null
          status: string | null
          user_id: string
          vision_analysis: Json | null
          weather_snapshot: Json | null
        }
        Insert: {
          accuracy_meters?: number | null
          altitude?: number | null
          created_at?: string | null
          detected_place_id?: string | null
          heading?: number | null
          id?: number
          location: unknown
          rejection_reason?: string | null
          status?: string | null
          user_id: string
          vision_analysis?: Json | null
          weather_snapshot?: Json | null
        }
        Update: {
          accuracy_meters?: number | null
          altitude?: number | null
          created_at?: string | null
          detected_place_id?: string | null
          heading?: number | null
          id?: number
          location?: unknown
          rejection_reason?: string | null
          status?: string | null
          user_id?: string
          vision_analysis?: Json | null
          weather_snapshot?: Json | null
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          source_id: string
          token_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          source_id: string
          token_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          source_id?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          content_hash: string
          created_at: string | null
          id: string
          is_public: boolean | null
          last_cited_at: string | null
          metadata: Json | null
          reputation_score: number | null
          source_type: string
          title: string
          url: string | null
        }
        Insert: {
          content_hash: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          last_cited_at?: string | null
          metadata?: Json | null
          reputation_score?: number | null
          source_type: string
          title: string
          url?: string | null
        }
        Update: {
          content_hash?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          last_cited_at?: string | null
          metadata?: Json | null
          reputation_score?: number | null
          source_type?: string
          title?: string
          url?: string | null
        }
        Relationships: []
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
      madrid_vault_knowledge: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          source_authority: string | null
          valid_geo_bounds: unknown
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_authority?: string | null
          valid_geo_bounds?: unknown
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_authority?: string | null
          valid_geo_bounds?: unknown
        }
        Relationships: []
      }
      micro_pods: {
        Row: {
          admin_notes: string | null
          agent_version: string | null
          ai_summary: string | null
          ai_tags: string[] | null
          audio_assembly_status:
            | Database["public"]["Enums"]["assembly_status"]
            | null
          audio_ready: boolean | null
          audio_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          creation_data: Json | null
          creation_mode: string | null
          current_audio_segments: number | null
          description: string | null
          duration_seconds: number | null
          embedding_ready: boolean | null
          geo_location: unknown
          id: number
          image_ready: boolean | null
          is_featured: boolean | null
          like_count: number
          narrative_lens: string | null
          parent_id: number | null
          place_name: string | null
          play_count: number
          processing_status: Database["public"]["Enums"]["processing_status"]
          published_at: string | null
          quote_context: string | null
          quote_timestamp: number | null
          reviewed_by_user: boolean | null
          root_id: number | null
          script_text: Json | null
          sources: Json | null
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          total_audio_segments: number | null
          updated_at: string
          user_id: string
          user_tags: string[] | null
        }
        Insert: {
          admin_notes?: string | null
          agent_version?: string | null
          ai_summary?: string | null
          ai_tags?: string[] | null
          audio_assembly_status?:
            | Database["public"]["Enums"]["assembly_status"]
            | null
          audio_ready?: boolean | null
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creation_data?: Json | null
          creation_mode?: string | null
          current_audio_segments?: number | null
          description?: string | null
          duration_seconds?: number | null
          embedding_ready?: boolean | null
          geo_location?: unknown
          id?: number
          image_ready?: boolean | null
          is_featured?: boolean | null
          like_count?: number
          narrative_lens?: string | null
          parent_id?: number | null
          place_name?: string | null
          play_count?: number
          processing_status?: Database["public"]["Enums"]["processing_status"]
          published_at?: string | null
          quote_context?: string | null
          quote_timestamp?: number | null
          reviewed_by_user?: boolean | null
          root_id?: number | null
          script_text?: Json | null
          sources?: Json | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title: string
          total_audio_segments?: number | null
          updated_at?: string
          user_id: string
          user_tags?: string[] | null
        }
        Update: {
          admin_notes?: string | null
          agent_version?: string | null
          ai_summary?: string | null
          ai_tags?: string[] | null
          audio_assembly_status?:
            | Database["public"]["Enums"]["assembly_status"]
            | null
          audio_ready?: boolean | null
          audio_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creation_data?: Json | null
          creation_mode?: string | null
          current_audio_segments?: number | null
          description?: string | null
          duration_seconds?: number | null
          embedding_ready?: boolean | null
          geo_location?: unknown
          id?: number
          image_ready?: boolean | null
          is_featured?: boolean | null
          like_count?: number
          narrative_lens?: string | null
          parent_id?: number | null
          place_name?: string | null
          play_count?: number
          processing_status?: Database["public"]["Enums"]["processing_status"]
          published_at?: string | null
          quote_context?: string | null
          quote_timestamp?: number | null
          reviewed_by_user?: boolean | null
          root_id?: number | null
          script_text?: Json | null
          sources?: Json | null
          status?: Database["public"]["Enums"]["podcast_status"]
          title?: string
          total_audio_segments?: number | null
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
      place_memories: {
        Row: {
          content_type: string | null
          focus_entity: string | null
          geo_location: unknown
          pod_id: number
          poi_id: number
          relevance_score: number | null
          vibe_vector: string | null
        }
        Insert: {
          content_type?: string | null
          focus_entity?: string | null
          geo_location?: unknown
          pod_id: number
          poi_id: number
          relevance_score?: number | null
          vibe_vector?: string | null
        }
        Update: {
          content_type?: string | null
          focus_entity?: string | null
          geo_location?: unknown
          pod_id?: number
          poi_id?: number
          relevance_score?: number | null
          vibe_vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_memories_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_memories_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "points_of_interest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_memories_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "vw_map_resonance_active"
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
          max_concurrent_drafts: number | null
          max_monthly_drafts: number | null
          monthly_creation_limit: number
          name: string
          price_monthly: number | null
        }
        Insert: {
          active?: boolean
          description?: string | null
          features?: string[] | null
          id?: number
          max_concurrent_drafts?: number | null
          max_monthly_drafts?: number | null
          monthly_creation_limit?: number
          name: string
          price_monthly?: number | null
        }
        Update: {
          active?: boolean
          description?: string | null
          features?: string[] | null
          id?: number
          max_concurrent_drafts?: number | null
          max_monthly_drafts?: number | null
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
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          key_name: string
          max_listening_minutes?: number | null
          max_podcasts_per_month?: number | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          key_name?: string
          max_listening_minutes?: number | null
          max_podcasts_per_month?: number | null
          value?: string | null
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
      podcast_drafts: {
        Row: {
          created_at: string | null
          creation_data: Json
          dossier_text: Json | null
          id: number
          script_text: Json
          sources: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creation_data: Json
          dossier_text?: Json | null
          id?: number
          script_text: Json
          sources?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creation_data?: Json
          dossier_text?: Json | null
          id?: number
          script_text?: Json
          sources?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
            isOneToOne: true
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      poi_ingestion_buffer: {
        Row: {
          id: number
          ingested_at: string | null
          poi_id: number | null
          raw_ocr_text: string | null
          sensor_accuracy: number | null
          visual_analysis_dossier: Json | null
          weather_snapshot: Json | null
        }
        Insert: {
          id?: number
          ingested_at?: string | null
          poi_id?: number | null
          raw_ocr_text?: string | null
          sensor_accuracy?: number | null
          visual_analysis_dossier?: Json | null
          weather_snapshot?: Json | null
        }
        Update: {
          id?: number
          ingested_at?: string | null
          poi_id?: number | null
          raw_ocr_text?: string | null
          sensor_accuracy?: number | null
          visual_analysis_dossier?: Json | null
          weather_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "poi_ingestion_buffer_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "points_of_interest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poi_ingestion_buffer_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "vw_map_resonance_active"
            referencedColumns: ["id"]
          },
        ]
      }
      points_of_interest: {
        Row: {
          ambient_audio_url: string | null
          author_id: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          embedding: string | null
          evidence_data: Json | null
          gallery_urls: Json | null
          geo_location: unknown
          historical_fact: string | null
          id: number
          image_summary: string | null
          importance_score: number | null
          is_published: boolean | null
          metadata: Json | null
          name: string
          reference_podcast_id: number | null
          resonance_radius: number | null
          rich_description: string | null
          status: Database["public"]["Enums"]["poi_lifecycle"] | null
          updated_at: string | null
        }
        Insert: {
          ambient_audio_url?: string | null
          author_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          evidence_data?: Json | null
          gallery_urls?: Json | null
          geo_location: unknown
          historical_fact?: string | null
          id?: number
          image_summary?: string | null
          importance_score?: number | null
          is_published?: boolean | null
          metadata?: Json | null
          name: string
          reference_podcast_id?: number | null
          resonance_radius?: number | null
          rich_description?: string | null
          status?: Database["public"]["Enums"]["poi_lifecycle"] | null
          updated_at?: string | null
        }
        Update: {
          ambient_audio_url?: string | null
          author_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          evidence_data?: Json | null
          gallery_urls?: Json | null
          geo_location?: unknown
          historical_fact?: string | null
          id?: number
          image_summary?: string | null
          importance_score?: number | null
          is_published?: boolean | null
          metadata?: Json | null
          name?: string
          reference_podcast_id?: number | null
          resonance_radius?: number | null
          rich_description?: string | null
          status?: Database["public"]["Enums"]["poi_lifecycle"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_poi_pod_reference"
            columns: ["reference_podcast_id"]
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
          bio_short: string | null
          created_at: string
          followers_count: number
          following_count: number
          full_name: string | null
          id: string
          is_verified: boolean | null
          reputation_score: number | null
          role: string
          stripe_customer_id: string | null
          updated_at: string
          username: string
          website_url: string | null
        }
        Insert: {
          active_creation_jobs?: number
          avatar_url?: string | null
          bio?: string | null
          bio_short?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          reputation_score?: number | null
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string
          username: string
          website_url?: string | null
        }
        Update: {
          active_creation_jobs?: number
          avatar_url?: string | null
          bio?: string | null
          bio_short?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          reputation_score?: number | null
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      pulse_staging: {
        Row: {
          authority_score: number | null
          cluster_id: string | null
          content_hash: string
          content_type: Database["public"]["Enums"]["content_category"]
          created_at: string | null
          embedding: string | null
          expires_at: string | null
          id: string
          is_high_value: boolean | null
          source_name: string
          summary: string
          title: string
          url: string
          usage_count: number | null
          veracity_verified: boolean | null
        }
        Insert: {
          authority_score?: number | null
          cluster_id?: string | null
          content_hash: string
          content_type?: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          is_high_value?: boolean | null
          source_name: string
          summary: string
          title: string
          url: string
          usage_count?: number | null
          veracity_verified?: boolean | null
        }
        Update: {
          authority_score?: number | null
          cluster_id?: string | null
          content_hash?: string
          content_type?: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          is_high_value?: boolean | null
          source_name?: string
          summary?: string
          title?: string
          url?: string
          usage_count?: number | null
          veracity_verified?: boolean | null
        }
        Relationships: []
      }
      research_backlog: {
        Row: {
          created_at: string | null
          id: number
          last_error: string | null
          metadata: Json | null
          priority_level: number | null
          request_count: number | null
          status: Database["public"]["Enums"]["backlog_status"] | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_error?: string | null
          metadata?: Json | null
          priority_level?: number | null
          request_count?: number | null
          status?: Database["public"]["Enums"]["backlog_status"] | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          last_error?: string | null
          metadata?: Json | null
          priority_level?: number | null
          request_count?: number | null
          status?: Database["public"]["Enums"]["backlog_status"] | null
          topic?: string
          updated_at?: string | null
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
      user_interest_dna: {
        Row: {
          dna_vector: string
          expertise_level: number | null
          last_updated: string | null
          negative_interests: string[] | null
          professional_profile: string | null
          total_pulses_generated: number | null
          user_id: string
        }
        Insert: {
          dna_vector: string
          expertise_level?: number | null
          last_updated?: string | null
          negative_interests?: string[] | null
          professional_profile?: string | null
          total_pulses_generated?: number | null
          user_id: string
        }
        Update: {
          dna_vector?: string
          expertise_level?: number | null
          last_updated?: string | null
          negative_interests?: string[] | null
          professional_profile?: string | null
          total_pulses_generated?: number | null
          user_id?: string
        }
        Relationships: []
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
          drafts_created_this_month: number | null
          last_reset_date: string | null
          minutes_listened_this_month: number | null
          podcasts_created_this_month: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          drafts_created_this_month?: number | null
          last_reset_date?: string | null
          minutes_listened_this_month?: number | null
          podcasts_created_this_month?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          drafts_created_this_month?: number | null
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
      geo_diagnostic_v25: {
        Row: {
          coordinate_text: string | null
          id: number | null
          source: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      vw_map_resonance_active: {
        Row: {
          ambient_audio_url: string | null
          category: string | null
          gallery_urls: Json | null
          geo_location: unknown
          historical_fact: string | null
          id: number | null
          importance_score: number | null
          name: string | null
          reference_podcast_id: number | null
          resonance_radius: number | null
          status: Database["public"]["Enums"]["poi_lifecycle"] | null
        }
        Insert: {
          ambient_audio_url?: string | null
          category?: string | null
          gallery_urls?: Json | null
          geo_location?: unknown
          historical_fact?: string | null
          id?: number | null
          importance_score?: number | null
          name?: string | null
          reference_podcast_id?: number | null
          resonance_radius?: number | null
          status?: Database["public"]["Enums"]["poi_lifecycle"] | null
        }
        Update: {
          ambient_audio_url?: string | null
          category?: string | null
          gallery_urls?: Json | null
          geo_location?: unknown
          historical_fact?: string | null
          id?: number | null
          importance_score?: number | null
          name?: string | null
          reference_podcast_id?: number | null
          resonance_radius?: number | null
          status?: Database["public"]["Enums"]["poi_lifecycle"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_poi_pod_reference"
            columns: ["reference_podcast_id"]
            isOneToOne: false
            referencedRelation: "micro_pods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_draft_quota: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_limit: number
          p_user_id: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      claim_next_research_topic: {
        Args: never
        Returns: {
          topic_id: number
          topic_text: string
        }[]
      }
      cleanup_expired_pulse: { Args: never; Returns: undefined }
      create_collection_with_items_v1: {
        Args: {
          p_cover_image_url: string
          p_description: string
          p_is_public: boolean
          p_owner_id: string
          p_pod_ids: number[]
          p_title: string
        }
        Returns: {
          message: string
          new_collection_id: string
          success: boolean
        }[]
      }
      dispatch_edge_function: {
        Args: { function_name: string; payload: Json }
        Returns: Json
      }
      fetch_personalized_pulse: {
        Args: { p_limit?: number; p_threshold?: number; p_user_id: string }
        Returns: {
          authority_score: number
          content_type: Database["public"]["Enums"]["content_category"]
          id: string
          similarity: number
          source_name: string
          summary: string
          title: string
          url: string
        }[]
      }
      get_curated_library_shelves: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_generic_library_shelves: { Args: never; Returns: Json }
      get_memories_in_bounds: {
        Args: {
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
        }
        Returns: {
          content_type: string
          focus_entity: string
          id: number
          lat: number
          lng: number
          title: string
        }[]
      }
      get_nearby_podcasts: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_meters?: number
        }
        Returns: {
          audio_url: string
          cover_image_url: string
          description: string
          distance_meters: number
          id: number
          profiles: Json
          title: string
        }[]
      }
      get_resonant_podcasts: {
        Args: { center_point: unknown; count_limit: number }
        Returns: {
          admin_notes: string | null
          agent_version: string | null
          ai_summary: string | null
          ai_tags: string[] | null
          audio_assembly_status:
            | Database["public"]["Enums"]["assembly_status"]
            | null
          audio_ready: boolean | null
          audio_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          creation_data: Json | null
          creation_mode: string | null
          current_audio_segments: number | null
          description: string | null
          duration_seconds: number | null
          embedding_ready: boolean | null
          geo_location: unknown
          id: number
          image_ready: boolean | null
          is_featured: boolean | null
          like_count: number
          narrative_lens: string | null
          parent_id: number | null
          place_name: string | null
          play_count: number
          processing_status: Database["public"]["Enums"]["processing_status"]
          published_at: string | null
          quote_context: string | null
          quote_timestamp: number | null
          reviewed_by_user: boolean | null
          root_id: number | null
          script_text: Json | null
          sources: Json | null
          status: Database["public"]["Enums"]["podcast_status"]
          title: string
          total_audio_segments: number | null
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
      get_service_key: { Args: never; Returns: string }
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
      increment_paper_usage: { Args: { p_ids: string[] }; Returns: undefined }
      increment_play_count: { Args: { podcast_id: number }; Returns: undefined }
      init_draft_process_v2: {
        Args: { p_payload: Json }
        Returns: {
          allowed: boolean
          draft_id: number
          reason: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      mark_notifications_as_read: { Args: never; Returns: undefined }
      promote_draft_to_production_v2: {
        Args: {
          p_draft_id: number
          p_final_script: string
          p_final_title: string
          p_sources?: Json
        }
        Returns: {
          message: string
          pod_id: number
          success: boolean
        }[]
      }
      push_to_research_backlog: {
        Args: { p_metadata?: Json; p_topic: string }
        Returns: undefined
      }
      reset_monthly_quotas: { Args: never; Returns: undefined }
      save_analysis_and_embedding:
        | {
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
        | {
            Args: {
              p_agent_version: string
              p_ai_summary: string
              p_ai_tags: string[]
              p_embedding: string
              p_narrative_lens: string
              p_podcast_id: number
            }
            Returns: undefined
          }
      search_geo_semantic: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          radius_units?: number
          user_lat: number
          user_long: number
        }
        Returns: {
          audio_url: string
          author_handle: string
          description: string
          dist_val: number
          id: number
          image_url: string
          similarity: number
          title: string
        }[]
      }
      search_knowledge_vault: {
        Args: {
          match_count?: number
          match_threshold?: number
          only_public?: boolean
          query_embedding: string
        }
        Returns: {
          content: string
          days_old: number
          similarity: number
          source_id: string
          title: string
          url: string
        }[]
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
      search_pulse_staging: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
          summary: string
          title: string
          url: string
        }[]
      }
      unified_search_v3: {
        Args: {
          p_match_count?: number
          p_match_threshold?: number
          p_query_embedding: string
          p_query_text: string
          p_user_lat?: number
          p_user_lng?: number
        }
        Returns: {
          geo_distance: number
          id: string
          image_url: string
          metadata: Json
          result_type: string
          similarity: number
          subtitle: string
          title: string
        }[]
      }
      unified_search_v4: {
        Args: {
          p_match_count?: number
          p_match_threshold?: number
          p_query_embedding: string
          p_query_text: string
          p_user_lat?: number
          p_user_lng?: number
        }
        Returns: {
          geo_distance: number
          id: string
          image_url: string
          metadata: Json
          result_type: string
          similarity: number
          subtitle: string
          title: string
        }[]
      }
    }
    Enums: {
      agent_status: "active" | "experimental" | "archived"
      agent_type: "script" | "image"
      assembly_status:
        | "idle"
        | "collecting"
        | "assembling"
        | "completed"
        | "failed"
      backlog_status: "pending" | "harvesting" | "completed" | "failed"
      consistency_level: "high" | "medium" | "low"
      content_category: "paper" | "report" | "news" | "analysis" | "trend"
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
      podcast_status:
        | "pending_approval"
        | "published"
        | "archived"
        | "failed"
        | "draft"
      poi_lifecycle: "ingested" | "narrated" | "published" | "archived"
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
  public: {
    Enums: {
      agent_status: ["active", "experimental", "archived"],
      agent_type: ["script", "image"],
      assembly_status: [
        "idle",
        "collecting",
        "assembling",
        "completed",
        "failed",
      ],
      backlog_status: ["pending", "harvesting", "completed", "failed"],
      consistency_level: ["high", "medium", "low"],
      content_category: ["paper", "report", "news", "analysis", "trend"],
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
      podcast_status: [
        "pending_approval",
        "published",
        "archived",
        "failed",
        "draft",
      ],
      poi_lifecycle: ["ingested", "narrated", "published", "archived"],
      processing_status: ["pending", "processing", "completed", "failed"],
      subscription_status: ["active", "inactive", "trialing", "past_due"],
      testimonial_status: ["pending", "approved", "rejected"],
    },
  },
} as const
