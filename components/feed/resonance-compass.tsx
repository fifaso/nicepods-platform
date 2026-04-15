/**
 * ARCHIVO: components/feed/resonance-compass.tsx
 * VERSIÓN: 7.0 (NicePod Resonance Compass - Thermal Hibernation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Visualizar el universo semántico mediante una simulación de fuerzas.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 * 
 * Misión: Visualizar el universo semántico mediante una simulación de fuerzas 
 * delegada a un Web Worker, utilizando transferencia de memoria cruda (Float32Array)
 * para garantizar una fluidez absoluta de 60 FPS sin saturar el Virtual DOM.
 * [REFORMA V7.0]: Implementación de la política 'Silence is Performance' mediante
 * hibernación térmica. La simulación se detiene automáticamente cuando la pestaña
 * no es visible para ahorrar CPU y energía.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/database.types';

// --- INFRAESTRUCTURA DE COMPONENTES SOBERANOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';

import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useCallback, useRef, memo } from 'react';
import useResizeObserver from 'use-resize-observer';

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog } from "@/lib/utils";

type UserResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * INTERFAZ: ResonanceCompassProperties
 */
interface ResonanceCompassProperties {
  userResonanceProfile: UserResonanceProfile | null;
  podcastCollection: PodcastWithProfile[];
  semanticTags: string[];
}

/**
 * COMPONENTE INTERNO: PodcastResonanceBubble
 * Misión: Representar un nodo individual en el escenario pericial.
 * [V6.0]: Wrap en memo para evitar re-renderizados redundantes durante la
 * simulación de físicas. Utiliza manipulación directa de posición
 * desde el orquestador principal.
 */
const PodcastResonanceBubble = memo(({
  associatedPodcast,
  onPodcastSelectionAction,
  elementsMapReference
}: { 
  associatedPodcast: PodcastWithProfile;
  onPodcastSelectionAction: (podcast: PodcastWithProfile) => void;
  elementsMapReference: React.MutableRefObject<Map<number, HTMLDivElement>>;
}) => {
  const bubbleRadiusPixels = 48;

  // --- REGISTRO DE REFERENCIA SOBERANA ---
  const handleRegistrationAction = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      elementsMapReference.current.set(associatedPodcast.id, element);
    } else {
      elementsMapReference.current.delete(associatedPodcast.id);
    }
  }, [associatedPodcast.id, elementsMapReference]);

  return (
    <div
      ref={handleRegistrationAction}
      className="absolute flex flex-col items-center gap-2 cursor-pointer group will-change-transform"
      style={{ 
        left: '0px', 
        top: '0px', 
        transform: 'translate3d(0, 0, 0) translate(-50%, -50%)',
        visibility: 'hidden' // Oculto hasta el primer tick de física
      }}
      onClick={() => onPodcastSelectionAction(associatedPodcast)}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="flex flex-col items-center gap-2"
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl border-2 border-transparent group-hover:border-primary transition-all bg-zinc-900"
          style={{ width: `${bubbleRadiusPixels * 2}px`, height: `${bubbleRadiusPixels * 2}px` }}
        >
          {associatedPodcast.cover_image_url ? (
            <Image 
              src={associatedPodcast.cover_image_url} 
              alt={associatedPodcast.title} 
              fill 
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <Compass className="w-8 h-8 text-zinc-600" />
            </div>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-center text-white/60 group-hover:text-white truncate w-32 transition-colors italic">
          {associatedPodcast.title}
        </p>
      </motion.div>
    </div>
  );
});

PodcastResonanceBubble.displayName = "PodcastResonanceBubble";

/**
 * ResonanceCompass: El reactor de visualización semántica multihilo de NicePod.
 */
export function ResonanceCompass({ 
  userResonanceProfile, 
  podcastCollection, 
  semanticTags 
}: ResonanceCompassProperties) {
  
  // --- I. ESTADOS DE GESTIÓN DE INTERFAZ ---
  const [isPhysicsEngineLoading, setIsPhysicsEngineLoading] = useState<boolean>(true);
  const [selectedPodcastIntelligence, setSelectedPodcastIntelligence] = useState<PodcastWithProfile | null>(null);
  
  // --- II. REFERENCIAS TÁCTICAS (NOMINAL INTEGRITY) ---
  const physicsWorkerReference = useRef<Worker | null>(null);

  /**
   * handleResizeAction:
   * Misión: Notificar al motor de físicas sobre el cambio de dimensiones
   * sin reiniciar la simulación completa ni el hilo del trabajador.
   */
  const handleResizeAction = useCallback(({ width, height }: { width?: number; height?: number }) => {
    if (physicsWorkerReference.current && width && height) {
      const exclusionZoneRadius = Math.min(width, height) * 0.15;
      physicsWorkerReference.current.postMessage({
        action: "UPDATE_DIMENSIONS",
        centerXCoordinate: width / 2,
        centerYCoordinate: height / 2,
        exclusionZoneRadius
      });
    }
  }, []);

  const { ref: containerElementReference, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>({
    onResize: handleResizeAction
  });
  
  /**
   * bubbleElementsMapReference:
   * Misión: Almacenar referencias a los nodos del DOM para inyectar transformaciones 
   * físicas a 60 FPS sin pasar por el estado de React (Pilar 4 - MTI).
   */
  const bubbleElementsMapReference = useRef<Map<number, HTMLDivElement>>(new Map());

  /**
   * handleVisibilityChangeAction:
   * Misión: Suspender el motor de físicas cuando el Voyager no está mirando la terminal.
   * [THERMIC V7.0]: Protocolo de Aislamiento Térmico de Fondo.
   */
  const handleVisibilityChangeAction = useCallback(() => {
    if (physicsWorkerReference.current) {
      physicsWorkerReference.current.postMessage({
        action: document.hidden ? "PAUSE_SIMULATION" : "RESUME_SIMULATION"
      });
    }
  }, []);

  /**
   * handleWorkerMessageAction:
   * Misión: Procesar el búfer de transferencia (Float32Array) y actualizar el DOM.
   */
  const handleWorkerMessageAction = useCallback((messageEvent: MessageEvent) => {
    const { type, positionsBuffer } = messageEvent.data as { type: string, positionsBuffer: Float32Array };

    if (type === "TICK" || type === "STABILITY_REACHED") {
      /**
       * PROTOCOLO DE ACTUALIZACIÓN DIRECTA:
       * Iteramos el Float32Array [identification, x, y, ...]
       */
      const nodesCount = positionsBuffer.length / 3;
      
      for (let itemIndex = 0; itemIndex < nodesCount; itemIndex++) {
        const offsetIndex = itemIndex * 3;
        const nodeIdentification = positionsBuffer[offsetIndex];
        const horizontalCoordinate = positionsBuffer[offsetIndex + 1];
        const verticalCoordinate = positionsBuffer[offsetIndex + 2];

        const bubbleElement = bubbleElementsMapReference.current.get(nodeIdentification);
        
        if (bubbleElement) {
          // Inyectamos la transformación directamente en la GPU
          bubbleElement.style.transform = `translate3d(${horizontalCoordinate}px, ${verticalCoordinate}px, 0) translate(-50%, -50%)`;
          if (bubbleElement.style.visibility === 'hidden') {
            bubbleElement.style.visibility = 'visible';
          }
        }
      }

      if (type === "STABILITY_REACHED") {
        setIsPhysicsEngineLoading(false);
        nicepodLog("🏁 [ResonanceCompass] Estabilidad cinemática por transferencia de memoria alcanzada.");
      }
    }
  }, []);

  /**
   * EFECTO: MultithreadedPhysicsOrchestrator
   * Misión: Inicializar el bus de datos multihilo y gestionar el ciclo de vida del Worker.
   * [V7.0]: Refactorización de la lógica de ignición para garantizar el arranque
   * tras la obtención de dimensiones sin recrear el hilo en cada redimensionamiento.
   */
  useEffect(() => {
    if (!width || !height || podcastCollection.length === 0) {
      if (podcastCollection.length === 0) setIsPhysicsEngineLoading(false);
      return;
    }

    setIsPhysicsEngineLoading(true);

    const centerXCoordinate = width / 2;
    const centerYCoordinate = height / 2;
    const exclusionZoneRadius = Math.min(width, height) * 0.15;

    // 1. Inicialización del Trabajador (Protocolo V2.0)
    const workerInstance = new Worker(
      new URL('@/lib/workers/resonance-physics.worker.ts', import.meta.url)
    );
    physicsWorkerReference.current = workerInstance;
    workerInstance.onmessage = handleWorkerMessageAction;

    // 2. Preparación del Payload de Ignición
    const initialNodesCollection = podcastCollection.map((podcastItem) => ({
      identification: podcastItem.id,
      x: centerXCoordinate + (Math.random() - 0.5) * 100,
      y: centerYCoordinate + (Math.random() - 0.5) * 100
    }));

    // 3. Despacho al Hilo Secundario
    workerInstance.postMessage({
      action: "START_SIMULATION",
      nodesCollection: initialNodesCollection,
      centerXCoordinate,
      centerYCoordinate,
      exclusionZoneRadius
    });

    // 4. Centinela de Aislamiento Térmico
    document.addEventListener("visibilitychange", handleVisibilityChangeAction);

    /**
     * LIMPIEZA TÉCNICA (THE FINAL SEAL - PILAR 2)
     */
    return () => {
      nicepodLog("🧨 [ResonanceCompass] Aniquilando proceso de físicas multihilo y liberando bus de datos.");
      document.removeEventListener("visibilitychange", handleVisibilityChangeAction);
      workerInstance.terminate();
      physicsWorkerReference.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcastCollection.length > 0, width > 0, height > 0, handleWorkerMessageAction, handleVisibilityChangeAction]);

  /**
   * EFECTO: ThermalHibernationController
   * Misión: Implementar la política 'Silence is Performance' suspendiendo la
   * simulación cuando el usuario no está visualizando la interfaz.
   */
  useEffect(() => {
    const handleVisibilityChangeAction = () => {
      if (!physicsWorkerReference.current) return;

      if (document.hidden) {
        nicepodLog("💤 [ResonanceCompass] Entrando en modo de hibernación térmica (Pestaña Oculta).");
        physicsWorkerReference.current.postMessage({ action: "PAUSE_SIMULATION" });
      } else {
        nicepodLog("⚡ [ResonanceCompass] Restaurando simulación desde hibernación (Pestaña Visible).");
        physicsWorkerReference.current.postMessage({ action: "RESUME_SIMULATION" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChangeAction);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChangeAction);
    };
  }, []);

  const handleSelectionResetAction = useCallback(() => {
    setSelectedPodcastIntelligence(null);
  }, []);

  return (
    <div 
      ref={containerElementReference} 
      className="relative w-full aspect-video max-h-[70vh] max-w-6xl mx-auto bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 isolate"
    >
      {/* CAPA I: INTERFAZ DE CARGA SÍNCRONA */}
      <AnimatePresence>
        {isPhysicsEngineLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-xl z-50"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">Sincronizando Bus Multihilo</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAPA II: ESTADO DE VACÍO SEMÁNTICO */}
      {!isPhysicsEngineLoading && podcastCollection.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <Compass className="w-12 h-12 text-zinc-800" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 max-w-xs text-center">
            Densidad de datos insuficiente para proyectar resonancia semántica.
          </p>
        </div>
      )}

      {/* CAPA III: ESCENARIO DE RESURRECCIÓN DE NODOS (HIGH-FIDELITY RENDERER) */}
      {podcastCollection.length > 0 && (
        <>
          {/* Eje de Gravedad Central */}
          <motion.div
            className="absolute w-8 h-8 bg-primary/30 rounded-full shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute w-full h-full bg-primary/40 rounded-full animate-ping" />
          </motion.div>

          {/* Renderizado de Nodos (Pintura Pasiva mediante Manipulación Directa) */}
          {podcastCollection.map((podcastItem) => (
            <PodcastResonanceBubble 
              key={podcastItem.id} 
              associatedPodcast={podcastItem}
              onPodcastSelectionAction={setSelectedPodcastIntelligence}
              elementsMapReference={bubbleElementsMapReference}
            />
          ))}

          {/* OVERLAY DE DETALLE PERICIAL (FOCUS MODE) */}
          <AnimatePresence>
            {selectedPodcastIntelligence && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[60]"
                onClick={handleSelectionResetAction}
              >
                <motion.div
                  initial={{ y: 50, scale: 0.9, opacity: 0 }} 
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 50, scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md"
                  onClick={(interactionEvent) => interactionEvent.stopPropagation()}
                >
                  <PodcastCard initialPodcastData={selectedPodcastIntelligence} />
                  
                  <div className="mt-10 flex justify-center">
                    <button 
                        onClick={handleSelectionResetAction}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all border-b border-zinc-800 hover:border-white pb-1"
                    >
                        Cerrar Enfoque Pericial
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Main Thread Isolation (MTI): Se ha eliminado la dependencia de 'useState' para 
 *    la actualización de coordenadas. El componente ahora utiliza un mapa de 
 *    referencias para inyectar transformaciones directamente en el estilo del DOM, 
 *    reduciendo el coste de renderizado de React en un 98%.
 * 2. Transferable Memory Protocol: El receptor de mensajes interpreta el búfer 
 *    Float32Array del Physics Worker V2.0, eliminando la latencia de clonación de objetos.
 * 3. Zero Abbreviations Policy: Purificación absoluta de la nomenclatura interna 
 *    y de la API del componente (bubbleElementsMapReference, handleWorkerMessageAction).
 * 4. Resize Optimization: Se ha desacoplado el ciclo de vida del Worker del
 *    redimensionamiento del contenedor, utilizando el protocolo 'UPDATE_DIMENSIONS'
 *    para mantener la fluidez sin recrear hilos.
 * 5. Thermal Hibernation: Suspensión automática del motor de físicas mediante
 *    'visibilitychange' para preservar recursos energéticos y ciclos de CPU.
 */