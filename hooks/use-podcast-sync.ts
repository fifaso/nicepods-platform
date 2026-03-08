// hooks/use-podcast-sync.ts
// VERSIÓN: 2.0 (NicePod Realtime-Polling Hybrid Engine)
// Misión: Garantizar la sincronía del estado de síntesis mediante WebSocket + Respaldo de Polling.
// [ESTABILIZACIÓN]: Implementación de fail-safe mediante sondeo programado (Polling).

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: Sistema nervioso central de reactividad para la forja de podcasts.
 * Utiliza una estrategia híbrida:
 * 1. Suscripción Realtime (WebSocket): Para cambios instantáneos.
 * 2. Polling de Resiliencia: Para recuperar estados perdidos ante caídas de red.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADOS DE LA FORJA ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // --- REFERENCIAS DE CONTROL ---
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * syncStates: Actualizador atómico para la UI.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  /**
   * fetchLatestStatus: El método de rescate ante fallos de WebSocket.
   */
  const fetchLatestStatus = useCallback(async () => {
    if (!supabase || !initialData.id) return;
    
    nicepodLog(`🔄 [Realtime-Backup] Consultando estado manual del Pod #${initialData.id}`);
    const { data, error } = await supabase
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialData.id)
      .single();

    if (!error && data) {
      syncStates(data as PodcastWithProfile);
      if (data.processing_status === 'completed') {
        nicepodLog("✅ [Realtime-Backup] Sincronía alcanzada. Liberando recursos.");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }
  }, [supabase, initialData.id, syncStates]);

  useEffect(() => {
    // 1. GUARDA: Evitar ejecución prematura
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) return;
    if (processingStatus === 'completed') return;

    let isMounted = true;

    // 2. SUSCRIPCIÓN REALTIME (Velocidad)
    channelRef.current = supabase
      .channel(`pod_sync_${initialData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${initialData.id}`,
        },
        (payload) => {
          if (!isMounted) return;
          const updatedRecord = payload.new as PodcastWithProfile;
          nicepodLog(`🔔 [Realtime] Pulso detectado: ${updatedRecord.processing_status}`);
          syncStates(updatedRecord);

          if (updatedRecord.processing_status === 'completed') {
            router.refresh();
          }
        }
      )
      .subscribe();

    // 3. POLLING DE RESILIENCIA (Fiabilidad)
    // Cada 5 segundos, verificamos la verdad absoluta en base de datos.
    pollIntervalRef.current = setInterval(() => {
      if (isMounted && processingStatus !== 'completed') {
        fetchLatestStatus();
      }
    }, 5000);

    // 4. PROTOCOLO DE DESCONEXIÓN (CLEANUP)
    return () => {
      isMounted = false;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [
    supabase, 
    isAuthenticated, 
    isInitialLoading, 
    initialData.id, 
    processingStatus, 
    syncStates, 
    router,
    fetchLatestStatus
  ]);

  return {
    podcast,
    isAudioReady,
    isImageReady,
    processingStatus,
    isFailed: processingStatus === 'failed',
    isConstructing: processingStatus === 'processing' || processingStatus === 'pending'
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resiliencia Holística: Al añadir el intervalo de 5 segundos (Polling), el 
 *    sistema se vuelve inmune a las caídas de WebSockets, garantizando que el 
 *    usuario vea su podcast completo aunque la conexión en tiempo real falle.
 * 2. Purga Automática: La limpieza de intervalos y canales en el 'return' 
 *    evita que los timers se dupliquen al navegar entre diferentes podcasts.
 * 3. Integración Realtime: La lógica combina lo mejor de ambos mundos: 
 *    la inmediatez del evento de Supabase y la seguridad de una consulta explícita.
 */