/**
 * ARCHIVE: types/database-overrides.d.ts
 * VERSION: 2.0 (NicePod Build Shield - PostGIS & Multidimensional Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * MISSION: Erradicar el tipo 'unknown' de las columnas geoespaciales y el tipo 'Json'
 * de los campos de inteligencia autogenerados por Supabase, forzando la integridad 
 * del Build Shield en toda la capa de persistencia.
 * [REFORMA V2.0]: Implementación de la Zero Abbreviations Policy (ZAP). Mapeo 
 * síncrono de columnas 'Geography' hacia 'GeoPoint' y campos 'JSONB' hacia 
 * contratos industriales específicos (CreationMetadataPayload, ResearchSource).
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Database as DatabaseGenerated } from './database.types';
import { GeoPoint, IngestionDossier } from './geo-sovereignty';
import { 
  CreationMetadataPayload, 
  ResearchSource, 
  PodcastScript 
} from './podcast';

/**
 * ---------------------------------------------------------------------------
 * I. CONSTITUCIÓN DEL ESCUDO (TYPE AUGMENTATION)
 * ---------------------------------------------------------------------------
 * MISSION: Crear un 'SovereignDatabase' que hereda la estructura del Metal
 * pero 'sana' las columnas binarias, geográficas y de inteligencia.
 */
export type SovereignDatabase = DatabaseGenerated & {
  public: {
    Tables: {
      /**
       * TABLE: points_of_interest
       * Sanamos la localización PostGIS y el vector de memoria semántica.
       */
      points_of_interest: {
        Row: DatabaseGenerated['public']['Tables']['points_of_interest']['Row'] & {
          geo_location: GeoPoint;
          embedding: number[] | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['points_of_interest']['Insert'] & {
          geo_location: GeoPoint;
          embedding?: number[] | null;
        };
        Update: DatabaseGenerated['public']['Tables']['points_of_interest']['Update'] & {
          geo_location?: GeoPoint;
          embedding?: number[] | null;
        };
      };

      /**
       * TABLE: micro_pods
       * Sanamos los campos JSONB de inteligencia y el anclaje geográfico.
       */
      micro_pods: {
        Row: DatabaseGenerated['public']['Tables']['micro_pods']['Row'] & {
          geo_location: GeoPoint | null;
          creation_data: CreationMetadataPayload | null;
          sources: ResearchSource[] | null;
          script_text: PodcastScript | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['micro_pods']['Insert'] & {
          geo_location?: GeoPoint | null;
          creation_data?: CreationMetadataPayload | null;
          sources?: ResearchSource[] | null;
          script_text?: PodcastScript | null;
        };
        Update: DatabaseGenerated['public']['Tables']['micro_pods']['Update'] & {
          geo_location?: GeoPoint | null;
          creation_data?: CreationMetadataPayload | null;
          sources?: ResearchSource[] | null;
          script_text?: PodcastScript | null;
        };
      };

      /**
       * TABLE: point_of_interest_ingestion_buffer
       * Sanamos el dossier de peritaje devuelto por el Oráculo.
       */
      point_of_interest_ingestion_buffer: {
        Row: DatabaseGenerated['public']['Tables']['point_of_interest_ingestion_buffer']['Row'] & {
          visual_analysis_dossier: IngestionDossier['visual_analysis_dossier'] | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['point_of_interest_ingestion_buffer']['Insert'] & {
          visual_analysis_dossier?: IngestionDossier['visual_analysis_dossier'] | null;
        };
        Update: DatabaseGenerated['public']['Tables']['point_of_interest_ingestion_buffer']['Update'] & {
          visual_analysis_dossier?: IngestionDossier['visual_analysis_dossier'] | null;
        };
      };

      /**
       * TABLE: geo_drafts_staging
       * Sanamos la ubicación de escaneo temporal (Triangulación IP/GPS).
       */
      geo_drafts_staging: {
        Row: DatabaseGenerated['public']['Tables']['geo_drafts_staging']['Row'] & {
          location: GeoPoint;
        };
        Insert: DatabaseGenerated['public']['Tables']['geo_drafts_staging']['Insert'] & {
          location: GeoPoint;
        };
        Update: DatabaseGenerated['public']['Tables']['geo_drafts_staging']['Update'] & {
          location?: GeoPoint;
        };
      };

      /**
       * TABLE: user_resonance_profiles
       * Sanamos el centro geométrico del universo semántico del Voyager.
       */
      user_resonance_profiles: {
        Row: DatabaseGenerated['public']['Tables']['user_resonance_profiles']['Row'] & {
          current_center: GeoPoint | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['user_resonance_profiles']['Insert'] & {
          current_center?: GeoPoint | null;
        };
        Update: DatabaseGenerated['public']['Tables']['user_resonance_profiles']['Update'] & {
          current_center?: GeoPoint | null;
        };
      };
    };
  };
};

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE EXTRACCIÓN SOBERANA (BUILD SHIELD HELPERS)
 * ---------------------------------------------------------------------------
 * MISSION: Proveer tipos derivados que respeten la sanación del Metal.
 */

/**
 * SovereignTables: Tipo de fila (Row) con integridad PostGIS y JSONB garantizada.
 */
export type SovereignTables<TableName extends keyof SovereignDatabase['public']['Tables']> =
  SovereignDatabase['public']['Tables'][TableName]['Row'];

/**
 * SovereignInsert: Tipo de inserción compatible con el rigor pericial de NicePod.
 */
export type SovereignInsert<TableName extends keyof SovereignDatabase['public']['Tables']> =
  SovereignDatabase['public']['Tables'][TableName]['Insert'];

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Absolute: Al usar SovereignTables<'micro_pods'>, el compilador TypeScript 
 *    sabrá que 'sources' es un array de 'ResearchSource' y no un tipo 'Json' genérico.
 * 2. PostGIS Native Mapping: Se ha erradicado el tipo 'unknown' de todas las columnas 
 *    de localización, permitiendo el acceso directo a '.coordinates' [longitud, latitud].
 * 3. ZAP Enforcement: Se han renombrado todos los parámetros genéricos (TableName) 
 *    y se han expandido los términos en los comentarios técnicos del archivo.
 */