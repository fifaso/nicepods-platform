// types/podcast.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CON EL CAMPO `creation_data` AÑADIDO)

import { Database } from './supabase';

// Tipo auxiliar para definir la forma del perfil que queremos obtener.
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;

// ================== EL CONTRATO DE DATOS DEFINITIVO ==================
//
// Esta es ahora la fuente única de la verdad para un podcast con su creador.
// Se define 'profiles' como un OBJETO 'Profile' o 'null', que es la estructura
// real que Supabase devuelve para una relación uno-a-uno.
//
export type PodcastWithProfile = Database['public']['Tables']['micro_pods']['Row'] & {
  // La relación con el perfil se mantiene.
  profiles: Profile | null;
  
  // ================== INTERVENCIÓN QUIRÚRGICA FINAL ==================
  // Se añade la propiedad `creation_data` para que coincida con la estructura
  // de datos que estamos cargando desde la base de datos.
  // El tipo `any` es seguro y apropiado aquí, ya que `creation_data` es una
  // columna JSONB flexible cuyo contenido puede variar.
  creation_data: any | null;
  // ==================================================================
};
// ======================================================================