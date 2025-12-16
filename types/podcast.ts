// types/podcast.ts
// VERSIÓN: 2.0 (Sync with DB Schema: Added 'reviewed_by_user' field)

import type { Database } from './supabase';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

type PodcastRow = Tables<'micro_pods'>;
type ProfileRow = Tables<'profiles'>;

// Seleccionamos solo los campos necesarios del perfil para evitar exponer datos sensibles
type Profile = Pick<ProfileRow, 'full_name' | 'avatar_url' | 'username'>; 

// Definición estricta del payload JSON para autocompletado en el frontend
export type CreationDataPayload = {
  style: 'solo' | 'link' | 'archetype';
  agentName: string;
  inputs: {
    generateAudioDirectly?: boolean;
    // Permitimos otras propiedades dinámicas
    [key: string]: any;
  };
};

// Tipo Maestro utilizado en las vistas
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data'> & {
  // 1. Tipado fuerte para el JSON de creación
  creation_data: CreationDataPayload | null;
  
  // 2. Relación con la tabla de perfiles (Join)
  profiles: Profile | null;

  // 3. [CORRECCIÓN CRÍTICA]: Inyección manual de campos nuevos.
  // Estos campos existen en la DB (creados por SQL) pero TS no los veía.
  reviewed_by_user?: boolean | null;
  published_at?: string | null;
};