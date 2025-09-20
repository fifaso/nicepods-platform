// types/podcast.ts

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
  profiles: Profile | null;
};
// ======================================================================