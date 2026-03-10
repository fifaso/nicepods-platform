// hooks/use-podcast-sync.ts
// VERSIÓN: 3.0 (NicePod Realtime-Polling Hybrid Engine - Production Grade)
// Misión: Garantizar sincronía bidireccional entre la base de datos y la UI mediante WebSocket + Respaldo de Polling.
// [ESTABILIZACIÓN]: Eliminación de desconexiones prematuras, tipado estricto y ciclo de vida resiliente.

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
 * 1. REALTIME (Supabase WebSocket): Para actualizaciones instantáneas cuando el estado muta en el backend.
 * 2. POLLING (Respaldo): Consulta programada a la base de datos para recuperar el estado si la red móvil 
 *    interrumpe el túnel WebSocket.
 * 3. CICLO DE VIDA: El hook gestiona su propia limpieza para evitar fugas de memoria al navegar.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO (La Fuente de Verdad para la UI) ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState<string>(initialData.processing_status || 'pending');

  // --- REFERENCIAS TÁCTICAS (Gestión de Sincronía) ---
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * syncStates: Actualizador atómico para la malla de estados locales.
   * [PERFORMANCE]: Memoizado para evitar cascadas innecesarias de re-renderizado.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status as string);

    // Mantenemos el objeto podcast sincronizado con los nuevos metadatos
    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  /**
   * fetchLatestStatus: El método de rescate ante fallos de conectividad.
   * Consulta explícita a la base de datos.
   */
  const fetchLatestStatus = useCallback(async () => {
    if (!supabase || !initialData.id) return;

    nicepodLog(`🔄 [Realtime-Backup] Sondeo de integridad para Pod #${initialData.id}`);

    const { data, error } = await supabase
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialData.id)
      .single();

    if (!error && data) {
      syncStates(data as PodcastWithProfile);
    }
  }, [supabase, initialData.id, syncStates]);

  useEffect(() => {
    // 1. GUARDA DE SOBERANÍA
    // Si no estamos autenticados o el sistema está cargando la sesión, no abrimos canales.
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) return;

    let isMounted = true;

    // 2. SUSCRIPCIÓN REALTIME (Velocidad instantánea)
    // Nos suscribimos al evento de cambio para el podcast específico.
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

          // Si llegamos a estado terminal, refrescamos la ruta para obtener datos SSR frescos
          if (updatedRecord.processing_status === 'completed' || updatedRecord.processing_status === 'failed') {
            router.refresh();
          }
        }
      )
      .subscribe();

    // 3. POLLING DE RESILIENCIA (Fiabilidad industrial)
    // Cada 5 segundos verificamos el estado, garantizando que aunque el WebSocket falle,
    // el usuario verá la actualización en su pantalla.
    pollIntervalRef.current = setInterval(() => {
      if (isMounted) {
        // Consultamos incluso en estados terminales por si hubo una actualización de metadatos final
        fetchLatestStatus();
      }
    }, 5000);

    // 4. PROTOCOLO DE LIMPIEZA
    // Desconectamos canales y timers para evitar fugas de memoria al cambiar de podcast.
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
 * NOTA TÉCNICA DEL ARCHITECT (Sincronía Híbrida V3.0):
 * 1. Resiliencia contra WebSockets: El Polling de 5 segundos es un seguro de vida. 
 *    Si el usuario atraviesa un túnel o una zona sin cobertura y el WebSocket cae,
 *    la UI se recupera sola al restablecerse la conexión de datos.
 * 2. Limpieza Quirúrgica: El uso de 'isMounted' previene condiciones de carrera 
 *    (Race Conditions) donde el estado se intenta actualizar tras desmontar el componente.
 * 3. Compatibilidad de Ciclo de Vida: A diferencia de la V2.1, esta versión no 
 *    interrumpe la suscripción por el estado del podcast. Se mantiene activa mientras 
 *    el componente exista, garantizando que el usuario vea actualizaciones incluso 
 *    minutos después de que el podcast esté en 'completed' (ej. nuevos likes o comentarios).
 */