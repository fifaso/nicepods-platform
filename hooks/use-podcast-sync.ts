// hooks/use-podcast-sync.ts
// VERSIÓN: 1.1 (NicePod Realtime Sync - Secured Handshake Edition)
// Misión: Orquestar la escucha de activos en tiempo real eliminando errores de WebSocket.
// [ESTABILIZACIÓN]: Implementación de guarda de estado Auth para sincronía nominal y tregua de red.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: Hook especializado en la reactividad del inventario multimedia.
 * 
 * Este componente es el responsable de que la página de visualización del podcast
 * se actualice automáticamente cuando la IA termina de generar el audio o la imagen.
 * 
 * @param initialData - El objeto podcast cargado inicialmente desde el servidor (SSR).
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO DEL DATO ---
  // Mantenemos la verdad local sincronizada con los cambios de la Bóveda.
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);

  // --- ESTADOS REACTIVOS ATÓMICOS ---
  // Booleanos primitivos para disparar re-renderizados sin parpadeos de objeto.
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // --- REFERENCIAS DE INFRAESTRUCTURA ---
  const channelRef = useRef<any>(null);

  /**
   * syncStates: Función quirúrgica para actualizar banderas de integridad.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    // Realizamos una mezcla (merge) profunda para no perder metadatos del perfil.
    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    /**
     * [PROTOCOLO DE SEGURIDAD]: Handshake Diferido
     * Solo iniciamos el WebSocket si:
     * 1. El cliente de base de datos está listo.
     * 2. El sistema ya no está en fase de carga inicial de identidad.
     * 3. El usuario está plenamente autenticado (para evitar el cierre por RLS).
     */
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) {
      return;
    }

    // Si el podcast ya fue completado, evitamos abrir túneles innecesarios.
    if (podcast.processing_status === 'completed') {
      return;
    }

    nicepodLog(`🛰️ [Realtime] Activando radar para Pod #${initialData.id}`);

    // Limpieza de canales huérfanos para evitar el error 'WebSocket is closed'
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    /**
     * CONFIGURACIÓN DEL CANAL SOBERANO
     * Escuchamos únicamente los eventos de UPDATE para esta fila específica.
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
          const updatedRecord = payload.new as PodcastWithProfile;
          nicepodLog("🔔 [Realtime] Cambio detectado en Bóveda:", updatedRecord.processing_status);

          // Sincronizamos estados primitivos para reacción inmediata de la UI
          syncStates(updatedRecord);

          /**
           * HANDOVER A SERVIDOR:
           * Si la forja multimedia termina, notificamos al servidor para que 
           * refresque el cache de datos y traiga el ADN semántico (Tags, Resumen).
           */
          if (updatedRecord.processing_status === 'completed') {
            nicepodLog("✅ [Realtime] Inventario completo. Forzando refresco de ruta.");
            router.refresh();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          nicepodLog(`🟢 [Realtime] Túnel establecido para Pod #${initialData.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.error(`🔴 [Realtime-Error] Conexión interrumpida para Pod #${initialData.id}`);
        }
      });

    // CIERRE TÉCNICO: Eliminamos la suscripción al desmontar el componente.
    return () => {
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