/**
 * ARCHIVO: components/feed/resonance-compass.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Thermal Isolation
 * MISIÓN: Visualizar el universo semántico mediante una simulación de fuerzas multihilo.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
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
        visibility: 'hidden'
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
  podcastCollection, 
}: ResonanceCompassProperties) {
  
  // --- I. ESTADOS DE GESTIÓN DE INTERFAZ ---
  const [isPhysicsEngineLoading, setIsPhysicsEngineLoading] = useState<boolean>(true);
  const [selectedPodcastIntelligence, setSelectedPodcastIntelligence] = useState<PodcastWithProfile | null>(null);
  
  // --- II. REFERENCIAS TÁCTICAS (NOMINAL INTEGRITY) ---
  const physicsWorkerReference = useRef<Worker | null>(null);
  const bubbleElementsMapReference = useRef<Map<number, HTMLDivElement>>(new Map());

  /**
   * handleResizeAction:
   * Misión: Notificar al motor de físicas sobre el cambio de dimensiones.
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
   * handleWorkerMessageAction:
   * Misión: Procesar el búfer de transferencia (Float32Array) y actualizar el DOM directamente.
   */
  const handleWorkerMessageAction = useCallback((messageEvent: MessageEvent) => {
    const { type, positionsBuffer } = messageEvent.data as { type: string, positionsBuffer: Float32Array };

    if (type === "TICK" || type === "STABILITY_REACHED") {
      const nodesCount = positionsBuffer.length / 3;
      
      for (let itemIndex = 0; itemIndex < nodesCount; itemIndex++) {
        const offsetIndex = itemIndex * 3;
        const nodeIdentification = positionsBuffer[offsetIndex];
        const horizontalCoordinate = positionsBuffer[offsetIndex + 1];
        const verticalCoordinate = positionsBuffer[offsetIndex + 2];

        const bubbleElement = bubbleElementsMapReference.current.get(nodeIdentification);
        
        if (bubbleElement) {
          bubbleElement.style.transform = `translate3d(${horizontalCoordinate}px, ${verticalCoordinate}px, 0) translate(-50%, -50%)`;
          if (bubbleElement.style.visibility === 'hidden') {
            bubbleElement.style.visibility = 'visible';
          }
        }
      }

      // [MTI]: Devolver el búfer al trabajador para su reutilización
      // Se realiza AL FINAL del procesamiento local para evitar errores de búfer desprendido.
      if (physicsWorkerReference.current && type === "TICK") {
        physicsWorkerReference.current.postMessage({
            action: "RETURN_BUFFER",
            positionsBuffer: positionsBuffer
        }, { transfer: [positionsBuffer.buffer] });
      }

      if (type === "STABILITY_REACHED") {
        setIsPhysicsEngineLoading(false);
        nicepodLog("🏁 [ResonanceCompass] Estabilidad cinemática por transferencia de memoria alcanzada.");
      }
    }
  }, []);

  /**
   * handleVisibilityChangeAction:
   * [THERMIC V8.0]: Consolidación del Protocolo de Aislamiento Térmico de Fondo.
   */
  const handleVisibilityChangeAction = useCallback(() => {
    if (!physicsWorkerReference.current) return;

    if (document.hidden) {
      nicepodLog("💤 [ResonanceCompass] Entrando en modo de hibernación térmica (Pestaña Oculta).");
      physicsWorkerReference.current.postMessage({ action: "PAUSE_SIMULATION" });
    } else {
      nicepodLog("⚡ [ResonanceCompass] Restaurando simulación desde hibernación (Pestaña Visible).");
      physicsWorkerReference.current.postMessage({ action: "RESUME_SIMULATION" });
    }
  }, []);

  /**
   * EFECTO: MultithreadedPhysicsOrchestrator
   * Misión: Inicializar el bus de datos multihilo y gestionar el ciclo de vida del Worker.
   */
  useEffect(() => {
    const hasDimensions = (width ?? 0) > 0 && (height ?? 0) > 0;
    const hasData = podcastCollection.length > 0;

    if (!hasDimensions || !hasData) {
      if (!hasData) setIsPhysicsEngineLoading(false);
      return;
    }

    setIsPhysicsEngineLoading(true);

    const centerXCoordinate = (width ?? 0) / 2;
    const centerYCoordinate = (height ?? 0) / 2;
    const exclusionZoneRadius = Math.min((width ?? 0), (height ?? 0)) * 0.15;

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

    // 4. Centinela de Aislamiento Térmico Unificado
    document.addEventListener("visibilitychange", handleVisibilityChangeAction);

    /**
     * LIMPIEZA TÉCNICA (THE FINAL SEAL)
     */
    return () => {
      nicepodLog("🧨 [ResonanceCompass] Aniquilando proceso de físicas multihilo y liberando bus de datos.");
      document.removeEventListener("visibilitychange", handleVisibilityChangeAction);
      workerInstance.terminate();
      physicsWorkerReference.current = null;
    };
  }, [podcastCollection, width, height, handleWorkerMessageAction, handleVisibilityChangeAction]);

  const handleSelectionResetAction = useCallback(() => {
    setSelectedPodcastIntelligence(null);
  }, []);

  return (
    <div 
      ref={containerElementReference} 
      className="relative w-full aspect-video max-h-[70vh] max-w-6xl mx-auto bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 isolate"
    >
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

      {!isPhysicsEngineLoading && podcastCollection.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <Compass className="w-12 h-12 text-zinc-800" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 max-w-xs text-center">
            Densidad de datos insuficiente para proyectar resonancia semántica.
          </p>
        </div>
      )}

      {podcastCollection.length > 0 && (
        <>
          <motion.div
            className="absolute w-8 h-8 bg-primary/30 rounded-full shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute w-full h-full bg-primary/40 rounded-full animate-ping" />
          </motion.div>

          {podcastCollection.map((podcastItem) => (
            <PodcastResonanceBubble 
              key={podcastItem.id} 
              associatedPodcast={podcastItem}
              onPodcastSelectionAction={setSelectedPodcastIntelligence}
              elementsMapReference={bubbleElementsMapReference}
            />
          ))}

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
