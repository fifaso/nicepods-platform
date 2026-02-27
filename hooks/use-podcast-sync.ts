// hooks/use-podcast-sync.ts
// VERSIÓN: 1.4

"use client";

import { useAuth } from "@/hooks/use-auth";
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: El sistema nervioso central de la reactividad de NicePod V2.5.
 * 
 * Este hook permite que la interfaz de un podcast mute en tiempo real a medida 
 * que la base de datos confirma la generación de audio, imagen y metadatos.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  // --- ESTADO SOBERANO (La Fuente de Verdad de la UI) ---
  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);

  // --- BANDERAS DE INTEGRIDAD (Optimización de Renderizado) ---
  // Utilizamos tipos primitivos para que React realice comparaciones rápidas de estado.
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);
  const [processingStatus, setProcessingStatus] = useState(initialData.processing_status);

  // --- REFERENCIAS TÁCTICAS (Gestión de Memoria y Red) ---
  const channelRef = useRef<any>(null);
  const isSubscribing = useRef<boolean>(false);

  /**
   * syncStates: Actualizador atómico de la malla de estados locales.
   * [PERFORMANCE]: Memoizado con useCallback para evitar cascadas de re-renderizado.
   */
  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    // Actualizamos banderas individuales para reactividad inmediata
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    // Sincronizamos el objeto maestro del podcast
    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    // 1. GUARDA DE SOBERANÍA Y ENTORNO
    // No intentamos conectar si:
    // - El sistema aún carga la sesión.
    // - El usuario no está autenticado.
    // - El podcast ya está en estado 'completed' (ahorro de banda).
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) {
      return;
    }

    if (processingStatus === 'completed') {
      return;
    }

    let isMounted = true;

    /**
     * initializeRealtime: Handshake de Seguridad y Apertura de Túnel.
     */
    const initializeRealtime = async () => {
      // Bloqueo de re-entrada: evita múltiples suscripciones en el mismo ciclo.
      if (isSubscribing.current) return;
      isSubscribing.current = true;

      try {
        // [PAUSA TÁCTICA]: 800ms para permitir que el Singleton Client asiente el token.
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!isMounted) return;

        // Verificamos físicamente que el cliente tiene una sesión viva.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          nicepodLog("⚠️ [Realtime] Sesión ausente. El radar entrará en modo espera.");
          isSubscribing.current = false;
          return;
        }

        nicepodLog(`🛰️ [Realtime] Activando radar para Pod #${initialData.id}`);

        // Limpieza de cualquier canal previo para el mismo ID.
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        /**
         * SUSCRIPCIÓN AL CANAL DE BÓVEDA
         * Escuchamos exclusivamente eventos UPDATE en la tabla micro_pods.
         */
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

              // Actualización de estados binarios.
              syncStates(updatedRecord);

              /**
               * CIERRE DE CICLO:
               * Al detectar el estado 'completed', forzamos al router de Next.js a 
               * realizar un refresh. Esto inyecta los datos SSR finales (resúmenes, tags).
               */
              if (updatedRecord.processing_status === 'completed') {
                nicepodLog("✅ [Realtime] Producción finalizada. Sincronizando con el servidor.");
                router.refresh();
              }
            }
          )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              nicepodLog(`🟢 [Realtime] Conexión establecida y segura.`);
            }
            if (status === 'CHANNEL_ERROR') {
              nicepodLog("🔴 [Realtime] Error de canal detectado.");
            }
            if (status === 'CLOSED') {
              nicepodLog("🟡 [Realtime] Túnel cerrado nominalmente.");
            }
          });

      } catch (error: any) {
        console.error("🔥 [Realtime-Fatal] Error en handshake de suscripción:", error.message);
      } finally {
        if (isMounted) isSubscribing.current = false;
      }
    };

    initializeRealtime();

    // 2. PROTOCOLO DE DESCONEXIÓN (CLEANUP)
    // Garantiza que al salir de la vista o desmontar el componente, no queden 
    // WebSockets huérfanos intentando actualizar el estado.
    return () => {
      isMounted = false;
      isSubscribing.current = false;

      if (channelRef.current) {
        const channelToKill = channelRef.current;
        channelRef.current = null;

        nicepodLog(`🔌 [Realtime] Desconectando radar de Pod #${initialData.id}`);
        // La eliminación es asíncrona pero la orden se envía de inmediato.
        supabase.removeChannel(channelToKill);
      }
    };
  }, [
    supabase,
    isAuthenticated,
    isInitialLoading,
    initialData.id,
    processingStatus, // Controlamos el ciclo de vida según la bandera de proceso
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
 * 1. Estabilidad de Sockets: Al usar el Singleton Client (lib/supabase/client.ts), 
 *    este hook comparte la misma conexión base, eliminando el error 
 *    'closed before established'.
 * 2. Rendimiento LCP: El delay de 800ms asegura que el motor de renderizado 
 *    de Next.js dé prioridad a los elementos visuales antes de gestionar 
 *    el tráfico de datos en tiempo real.
 * 3. Higiene de Memoria: El cleanup garantiza que no existan 'Memory Leaks' 
 *    al navegar rápidamente entre podcasts, silenciando la consola de producción.
 */