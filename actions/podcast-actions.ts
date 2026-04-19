/**
 * ARCHIVO: actions/podcast-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Sincronización del Flujo de Datos (Metal-to-Crystal Mapping) y endurecimiento de la trazabilidad industrial.
 * NIVEL DE INTEGRIDAD: 100% (Scribe & Strategist Verified)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  PodcastWithProfile,
} from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";
import { transformDatabasePodcastRecordToSovereignEntity } from "@/lib/mappers/podcast-sovereign-mapper";

/**
 * getPublishedPodcastsAction
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Recuperar las crónicas públicas de la malla global mediante transformación soberana.
 * Implementa el Traceability Protocol para auditar el volumen de datos procesados.
 *
 * @param resultLimitMagnitude Cantidad máxima de crónicas a recuperar.
 * @returns Colección de crónicas purificadas para el Crystal.
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
        "🔥 [Podcast-Action-Error][GetPublished]: Excepción de Hardware en Consulta de Red.",
        { exceptionInformationText: queryHardwareExceptionInformation.message },
        'exceptionInformation'
      );
      throw queryHardwareExceptionInformation;
    }

    // Auditoría de Transformación (Traceability Protocol)
    nicepodLog(
      "🔄 [Podcast-Action][GetPublished]: Iniciando transmutación soberana de crónicas públicas.",
      { collectionCountMagnitude: (publishedPodcastsDatabaseResults || []).length }
    );

    return (publishedPodcastsDatabaseResults || []).map((podcastItem) =>
      transformDatabasePodcastRecordToSovereignEntity(podcastItem)
    );

  } catch (exceptionInformation: unknown) {
    const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetPublished]: Colapso en el pipeline de recuperación.", { exceptionInformationText }, 'exceptionInformation');
    return [];
  }
}

/**
 * getUserPodcastsAction
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Recuperar el inventario personal de crónicas del Voyager autenticado.
 * Aplica la Doctrina DIS (Idempotencia e Identidad) mediante validación SSR de sesión.
 *
 * @returns Colección de crónicas del usuario purificadas.
 */
export async function getUserPodcastsAction(): Promise<PodcastWithProfile[]> {
  const supabaseSovereignClient = createClient();

  // 1. Handshake de Identidad SSR (DOCTRINA DIS)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Podcast-Action][GetUser] Acceso denegado: Sesión no detectada en el servidor.", "AUTHENTICATION_REQUIRED", 'exceptionInformation');
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
        "🔥 [Podcast-Action-Error][GetUser]: Excepción de Hardware en Consulta de Inventario Personal.",
        { exceptionInformationText: queryHardwareExceptionInformation.message },
        'exceptionInformation'
      );
      throw queryHardwareExceptionInformation;
    }

    // Auditoría de Transformación (Traceability Protocol)
    nicepodLog(
      "🔄 [Podcast-Action][GetUser]: Iniciando transmutación soberana de inventario del Voyager.",
      {
        collectionCountMagnitude: (userPodcastsDatabaseResults || []).length,
        userIdentification: authenticatedUserIdentification
      }
    );

    return (userPodcastsDatabaseResults || []).map((podcastItem) =>
      transformDatabasePodcastRecordToSovereignEntity(podcastItem)
    );

  } catch (exceptionInformation: unknown) {
    const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetUserPodcasts]: Colapso en la recuperación de inventario personal.", { exceptionInformationText }, 'exceptionInformation');
    return [];
  }
}
