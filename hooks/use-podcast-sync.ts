/**
 * ARCHIVO: hooks/use-podcast-sync.ts
 * VERSIÓN: 4.0 (NicePod Realtime-Polling Hybrid - Production Instance Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Garantizar la sincronía bidireccional entre el Metal (Base de Datos) 
 * y el Cristal (UI) mediante una arquitectura híbrida de WebSocket y Polling, 
 * con aislamiento total de instancia para prevenir fallos de secuencia.
 * [REFORMA V4.0]: Implementación del 'Instance Isolation Pattern'. Uso de 
 * sufijos ':sync' en canales Realtime para evitar colisiones. Purificación 
 * nominal absoluta bajo la Zero Abbreviations Policy (ZAP). Sellado del 
 * Build Shield (BSS) mediante la eliminación de tipos 'any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: El motor de sincronía de alta disponibilidad de NicePod.
 */
export function usePodcastSync(initialPodcastData: PodcastWithProfile) {
  const { supabase: supabaseClient, isAuthenticated, isInitialLoading } = useAuth();
  const navigationRouter = useRouter();

  // --- I. ESTADO SOBERANO (Fuente de Verdad de la Interfaz) ---
  const [activePodcast, setActivePodcast] = useState<PodcastWithProfile>(initialPodcastData);
  const [isAudioBufferReady, setIsAudioBufferReady] = useState<boolean>(!!initialPodcastData.audio_ready);
  const [isCoverImageReady, setIsCoverImageReady] = useState<boolean>(!!initialPodcastData.image_ready);
  const [operationalProcessingStatus, setOperationalProcessingStatus] = useState<string>(initialPodcastData.processing_status || 'pending');

  // --- II. REFERENCIAS DE CONTROL DE HARDWARE Y RED ---
  const realtimeSubscriptionChannelReference = useRef<RealtimeChannel | null>(null);
  const pollingProcessIntervalReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * synchronizeLocalPodcastStates: 
   * Actualizador atómico para la malla de estados locales basado en datos frescos.
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

    setActivePodcast((previousPodcastData) => ({ ...previousPodcastData, ...freshPodcastData }));
  }, []);

  /**
   * fetchLatestPodcastStatusFromMetal: 
   * Protocolo de sondeo de seguridad (Polling) para recuperación ante desincronía.
   */
  const fetchLatestPodcastStatusFromMetal = useCallback(async () => {
    if (!supabaseClient || !initialPodcastData.id) return;

    const { data: refreshedPodcastData, error: databaseOperationException } = await supabaseClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialPodcastData.id)
      .single();

    if (!databaseOperationException && refreshedPodcastData) {
      synchronizeLocalPodcastStates(refreshedPodcastData as PodcastWithProfile);
    }
  }, [supabaseClient, initialPodcastData.id, synchronizeLocalPodcastStates]);

  /**
   * EFECTO: MultichannelSincronizationSentinel
   * Misión: Mantener el túnel WebSocket y el sondeo activos con aislamiento de canal.
   */
  useEffect(() => {
    // 1. GUARDA DE AUTORIDAD: Evitar ejecución prematura durante Handshake de sesión.
    if (!supabaseClient || isInitialLoading || !isAuthenticated || !initialPodcastData.id) {
      return;
    }

    let isHookMounted = true;

    // 2. IGNICIÓN DE CANAL REALTIME CON AISLAMIENTO
    // [SINCRO V4.0]: Sufijo ':sync' para evitar colisiones con el sistema de notificaciones.
    nicepodLog(`🛰️ [Realtime:Sync] Activando radar para Nodo #${initialPodcastData.id}`);

    const podcastChannelInstance = supabaseClient.channel(`podcast_sync_${initialPodcastData.id}:sync`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${initialPodcastData.id}`,
        },
        (payload) => {
          if (!isHookMounted) return;

          const updatedRecord = payload.new as PodcastWithProfile;
          nicepodLog(`🔔 [Realtime:Sync] Pulso de estado recibido: ${updatedRecord.processing_status}`);

          synchronizeLocalPodcastStates(updatedRecord);

          // Sincronización del Servidor (SSR): Forzamos refresco si el proceso ha culminado.
          if (updatedRecord.processing_status === 'completed') {
            navigationRouter.refresh();
          }
        }
      );

    realtimeSubscriptionChannelReference.current = podcastChannelInstance;

    podcastChannelInstance.subscribe((subscriptionStatus) => {
      if (subscriptionStatus === 'SUBSCRIBED') {
        nicepodLog(`✅ [Realtime:Sync] Túnel establecido para Nodo #${initialPodcastData.id}`);
      }
    });

    // 3. POLLING DE RESILIENCIA TERMODINÁMICA
    // Frecuencia de 5 segundos para cubrir latencias críticas del WebSocket.
    pollingProcessIntervalReference.current = setInterval(() => {
      if (isHookMounted) {
        fetchLatestPodcastStatusFromMetal();
      }
    }, 5000);

    /**
     * 4. PROTOCOLO DE DESCONEXIÓN ATÓMICA (HARDWARE HYGIENE)
     * Misión: Liberar el bus de red y aniquilar procesos de sondeo al desmontar.
     */
    return () => {
      isHookMounted = false;

      if (realtimeSubscriptionChannelReference.current) {
        supabaseClient.removeChannel(realtimeSubscriptionChannelReference.current);
        realtimeSubscriptionChannelReference.current = null;
      }

      if (pollingProcessIntervalReference.current) {
        clearInterval(pollingProcessIntervalReference.current);
        pollingProcessIntervalReference.current = null;
      }

      nicepodLog(`🔌 [Realtime:Sync] Radar desconectado del Nodo #${initialPodcastData.id}`);
    };
  }, [
    supabaseClient,
    isAuthenticated,
    isInitialLoading,
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Instance Isolation: Se ha resuelto el riesgo de "callback after subscribe" 
 *    mediante la asignación de un canal exclusivo ':sync' por cada crónica.
 * 2. ZAP Absolute Compliance: Purificación total de descriptores (initialPodcastData, 
 *    activePodcast, isAudioBufferReady, navigationRouter).
 * 3. Build Shield Sovereignty: Se eliminó el tipo 'any' en la referencia del canal, 
 *    asegurando que el compilador valide los métodos de 'RealtimeChannel'.
 */