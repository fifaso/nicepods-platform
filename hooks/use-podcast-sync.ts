/**
 * ARCHIVO: hooks/use-podcast-sync.ts
 * VERSIÓN: 5.0 (NicePod Realtime-Polling Hybrid - Ephemeral Session Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Garantizar la sincronía bidireccional entre el Metal (Base de Datos) 
 * y el Cristal (UI) mediante una arquitectura híbrida de WebSocket y Polling, 
 * con aislamiento absoluto de canal para prevenir fallos de secuencia.
 * [REFORMA V5.0]: Implementación del 'Ephemeral Session Isolation'. Integración 
 * de 'ephemeralRealtimeSessionIdentification' en el identificador de canal 
 * para aniquilar el error 'cannot add callbacks after subscribe'. Purificación 
 * nominal absoluta (ZAP) y blindaje total del Build Shield (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { ephemeralRealtimeSessionIdentification } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // --- I. ESTADO SOBERANO (Fuente de Verdad de la Interfaz) ---
  const [activePodcast, setActivePodcast] = useState<PodcastWithProfile>(initialPodcastData);
  const [isAudioBufferReady, setIsAudioBufferReady] = useState<boolean>(!!initialPodcastData.audio_ready);
  const [isCoverImageReady, setIsCoverImageReady] = useState<boolean>(!!initialPodcastData.image_ready);
  const [operationalProcessingStatus, setOperationalProcessingStatus] = useState<string>(initialPodcastData.processing_status || 'pending');

  // --- II. REFERENCIAS DE CONTROL DE HARDWARE Y RED (HYGIENE) ---
  const realtimeSubscriptionChannelReference = useRef<RealtimeChannel | null>(null);
  const pollingProcessIntervalReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * synchronizeLocalPodcastStates: 
   * Actualizador atómico para la malla de estados locales basado en datos frescos del Metal.
   */
  const synchronizeLocalPodcastStates = useCallback((freshPodcastData: Partial<PodcastWithProfile>) => {
    if (freshPodcastData.audio_ready !== undefined) {
      setIsAudioBufferReady(!!freshPodcastData.audio_ready);
    }
    if (freshPodcastData.image_ready !== undefined) {
      setIsCoverImageReady(!!freshPodcastData.image_ready);
    }
    if (freshPodcastData.processing_status !== undefined) {
      setOperationalProcessingStatus(freshPodcastData.processing_status as string);
    }

    setActivePodcast((previousPodcastData) => ({
      ...previousPodcastData,
      ...freshPodcastData
    }));
  }, []);

  /**
   * fetchLatestPodcastStatusFromMetal: 
   * Protocolo de sondeo de seguridad (Polling) para recuperación ante latencia de red.
   */
  const fetchLatestPodcastStatusFromMetal = useCallback(async () => {
    if (!supabaseSovereignClient || !initialPodcastData.id) return;

    const { data: refreshedPodcastDataSnapshot, error: databaseOperationException } = await supabaseSovereignClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialPodcastData.id)
      .single();

    if (!databaseOperationException && refreshedPodcastDataSnapshot) {
      synchronizeLocalPodcastStates(refreshedPodcastDataSnapshot as PodcastWithProfile);
    }
  }, [supabaseSovereignClient, initialPodcastData.id, synchronizeLocalPodcastStates]);

  /**
   * EFECTO: MultichannelSincronizationSentinel
   * Misión: Mantener el túnel WebSocket y el sondeo activos con aislamiento de sesión.
   */
  useEffect(() => {
    // 1. GUARDA DE AUTORIDAD: Evitar ejecución prematura durante la hidratación.
    if (!supabaseSovereignClient || isInitialHandshakeLoading || !isUserAuthenticated || !initialPodcastData.id) {
      return;
    }

    let isHookMounted = true;

    /**
     * 2. IGNICIÓN DE CANAL REALTIME CON AISLAMIENTO DE SESIÓN
     * [SINCRO V5.0]: Inyección de 'ephemeralRealtimeSessionIdentification' para 
     * evitar colisiones de caché en el SDK de Supabase.
     */
    const uniqueChannelIdentification = `pod_sync_${initialPodcastData.id}:${ephemeralRealtimeSessionIdentification}:sync`;

    nicepodLog(`🛰️ [Realtime:Sync] Activando radar para Nodo #${initialPodcastData.id}`);

    const podcastChannelInstance = supabaseSovereignClient.channel(uniqueChannelIdentification)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${initialPodcastData.id}`,
        },
        (databaseChangeEventPayload) => {
          if (!isHookMounted) return;

          const updatedRecordEntry = databaseChangeEventPayload.new as PodcastWithProfile;
          nicepodLog(`🔔 [Realtime:Sync] Pulso recibido para Nodo #${initialPodcastData.id}: ${updatedRecordEntry.processing_status}`);

          synchronizeLocalPodcastStates(updatedRecordEntry);

          // Sincronización SSR: Forzamos refresco de ruta si el proceso ha culminado con éxito.
          if (updatedRecordEntry.processing_status === 'completed') {
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

    // 3. POLLING DE RESILIENCIA (PILAR 2 - SSS)
    // Frecuencia de 5 segundos para garantizar la integridad si el WebSocket se interrumpe.
    pollingProcessIntervalReference.current = setInterval(() => {
      if (isHookMounted) {
        fetchLatestPodcastStatusFromMetal();
      }
    }, 5000);

    /**
     * 4. PROTOCOLO DE DESCONEXIÓN ATÓMICA (HARDWARE HYGIENE)
     * Misión: Liberar el bus de red y aniquilar procesos de sondeo al desmontar el gancho.
     */
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

      nicepodLog(`🔌 [Realtime:Sync] Radar desconectado para Nodo #${initialPodcastData.id}`);
    };
  }, [
    supabaseSovereignClient,
    isUserAuthenticated,
    isInitialHandshakeLoading,
    initialPodcastData.id,
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Ephemeral Session Isolation: Se ha erradicado definitivamente el error de 
 *    callback de Supabase al garantizar nombres de canal únicos por sesión de usuario.
 * 2. ZAP Absolute Compliance: Purificación nominal total de variables internas y 
 *    parámetros de función (newData -> freshPodcastData, payload -> databaseChangeEventPayload).
 * 3. Build Shield Sovereignty: Se eliminó el uso de 'any' en las referencias de 
 *    intervalo y router, satisfaciendo el régimen de tipado estricto.
 */