/**
 * ARCHIVO: actions/podcast-actions.ts
 * VERSIÓN: 8.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Sincronización del Flujo de Datos (Metal-to-Crystal Mapping) y endurecimiento de la trazabilidad.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  PodcastWithProfile,
  GeoLocation,
  PodcastScript
} from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: SovereignPodcast
 * Misión: Representación soberana de un podcast con nomenclatura ZAP absoluta.
 * Incluye mapeo de campos del Metal (DB) hacia el Cristal (UI).
 */
export interface SovereignPodcast extends PodcastWithProfile {
  // --- CAMPOS SOBERANOS (ZAP) ---
  /** artificialIntelligenceTagsCollection: Etiquetas generadas por inteligencia artificial (ZAP de ai_tags). */
  artificialIntelligenceTagsCollection: string[] | null;
  /** geographicLocationPoint: Punto geográfico de resonancia (ZAP de geo_location). */
  geographicLocationPoint: GeoLocation | null;
  /** podcastScriptDossier: Cuerpo narrativo y técnico de la crónica (ZAP de script_text). */
  podcastScriptDossier: PodcastScript | null;

  // --- ALIAS DE COMPATIBILIDAD (AXIAL INTEGRITY) ---
  // Mantenemos los nombres originales de la DB para no romper componentes existentes.
  ai_tags: string[] | null;
  geo_location: GeoLocation | null;
  script_text: PodcastScript | null;
}

/**
 * transformPodcastMetalToCrystal:
 * Misión: Purificar la entidad cruda de la base de datos y elevarla al estándar soberano.
 */
export function transformPodcastMetalToCrystal(rawPodcastItem: PodcastWithProfile): SovereignPodcast {
  return {
    ...rawPodcastItem,
    // Mapeo ZAP (Crystal)
    artificialIntelligenceTagsCollection: rawPodcastItem.ai_tags,
    geographicLocationPoint: rawPodcastItem.geo_location,
    podcastScriptDossier: rawPodcastItem.script_text,

    // Mantenimiento de Alias (Metal/Axial)
    ai_tags: rawPodcastItem.ai_tags,
    geo_location: rawPodcastItem.geo_location,
    script_text: rawPodcastItem.script_text
  };
}

/**
 * getPublishedPodcastsAction:
 * Misión: Recuperar las crónicas públicas de la malla con transformación soberana.
 */
export async function getPublishedPodcastsAction(resultLimitMagnitude: number = 50): Promise<SovereignPodcast[]> {
  const supabaseSovereignClient = createClient();

  try {
    const { data: publishedPodcastsDatabaseResults, error: queryHardwareExceptionInformation } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(resultLimitMagnitude);

    if (queryHardwareExceptionInformation) throw queryHardwareExceptionInformation;

    return (publishedPodcastsDatabaseResults || []).map((podcastItem) =>
      transformPodcastMetalToCrystal(podcastItem as unknown as PodcastWithProfile)
    );

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetPublished]:", exceptionMessageInformationText, 'error');
    return [];
  }
}

/**
 * getUserPodcastsAction:
 * Misión: Recuperar el inventario de crónicas del Voyager autenticado.
 */
export async function getUserPodcastsAction(): Promise<SovereignPodcast[]> {
  const supabaseSovereignClient = createClient();

  // 1. Handshake de Identidad SSR (DOCTRINA DIS)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Podcast-Engine] Acceso denegado: Sesión no válida.", "AUTHENTICATION_REQUIRED", 'error');
    return [];
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: userPodcastsDatabaseResults, error: queryHardwareExceptionInformation } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('user_id', authenticatedUserIdentification)
      .order('created_at', { ascending: false });

    if (queryHardwareExceptionInformation) throw queryHardwareExceptionInformation;

    return (userPodcastsDatabaseResults || []).map((podcastItem) =>
      transformPodcastMetalToCrystal(podcastItem as unknown as PodcastWithProfile)
    );

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetUserPodcasts]:", exceptionMessageInformationText, 'error');
    return [];
  }
}
