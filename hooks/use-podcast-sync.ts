/**
 * ARCHIVO: hooks/use-podcast-sync.ts
 * VERSIÓN: 6.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Garantizar la sincronía bidireccional entre el Metal y el Cristal.
 * [REFORMA V6.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { ephemeralRealtimeSessionIdentification } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

/**
 * usePodcastSync: El motor de sincronía de alta fidelidad para crónicas individuales.
 */
export function usePodcastSync(initialPodcastData: PodcastWithProfile) {
  const {
    supabaseSovereignClient,
    isUserAuthenticated,
    isInitialHandshakeLoading
  } = useAuth();

  const navigationRouter = useRouter();

  // --- I. ESTADO SOBERANO ---
  const [activePodcast, setActivePodcast] = useState<PodcastWithProfile>(initialPodcastData);
  const [isAudioBufferReady, setIsAudioBufferReady] = useState<boolean>(initialPodcastData.isAudioReady);
  const [isCoverImageReady, setIsCoverImageReady] = useState<boolean>(initialPodcastData.isImageReady);
  const [operationalProcessingStatus, setOperationalProcessingStatus] = useState<string>(initialPodcastData.intelligenceProcessingStatus || 'pending');

  // --- II. REFERENCIAS DE CONTROL ---
  const realtimeSubscriptionChannelReference = useRef<RealtimeChannel | null>(null);
  const pollingProcessIntervalReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * synchronizeLocalPodcastStates: 
   */
  const synchronizeLocalPodcastStates = useCallback((freshPodcastData: PodcastWithProfile) => {
    setIsAudioBufferReady(freshPodcastData.isAudioReady);
    setIsCoverImageReady(freshPodcastData.isImageReady);
    setOperationalProcessingStatus(freshPodcastData.intelligenceProcessingStatus);

    setActivePodcast(freshPodcastData);
  }, []);

  /**
   * fetchLatestPodcastStatusFromMetal: 
   */
  const fetchLatestPodcastStatusFromMetal = useCallback(async () => {
    if (!supabaseSovereignClient || !initialPodcastData.identification) return;

    const { data: refreshedPodcastDataSnapshot, error: databaseOperationException } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialPodcastData.identification)
      .single();

    if (!databaseOperationException && refreshedPodcastDataSnapshot) {
      synchronizeLocalPodcastStates(mapDatabasePodcastToSovereignPodcast(refreshedPodcastDataSnapshot));
    }
  }, [supabaseSovereignClient, initialPodcastData.identification, synchronizeLocalPodcastStates]);

  /**
   * EFECTO: MultichannelSincronizationSentinel
   */
  useEffect(() => {
    if (!supabaseSovereignClient || isInitialHandshakeLoading || !isUserAuthenticated || !initialPodcastData.identification) {
      return;
    }

    let isHookMounted = true;

    const uniqueChannelIdentification = `pod_sync_${initialPodcastData.identification}:${ephemeralRealtimeSessionIdentification}:sync`;

    nicepodLog(`🛰️ [Realtime:Sync] Activando radar para Nodo #${initialPodcastData.identification}`);

    const podcastChannelInstance = supabaseSovereignClient.channel(uniqueChannelIdentification)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${initialPodcastData.identification}`,
        },
        (databaseChangeEventPayload) => {
          if (!isHookMounted) return;

          const updatedRecordEntry = mapDatabasePodcastToSovereignPodcast(databaseChangeEventPayload.new);
          nicepodLog(`🔔 [Realtime:Sync] Pulso recibido para Nodo #${initialPodcastData.identification}: ${updatedRecordEntry.intelligenceProcessingStatus}`);

          synchronizeLocalPodcastStates(updatedRecordEntry);

          if (updatedRecordEntry.intelligenceProcessingStatus === 'completed') {
            navigationRouter.refresh();
          }
        }
      );

    realtimeSubscriptionChannelReference.current = podcastChannelInstance;

    podcastChannelInstance.subscribe((subscriptionStatus) => {
      if (subscriptionStatus === 'SUBSCRIBED') {
        nicepodLog(`✅ [Realtime:Sync] Túnel establecido en sesión: ${ephemeralRealtimeSessionIdentification}`);
      }
    });

    pollingProcessIntervalReference.current = setInterval(() => {
      if (isHookMounted) {
        fetchLatestPodcastStatusFromMetal();
      }
    }, 5000);

    return () => {
      isHookMounted = false;

      if (realtimeSubscriptionChannelReference.current) {
        supabaseSovereignClient.removeChannel(realtimeSubscriptionChannelReference.current);
        realtimeSubscriptionChannelReference.current = null;
      }

      if (pollingProcessIntervalReference.current) {
        clearInterval(pollingProcessIntervalReference.current);
        pollingProcessIntervalReference.current = null;
      }

      nicepodLog(`🔌 [Realtime:Sync] Radar desconectado para Nodo #${initialPodcastData.identification}`);
    };
  }, [
    supabaseSovereignClient,
    isUserAuthenticated,
    isInitialHandshakeLoading,
    initialPodcastData.identification,
    synchronizeLocalPodcastStates,
    navigationRouter,
    fetchLatestPodcastStatusFromMetal
  ]);

  return {
    podcast: activePodcast,
    isAudioReady: isAudioBufferReady,
    isImageReady: isCoverImageReady,
    processingStatus: operationalProcessingStatus,
    isFailed: operationalProcessingStatus === 'failed',
    isConstructing: operationalProcessingStatus === 'processing' || operationalProcessingStatus === 'pending'
  };
}
