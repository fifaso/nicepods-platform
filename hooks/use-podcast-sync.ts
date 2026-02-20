// hooks/use-podcast-sync.ts
// VERSIÓN: 1.2 (NicePod Realtime Sync - Zero-Flicker & Secured Handshake Edition)
// Misión: Orquestar la escucha de activos en tiempo real eliminando errores de WebSocket y loops de carga.
// [ESTABILIZACIÓN]: Implementación de validación de token síncrona y delay de estabilización de red.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: El sistema nervioso central de la reactividad del podcast.
 * 
 * Este hook garantiza que la interfaz responda instantáneamente a los cambios
 * en la Bóveda, permitiendo la revelación progresiva de audio, imagen y metadatos.
 * 
 * @param initialData - Datos del podcast entregados por el servidor (Fase SSR).
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);

  // --- BANDERAS DE INTEGRIDAD ATÓMICAS ---
  // Utilizamos booleanos primitivos para forzar re-renders ligeros y precisos.
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // Referencia para el canal para garantizar un cierre de socket impecable.
  const channelRef = useRef<any>(null);

  /**
   * syncStates: Actualiza la malla de estados locales basándose en el pulso de la DB.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    // 1. GUARDA DE HIDRATACIÓN Y SEGURIDAD
    // Esperamos a que la identidad sea NOMINAL para evitar el error de WebSocket cerrado.
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) {
      return;
    }

    // Si el podcast ya está en estado final, no abrimos el túnel para ahorrar recursos.
    if (podcast.processing_status === 'completed') {
      return;
    }

    let isMounted = true;

    /**
     * initializeRealtime: Handshake de seguridad diferido.
     */
    const initializeRealtime = async () => {
      // Pequeño delay de 500ms para permitir que el cliente Supabase asiente el JWT.
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isMounted) return;

      // Verificamos físicamente la sesión antes de suscribir el canal privado.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        nicepodLog("⚠️ [Realtime] Sesión no detectada físicamente. Reintentando en siguiente ciclo.");
        return;
      }

      nicepodLog(`🛰️ [Realtime] Conectando radar para Pod #${initialData.id}`);

      // Limpieza de suscripciones previas para evitar colisiones de WebSocket
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      /**
       * SUSCRIPCIÓN AL CANAL DE BÓVEDA
       * Escuchamos actualizaciones de la fila específica en micro_pods.
       */
      channelRef.current = supabase
        .channel(`sync_pod_${initialData.id}`)
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

            nicepodLog(`🔔 [Realtime] Señal recibida: ${updatedRecord.processing_status}`);

            // Sincronización atómica de estados primitivos
            syncStates(updatedRecord);

            /**
             * HANDOVER AL SERVIDOR:
             * Al completar la forja, forzamos a Next.js a refrescar los datos SSR
             * para inyectar ai_summary, ai_tags y asegurar la visibilidad global.
             */
            if (updatedRecord.processing_status === 'completed') {
              nicepodLog("✅ [Realtime] Inventario completo. Sincronizando con el servidor.");
              router.refresh();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            nicepodLog(`🟢 [Realtime] Túnel establecido con éxito.`);
          }
          if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            console.warn("🟡 [Realtime] Conexión inestable. El sistema intentará reconexión automática.");
          }
        });
    };

    initializeRealtime();

    // 2. LIMPIEZA DE SENSORES
    return () => {
      isMounted = false;
      if (channelRef.current) {
        nicepodLog(`🔌 [Realtime] Desconectando radar de Pod #${initialData.id}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    supabase,
    isAuthenticated,
    isInitialLoading,
    initialData.id,
    podcast.processing_status,
    syncStates,
    router
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