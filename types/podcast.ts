// types/podcast.ts
// VERSIÓN: 3.0 (Integración Total con Auto-Type Gen & Genealogy Support)

import { Database } from './database.types';

// Ayudante para extraer filas directamente de la Fuente de Verdad
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Tipos base generados automáticamente por la base de datos
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;

// Selección estricta del perfil público para evitar fugas de datos sensibles
export type PublicProfile = Pick<ProfileRow, 'full_name' | 'avatar_url' | 'username'>; 

/**
 * Definición del payload JSON de creación.
  * Aunque en la DB es jsonb, aquí definimos la estructura esperada por la IA
   * para garantizar autocompletado en el Wizard y en el Worker.
    */
    export type CreationDataPayload = {
      style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy';
        agentName: string;
          inputs: {
              topic?: string;
                  generateAudioDirectly?: boolean;
                      target_audience?: string;
                          [key: string]: any; // Flexibilidad para prompts dinámicos
                            };
                            };

                            /**
                             * TIPO MAESTRO: Podcast con Perfil del Autor
                              * Reemplaza el tipado manual de la V2.0. 
                               * reviewed_by_user y published_at ahora vienen incluidos en PodcastRow.
                                */
                                export type PodcastWithProfile = Omit<PodcastRow, 'creation_data'> & {
                                  // Sobreescribimos el jsonb genérico con nuestra interfaz estricta
                                    creation_data: CreationDataPayload | null;
                                      
                                        // Representación exacta de la relación devuelta por un Join de Supabase
                                          profiles: PublicProfile | null;
                                          };

                                          /**
                                           * TIPO PARA HILOS: Soporta la lógica de Remixes y Genealogía
                                            * Utilizado por el algoritmo de agrupación y PodcastView.
                                             */
                                             export type PodcastWithGenealogy = PodcastWithProfile & {
                                                 parent_id?: number | null;
                                                     root_id?: number | null;
                                                         replies?: PodcastWithProfile[]; // Almacena el hilo de respuestas en memoria
                                                         };

                                                         /**
                                                          * Tipos de estado (Enums de la DB disponibles en TS)
                                                           */
                                                           export type PodcastStatus = Database['public']['Enums']['podcast_status'];
                                                           export type JobStatus = Database['public']['Enums']['job_status'];