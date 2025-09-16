// types/podcast.ts

import { Database } from './supabase'; // Asegúrate de que tu archivo de tipos generados de Supabase esté en 'types/supabase.ts'

// Esta es ahora la ÚNICA definición en este archivo.
// Define la forma de un 'micro_pod' enriquecido con los datos del perfil de su creador.
export type PodcastWithProfile = Database['public']['Tables']['micro_pods']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null;
};