/**
 * ARCHIVO: actions/podcast-actions.ts
 * VERSIÓN: 8.1 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Sincronización del Flujo de Datos (Metal-to-Crystal Mapping) y endurecimiento de la trazabilidad.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  PodcastWithProfile,
} from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";
import { transformDatabasePodcastRecordToSovereignEntity } from "@/lib/mappers/podcast-sovereign-mapper";

/**
 * getPublishedPodcastsAction:
 * Misión: Recuperar las crónicas públicas de la malla con transformación soberana.
 */
export async function getPublishedPodcastsAction(resultLimitMagnitude: number = 50): Promise<PodcastWithProfile[]> {
  const supabaseSovereignClient = createClient();

  try {
    const { data: publishedPodcastsDatabaseResults, error: queryHardwareExceptionInformation } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(resultLimitMagnitude);

    if (queryHardwareExceptionInformation) {
      nicepodLog(
        "🔥 [Podcast-Action-Error][GetPublished]: Excepción de Hardware en Consulta.",
        { exceptionMessageInformationText: queryHardwareExceptionInformation.message },
        'exceptionInformation'
      );
      throw queryHardwareExceptionInformation;
    }

    // Auditoría de Transformación (Traceability Protocol)
    nicepodLog(
      "🔄 [Podcast-Action][GetPublished]: Iniciando transmutación soberana de registros.",
      { collectionCountMagnitude: (publishedPodcastsDatabaseResults || []).length }
    );

    return (publishedPodcastsDatabaseResults || []).map((podcastItem) =>
      transformDatabasePodcastRecordToSovereignEntity(podcastItem)
    );

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetPublished]:", exceptionMessageInformationText, 'exceptionInformation');
    return [];
  }
}

/**
 * getUserPodcastsAction:
 * Misión: Recuperar el inventario de crónicas del Voyager autenticado.
 */
export async function getUserPodcastsAction(): Promise<PodcastWithProfile[]> {
  const supabaseSovereignClient = createClient();

  // 1. Handshake de Identidad SSR (DOCTRINA DIS)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Podcast-Engine] Acceso denegado: Sesión no válida.", "AUTHENTICATION_REQUIRED", 'exceptionInformation');
    return [];
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: userPodcastsDatabaseResults, error: queryHardwareExceptionInformation } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('user_id', authenticatedUserIdentification)
      .order('created_at', { ascending: false });

    if (queryHardwareExceptionInformation) {
       nicepodLog(
        "🔥 [Podcast-Action-Error][GetUser]: Excepción de Hardware en Consulta de Inventario.",
        { exceptionMessageInformationText: queryHardwareExceptionInformation.message },
        'exceptionInformation'
      );
      throw queryHardwareExceptionInformation;
    }

    // Auditoría de Transformación (Traceability Protocol)
    nicepodLog(
      "🔄 [Podcast-Action][GetUser]: Iniciando transmutación soberana de inventario.",
      { collectionCountMagnitude: (userPodcastsDatabaseResults || []).length }
    );

    return (userPodcastsDatabaseResults || []).map((podcastItem) =>
      transformDatabasePodcastRecordToSovereignEntity(podcastItem)
    );

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetUserPodcasts]:", exceptionMessageInformationText, 'exceptionInformation');
    return [];
  }
}
