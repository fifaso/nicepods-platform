// types/database-overrides.d.ts
// VERSIÓN: 1.0 (NicePod Build Shield - PostGIS Integrity Edition)
// Misión: Erradicar el tipo 'unknown' de las columnas geoespaciales autogeneradas por Supabase.
// [ESTABILIZACIÓN]: Mapeo síncrono de tipos Geography y Point hacia el estándar GeoPoint.

import { Database as DatabaseGenerated } from './database.types';
import { GeoPoint } from './geo-sovereignty';

/**
 * ---------------------------------------------------------------------------
 * I. CONSTITUCIÓN DEL ESCUDO (TYPE AUGMENTATION)
 * ---------------------------------------------------------------------------
 * En lugar de modificar el archivo autogenerado (que se sobrescribe en cada push),
 * creamos un 'SovereignDatabase' que hereda la estructura pero 'sana' 
 * las columnas de PostGIS.
 */

export type SovereignDatabase = DatabaseGenerated & {
  public: {
    Tables: {
      /**
       * TABLE: points_of_interest
       * Sanamos 'geo_location' y 'embedding' (vector).
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
       * Sanamos la columna de anclaje geográfico del podcast.
       */
      micro_pods: {
        Row: DatabaseGenerated['public']['Tables']['micro_pods']['Row'] & {
          geo_location: GeoPoint | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['micro_pods']['Insert'] & {
          geo_location?: GeoPoint | null;
        };
        Update: DatabaseGenerated['public']['Tables']['micro_pods']['Update'] & {
          geo_location?: GeoPoint | null;
        };
      };

      /**
       * TABLE: geo_drafts_staging
       * Sanamos la ubicación de escaneo temporal.
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
       * TABLE: place_memories
       * Sanamos la localización de la memoria urbana.
       */
      place_memories: {
        Row: DatabaseGenerated['public']['Tables']['place_memories']['Row'] & {
          geo_location: GeoPoint | null;
        };
        Insert: DatabaseGenerated['public']['Tables']['place_memories']['Insert'] & {
          geo_location?: GeoPoint | null;
        };
        Update: DatabaseGenerated['public']['Tables']['place_memories']['Update'] & {
          geo_location?: GeoPoint | null;
        };
      };

      /**
       * TABLE: user_resonance_profiles
       * Sanamos el centro geométrico de resonancia del usuario.
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
 * II. UTILIDADES DE EXTRACCIÓN SOBERANA
 * ---------------------------------------------------------------------------
 * Estas versiones de 'Tables' y 'Enums' deben ser las preferidas en el código
 * de la plataforma para asegurar el cumplimiento del Build Shield.
 */

export type SovereignTables<T extends keyof SovereignDatabase['public']['Tables']> =
  SovereignDatabase['public']['Tables'][T]['Row'];

export type SovereignInsert<T extends keyof SovereignDatabase['public']['Tables']> =
  SovereignDatabase['public']['Tables'][T]['Insert'];

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Aniquilación de 'as any': Al usar SovereignTables<'points_of_interest'>, 
 *    TypeScript sabrá que '.geo_location' tiene una propiedad '.coordinates' 
 *    que es un array [number, number].
 * 2. Soporte Vectorial: También hemos sanado la columna 'embedding', 
 *    transformándola de 'string | null' (como la lee Supabase) a 'number[] | null', 
 *    que es lo que realmente procesa el Kernel de IA.
 * 3. Mantenimiento Zero-Cost: Este archivo no necesita actualizarse cada vez 
 *    que cambie el esquema, a menos que se añada una NUEVA columna geoespacial 
 *    o vectorial en una tabla diferente.
 */