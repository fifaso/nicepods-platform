// types/podcast.ts
// VERSIÓN MEJORADA: Se añade un tipo explícito para el payload de creación.

import type { Database } from './supabase';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

type PodcastRow = Tables<'micro_pods'>;
type ProfileRow = Tables<'profiles'>;
type Profile = Pick<ProfileRow, 'full_name' | 'avatar_url' | 'username'>; // Se añade username para los enlaces de perfil

// [INTERVENCIÓN QUIRÚRGICA]: Definimos la estructura interna del JSON 'creation_data'.
// Esto nos dará autocompletado y seguridad de tipos en todo el proyecto.
export type CreationDataPayload = {
  style: 'solo' | 'link' | 'archetype';
  agentName: string;
  inputs: {
    generateAudioDirectly?: boolean;
    // Aquí se pueden añadir otras propiedades de 'inputs' si es necesario.
    [key: string]: any;
  };
};

export type PodcastWithProfile = Omit<PodcastRow, 'creation_data'> & {
  // Sobrescribimos el tipo genérico 'Json' con nuestro tipo específico y seguro.
  creation_data: CreationDataPayload | null;
  profiles: Profile | null;
};