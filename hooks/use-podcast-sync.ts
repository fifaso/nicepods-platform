// hooks/use-podcast-sync.ts
// VERSIÓN: 1.3

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: El motor de reactividad atómica de NicePod V2.5.
 * 
 * Este hook sincroniza el estado de producción de un podcast con la base de datos,
 * permitiendo que la interfaz mutre de 'Sintetizando' a 'Reproducir' sin refrescos.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);

  // --- BANDERAS DE INTEGRIDAD (Primitivos para alto rendimiento) ---
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // Referencias tácticas para control de fugas de red
  const channelRef = useRef<any>(null);
  const initializationInProgress = useRef<boolean>(false);

  /**
   * syncStates: Actualizador de malla de estados.
   * [OPTIMIZACIÓN]: Memoizado para evitar recreaciones en cada ciclo de render.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    // Mantenemos el objeto completo sincronizado para el resto de la UI
    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    // 1. GUARDA DE INTEGRIDAD INICIAL
    // Bloqueamos la conexión si el sistema está cargando, si el podcast no tiene ID 
    // o si el podcast ya está completado (ahorro de banda).
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) {
      return;
    }

    if (processingStatus === 'completed') {
      return;
    }

    let isMounted = true;

    /**
     * initializeRealtime: Handshake de Seguridad Industrial.
     */
    const initializeRealtime = async () => {
      // Previene ejecuciones duplicadas si el useEffect se dispara por cambios de props.
      if (initializationInProgress.current) return;
      initializationInProgress.current = true;

      try {
        // Delay táctico para asentamiento de JWT en el cliente Supabase
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!isMounted) return;

        // Validación física de la sesión antes de abrir el socket
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          nicepodLog("⚠️ [Realtime] Sesión no detectada. Reintentando sincronía.");
          initializationInProgress.current = false;
          return;
        }

        nicepodLog(`🛰️ [Realtime] Conectando radar para Pod #${initialData.id}`);

        // Limpieza de canales huérfanos antes de nueva suscripción
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        /**
         * SUSCRIPCIÓN AL CANAL DE BÓVEDA
         * Escucha exclusiva de cambios en la fila del podcast actual.
         */
        channelRef.current = supabase
          .channel(`pod_sync_${initialData.id}_${Date.now()}`) // Canal único por sesión
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

              // Sincronización de banderas binarias
              syncStates(updatedRecord);

              // Si la forja termina, forzamos refresco del router para inyectar datos SSR frescos
              if (updatedRecord.processing_status === 'completed') {
                nicepodLog("✅ [Realtime] Forja finalizada. Sincronizando con el servidor.");
                router.refresh();
              }
            }
          )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              nicepodLog(`🟢 [Realtime] Túnel establecido con éxito.`);
            }
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              nicepodLog("🟡 [Realtime] Canal cerrado o inestable.");
            }
          });

      } catch (err: any) {
        console.error("🔥 [Realtime-Fatal] Error en handshake:", err.message);
      } finally {
        if (isMounted) initializationInProgress.current = false;
      }
    };

    initializeRealtime();

    // 2. PROTOCOLO DE DESCONEXIÓN (CLEANUP)
    // Garantiza que el WebSocket se cierre físicamente al desmontar el componente.
    return () => {
      isMounted = false;
      initializationInProgress.current = false;
      if (channelRef.current) {
        nicepodLog(`🔌 [Realtime] Desconectando radar del Pod #${initialData.id}`);
        const channelToClose = channelRef.current;
        channelRef.current = null;
        supabase.removeChannel(channelToClose);
      }
    };
  }, [
    supabase,
    isAuthenticated,
    isInitialLoading,
    initialData.id,
    processingStatus, // Usamos la bandera local para controlar re-conexiones
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Prevención de Colisiones: El uso de initializationInProgress evita que el 
 *    proceso de suscripción se inicie varias veces si el componente se re-renderiza.
 * 2. Limpieza Garantizada: Al guardar el canal en una variable local durante el 
 *    cleanup, aseguramos que el comando .removeChannel() se ejecute sobre el 
 *    objeto correcto incluso si channelRef.current ya ha sido nulificado.
 * 3. Silencio en Consola: Al validar físicamente la sesión y añadir un delay 
 *    determinado, eliminamos el error 'WebSocket closed before established'.
 */