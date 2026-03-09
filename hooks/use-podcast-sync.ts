// hooks/use-podcast-sync.ts
// VERSIÓN: 2.1 (NicePod Realtime-Polling Hybrid Engine - Strict Typings)
// Misión: Garantizar sincronía mediante WebSocket + Respaldo de Polling.
// [ESTABILIZACIÓN]: Resolución de colisión de tipos ts(2367) y optimización de ciclo de vida.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { PodcastWithProfile } from "@/types/podcast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePodcastSync: Sistema nervioso central de reactividad.
 */
export function usePodcastSync(initialData: PodcastWithProfile) {
  const { supabase, isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();

  const [podcast, setPodcast] = useState<PodcastWithProfile>(initialData);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(!!initialData.audio_ready);
  const [isImageReady, setIsImageReady] = useState<boolean>(!!initialData.image_ready);

  // [FIX]: Forzamos el tipo para que sea compatible con los valores de la DB y la comparación
  const [processingStatus, setProcessingStatus] = useState<string>(initialData.processing_status || 'pending');

  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncStates = useCallback((newData: Partial<PodcastWithProfile>) => {
    if (newData.audio_ready !== undefined) setIsAudioReady(!!newData.audio_ready);
    if (newData.image_ready !== undefined) setIsImageReady(!!newData.image_ready);
    if (newData.processing_status !== undefined) setProcessingStatus(newData.processing_status);

    setPodcast((prev) => ({ ...prev, ...newData }));
  }, []);

  const fetchLatestStatus = useCallback(async () => {
    if (!supabase || !initialData.id) return;

    const { data, error } = await supabase
      .from('micro_pods')
      .select('*, profiles(*)')
      .eq('id', initialData.id)
      .single();

    if (!error && data) {
      syncStates(data as PodcastWithProfile);
      // Detenemos el polling si el estado es terminal
      if (data.processing_status === 'completed' || data.processing_status === 'failed') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }
  }, [supabase, initialData.id, syncStates]);

  useEffect(() => {
    if (!supabase || isInitialLoading || !isAuthenticated || !initialData.id) return;

    // Si ya está terminado, no iniciamos nada
    if (processingStatus === 'completed') return;

    let isMounted = true;

    // Realtime: Suscripción a cambios
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
          syncStates(updatedRecord);

          if (updatedRecord.processing_status === 'completed') {
            router.refresh();
          }
        }
      )
      .subscribe();

    // Polling: Red de seguridad
    pollIntervalRef.current = setInterval(() => {
      // [FIX]: Comparación segura con strings permitidos por la DB
      if (isMounted && processingStatus !== 'completed' && processingStatus !== 'failed') {
        fetchLatestStatus();
      }
    }, 5000);

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
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION):
 * 
 * 1. RESOLUCIÓN DE COLISIÓN DE TIPOS (TS2367):
 *    Se ha refinado la lógica de estado para comparar 'processingStatus' contra todos los 
 *    estados terminales de la base de datos ('completed' y 'failed'). Esto elimina la 
 *    advertencia de TypeScript sobre comparaciones inintencionales, garantizando 
 *    la soberanía del Build Shield en entornos de producción estricta.
 * 
 * 2. ARQUITECTURA DE RESILIENCIA HÍBRIDA:
 *    La combinación de suscripciones Realtime (WebSocket) con un Polling programado 
 *    a 5 segundos crea un sistema de doble redundancia. Si el túnel de Supabase 
 *    se interrumpe por condiciones de red inestables en Madrid, el sondeo garantiza 
 *    que la UI refleje el estado real de la base de datos en cuestión de segundos, 
 *    evitando que el usuario quede atrapado en un bucle visual de 'Forjando'.
 * 
 * 3. GESTIÓN DE MEMORIA Y SEGURIDAD:
 *    Se ha consolidado el 'Cleanup Protocol'. Al desmontar el componente o al 
 *    alcanzar un estado terminal, el hook purga activamente sus canales y 
 *    temporizadores. Esto erradica las fugas de memoria (Memory Leaks) y evita 
 *    que el navegador realice peticiones de red redundantes tras navegar hacia 
 *    otras rutas de la plataforma.
 * 
 * 4. SINCRONÍA DE HIDRATACIÓN:
 *    El uso de 'isMounted' previene que los eventos de la base de datos intenten 
 *    actualizar estados en componentes que ya han sido desmontados por el router 
 *    de Next.js, eliminando los errores de 'setState on unmounted component'.
 */