// types/podcast.ts
// VERSIÓN DE PRODUCCIÓN FINAL: Simplificada, robusta y sincronizada con la base de datos.

import type { Database } from './supabase';

// Usamos el tipo 'Tables' que es una abreviatura más limpia proporcionada por 'supabase gen types'.
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// ================== INTERVENCIÓN ESTRATÉGICA #1: TIPOS BASE ==================
// Definimos nuestros tipos base directamente desde la fuente de la verdad generada.
// PodcastRow ahora contiene AUTOMÁTICAMENTE todas las columnas de la tabla micro_pods,
// incluyendo final_coordinates, ai_tags, processing_status, etc.
type PodcastRow = Tables<'micro_pods'>;
type ProfileRow = Tables<'profiles'>;
// ============================================================================

// Tipo auxiliar para definir la forma del perfil que queremos obtener en nuestras consultas.
// Esto se mantiene, ya que es una excelente práctica para mantener los tipos limpios.
type Profile = Pick<ProfileRow, 'full_name' | 'avatar_url'>;


// ================== INTERVENCIÓN QUIRÚRGICA #2: EL CONTRATO DE DATOS DEFINITIVO ==================
//
// Esta es ahora la fuente única de la verdad para un podcast con su creador.
// La definimos como una intersección del tipo base del podcast y la forma del perfil anidado.
// Al usar 'PodcastRow', heredamos automáticamente cualquier cambio futuro en la base de datos
// después de ejecutar 'supabase gen types', haciendo este tipo auto-actualizable y robusto.
// Ya no es necesario añadir 'creation_data' manualmente, ya que está incluido en 'PodcastRow'.
//
export type PodcastWithProfile = PodcastRow & {
  profiles: Profile | null;
};
// ==================================================================================================