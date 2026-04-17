/**
 * ARCHIVO: actions/podcast-actions.ts
 * VERSIÓN: 7.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * MISIÓN: Sincronización del Flujo de Datos (Metal-to-Crystal Mapping) mediante
 * el uso del Mapeador Soberano Centralizado.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V7.0)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

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

    if (queryHardwareExceptionInformation) throw queryHardwareExceptionInformation;

    return (publishedPodcastsDatabaseResults || []).map((podcastRow) =>
      mapDatabasePodcastToSovereignPodcast(podcastRow)
    );

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetPublished]:", errorMessage, 'error');
    return [];
  }
}

/**
 * getUserPodcastsAction:
 * Misión: Recuperar el inventario de crónicas del Voyager autenticado.
 */
export async function getUserPodcastsAction(): Promise<PodcastWithProfile[]> {
  const supabaseSovereignClient = createClient();

  const { data: { user: authenticatedUser } } = await supabaseSovereignClient.auth.getUser();
  if (!authenticatedUser) return [];

  try {
    const { data: userPodcastsDatabaseResults, error: queryHardwareExceptionInformation } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('user_id', authenticatedUser.id)
      .order('created_at', { ascending: false });

    if (queryHardwareExceptionInformation) throw queryHardwareExceptionInformation;

    return (userPodcastsDatabaseResults || []).map((podcastRow) =>
      mapDatabasePodcastToSovereignPodcast(podcastRow)
    );

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Podcast-Action-Fatal][GetUserPodcasts]:", errorMessage, 'error');
    return [];
  }
}
