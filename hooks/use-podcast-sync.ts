// hooks/use-podcast-sync.ts
// VERSIÓN: 1.0 (Realtime Synchronization Engine - NicePod V2.5 Standard)
// Misión: Orquestar la escucha de activos en tiempo real y la reactividad del inventario.
// [ESTABILIZACIÓN]: Eliminación de loops de carga mediante actualización atómica de banderas.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: Hook especializado en el ciclo de vida de visualización del podcast.
 * 
 * @param initialData - Los datos del podcast recuperados inicialmente por el servidor (SSR).
 * @returns Un objeto con los estados reactivos del inventario multimedia.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO DEL DATO ---
  // Mantenemos una copia local sincronizada con la base de datos en tiempo real.
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);

  // --- ESTADOS REACTIVOS PRIMITIVOS ---
  // Estos booleanos disparan los re-renders en los componentes hijos de forma atómica.
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // --- REFERENCIAS DE INFRAESTRUCTURA ---
  // Utilizamos una referencia para el canal para asegurar una limpieza impecable de sockets.
  const channelRef = useRef<any>(null);

  /**
   * syncStates: Actualiza los estados locales basados en un nuevo payload de la DB.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    // Solo iniciamos la escucha si hay una sesión activa y estamos en el cliente.
    if (!supabase || !isAuthenticated || !initialData.id) return;

    // Si el podcast ya está completado, no abrimos el túnel para ahorrar recursos de red.
    if (initialData.processing_status === 'completed') {
      return;
    }

    nicepodLog(`🛰️ Radar de Sincronía activo para Pod #${initialData.id}`);

    /**
     * CONFIGURACIÓN DEL CANAL REALTIME
     * Escuchamos exclusivamente los cambios (UPDATE) en la fila de este podcast.
     */
    channelRef.current = supabase
      .channel(`podcast_sync_${initialData.id}`)
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
          nicepodLog("🔔 Señal de Bóveda detectada:", updatedRecord.processing_status);

          // Sincronizamos los estados locales inmediatamente
          syncStates(updatedRecord);

          /**
           * HANDOVER AL SERVIDOR:
           * Si el estado cambia a 'completed', forzamos a Next.js a refrescar 
           * la ruta para traer los metadatos finales (tags, summary, etc.) vía SSR.
           */
          if (updatedRecord.processing_status === 'completed') {
            nicepodLog("✅ Inventario completo. Sincronizando con el servidor.");
            router.refresh();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          nicepodLog(`🟢 Túnel Realtime establecido con éxito.`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error("🔴 Error en el túnel Realtime. Intentando reconexión...");
        }
      });

    // LIMPIEZA DE SENSORES: Cerramos el canal al desmontar el componente.
    return () => {
      if (channelRef.current) {
        nicepodLog(`🔌 Desconectando radar de Pod #${initialData.id}`);
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, isAuthenticated, initialData.id, initialData.processing_status, syncStates, router]);

  return {
    podcast,
    isAudioReady,
    isImageReady,
    processingStatus,
    isFailed: processingStatus === 'failed',
    isConstructing: processingStatus === 'processing' || processingStatus === 'pending'
  };
}