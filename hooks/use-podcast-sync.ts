// hooks/use-podcast-sync.ts
// VERSIÓN: 3.0 (NicePod Realtime-Polling Hybrid - Production Master)
// Misión: Garantizar sincronía bidireccional entre la base de datos y la UI mediante WebSocket + Respaldo de Polling.
// [ESTABILIZACIÓN]: Eliminación de desconexiones prematuras por dependencias erróneas y estabilización de suscripciones.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: El motor de sincronía de NicePod.
 * 
 * Implementa una estrategia de "Fail-Safe":
 * 1. REALTIME (Supabase WebSocket): Para actualizaciones instantáneas cuando el estado muta.
 * 2. POLLING (Respaldo): Consulta programada para recuperar el estado si el socket se interrumpe.
 * 3. DESACOPLAMIENTO: La suscripción vive independientemente de los cambios de estado local.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO (La Fuente de Verdad para la UI) ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState<string>(initialData.processing_status || 'pending');

  // --- REFERENCIAS DE CONTROL (Evitar cierres prematuros) ---
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * syncStates: Actualizador atómico para la malla de estados locales.
   * Utiliza el estado funcional para asegurar consistencia ante actualizaciones rápidas.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status as string);

    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  /**
   * fetchLatestStatus: Protocolo de sondeo de seguridad.
   */
  const fetchLatestStatus = useCallback(async () => {
    if (!supabase || !initialData.id) return;

    const { data, error } = await supabase
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialData.id)
      .single();

    if (!error && data) {
      syncStates(data as PodcastWithProfile);
    }
  }, [supabase, initialData.id, syncStates]);

  /**
   * EFECTO DE SINCRONÍA:
   * Mantiene el túnel WebSocket abierto y el sondeo activo durante la vida del componente.
   */
  useEffect(() => {
    // 1. GUARDA: Evitar ejecución prematura durante la hidratación de auth.
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) return;

    let isMounted = true;

    // 2. SUSCRIPCIÓN REALTIME
    nicepodLog(`🛰️ [Realtime] Activando radar para Pod #${initialData.id}`);

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
          nicepodLog(`🔔 [Realtime] Pulso recibido: ${updatedRecord.processing_status}`);

          syncStates(updatedRecord);

          // Forzamos refresh solo si el proceso ha finalizado para refrescar datos SSR
          if (updatedRecord.processing_status === 'completed') {
            router.refresh();
          }
        }
      )
      .subscribe();

    // 3. POLLING DE RESILIENCIA
    // Se ejecuta cada 5 segundos para cubrir fallos silenciosos de WebSocket.
    pollIntervalRef.current = setInterval(() => {
      if (isMounted) {
        fetchLatestStatus();
      }
    }, 5000);

    // 4. PROTOCOLO DE DESCONEXIÓN (CLEANUP)
    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      nicepodLog(`🔌 [Realtime] Desconectando radar del Pod #${initialData.id}`);
    };
  }, [supabase, isAuthenticated, isInitialLoading, initialData.id, syncStates, router, fetchLatestStatus]);

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
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Estabilidad de Dependencias: Se eliminó 'processingStatus' del array de dependencias 
 *    del useEffect principal. Esto garantiza que el WebSocket no se cierre ni reabra 
 *    cuando el estado del podcast cambia, manteniendo una conexión única constante.
 * 2. Resiliencia de Red: El polling se mantiene activo durante todo el ciclo de vida 
 *    del componente, proporcionando una red de seguridad absoluta contra WebSockets 
 *    que se cierran inesperadamente en Vercel.
 * 3. Limpieza de Memoria: El protocolo de Cleanup ahora limpia explícitamente el 
 *    channelRef y el intervalo, asegurando que no queden procesos zombis al cambiar de vista.
 */