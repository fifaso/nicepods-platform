/**
 * ARCHIVO: components/feed/resonance-compass.tsx
 * VERSIÓN: 4.1 (NicePod Resonance Compass - Multithreaded & Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Visualizar el universo semántico mediante una simulación de fuerzas 
 * delegada a un Web Worker, garantizando la fluidez total del hilo principal.
 * [REFORMA V4.1]: Importación de nicepodLog (Fix TS2304), purificación nominal absoluta 
 * y sincronización de tipos para el motor de físicas multihilo.
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
import { useEffect, useState, useCallback, useRef } from 'react';
import useResizeObserver from 'use-resize-observer';

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog } from "@/lib/utils";

type UserResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * INTERFAZ: ProcessedPhysicsNode
 * Misión: Definir la estructura de datos para el nodo tras su procesamiento matemático en el Worker.
 */
interface ProcessedPhysicsNode {
  identification: number;
  horizontalCoordinate: number;
  verticalCoordinate: number;
}

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
 * Misión: Representar un nodo individual de sabiduría en el espacio vectorial.
 */
function PodcastResonanceBubble({ 
  processedNode, 
  associatedPodcast,
  onPodcastSelectionAction 
}: { 
  processedNode: ProcessedPhysicsNode; 
  associatedPodcast: PodcastWithProfile;
  onPodcastSelectionAction: () => void 
}) {
  const bubbleRadiusPixels = 48;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2 cursor-pointer group"
      style={{ 
        left: `${processedNode.horizontalCoordinate}px`, 
        top: `${processedNode.verticalCoordinate}px`, 
        transform: 'translate(-50%, -50%)' 
      }}
      onClick={onPodcastSelectionAction}
      whileHover={{ scale: 1.1 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
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
  );
}

/**
 * ResonanceCompass: El reactor de visualización semántica con aislamiento de hilos.
 */
export function ResonanceCompass({ 
  userResonanceProfile, 
  podcastCollection, 
  semanticTags 
}: ResonanceCompassProperties) {
  
  const [processedPhysicsNodesCollection, setProcessedPhysicsNodesCollection] = useState<ProcessedPhysicsNode[]>([]);
  const [isPhysicsEngineLoading, setIsPhysicsEngineLoading] = useState<boolean>(true);
  const [selectedPodcastIntelligence, setSelectedPodcastIntelligence] = useState<PodcastWithProfile | null>(null);
  
  // [REFACTOR]: Uso de nomenclatura descriptiva para la referencia del contenedor
  const { ref: containerElementReference, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>();
  const physicsWorkerReference = useRef<Worker | null>(null);

  /**
   * EFECTO: MultithreadedPhysicsOrchestrator
   * Misión: Delegar la computación de fuerzas al Web Worker y sincronizar los resultados.
   */
  useEffect(() => {
    if (!width || !height || podcastCollection.length === 0) {
      setIsPhysicsEngineLoading(false);
      return;
    }

    setIsPhysicsEngineLoading(true);

    const centerXCoordinate = width / 2;
    const centerYCoordinate = height / 2;
    const exclusionZoneRadius = Math.min(width, height) * 0.15;

    // 1. Inicialización del Trabajador (Web Worker) utilizando Path Alias
    const workerInstance = new Worker(
      new URL('@/lib/workers/resonance-physics.worker.ts', import.meta.url)
    );
    physicsWorkerReference.current = workerInstance;

    // 2. Configuración del Receptor de Datos Procesados
    workerInstance.onmessage = (messageEvent: MessageEvent) => {
      const { type, processedNodesCollection } = messageEvent.data;

      if (type === "TICK" || type === "STABILITY_REACHED") {
        // Mapeamos los nombres cortos del Worker (x, y) a los nombres largos de la UI
        const mappedNodes = processedNodesCollection.map((node: any) => ({
          identification: node.identification,
          horizontalCoordinate: node.x,
          verticalCoordinate: node.y
        }));

        setProcessedPhysicsNodesCollection(mappedNodes);

        if (type === "STABILITY_REACHED") {
          setIsPhysicsEngineLoading(false);
          nicepodLog("🏁 [ResonanceCompass] Estabilidad cinemática multihilo alcanzada.");
        }
      }
    };

    // 3. Emisión del Comando de Inicio al Hilo Secundario
    const initialNodes = podcastCollection.map((podcastItem) => ({
      identification: podcastItem.id,
      x: centerXCoordinate + (Math.random() - 0.5) * 100,
      y: centerYCoordinate + (Math.random() - 0.5) * 100
    }));

    workerInstance.postMessage({
      action: "START_SIMULATION",
      nodesCollection: initialNodes,
      centerXCoordinate,
      centerYCoordinate,
      exclusionZoneRadius
    });

    /**
     * LIMPIEZA TÉCNICA (THE FINAL SEAL)
     * Misión: Aniquilar el trabajador para liberar memoria y ciclos de CPU.
     */
    return () => {
      nicepodLog("🧨 [ResonanceCompass] Terminando proceso de físicas multihilo.");
      workerInstance.terminate();
      physicsWorkerReference.current = null;
    };
  }, [podcastCollection, width, height]);

  const handleSelectionResetAction = useCallback(() => {
    setSelectedPodcastIntelligence(null);
  }, []);

  return (
    <div 
      ref={containerElementReference} 
      className="relative w-full aspect-video max-h-[70vh] max-w-6xl mx-auto bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 isolate"
    >
      {/* CAPA I: INTERFAZ DE CARGA */}
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
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">Sincronizando Multihilo</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAPA II: ESTADO DE VACÍO SEMÁNTICO */}
      {!isPhysicsEngineLoading && podcastCollection.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <Compass className="w-12 h-12 text-zinc-800" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 max-w-xs text-center">
            Densidad de datos insuficiente para proyectar resonancia.
          </p>
        </div>
      )}

      {/* CAPA III: ESCENARIO DE RESURRECCIÓN DE NODOS */}
      {!isPhysicsEngineLoading && podcastCollection.length > 0 && (
        <>
          {/* Eje de Gravedad Central */}
          <motion.div
            className="absolute w-8 h-8 bg-primary/30 rounded-full shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute w-full h-full bg-primary/40 rounded-full animate-ping" />
          </motion.div>

          {/* Renderizado de Nodos (Pintura pasiva de datos procesados) */}
          {processedPhysicsNodesCollection.map((nodeItem) => {
            const podcastCollectionCandidate = podcastCollection.find(
                (podcastItem) => podcastItem.id === nodeItem.identification
            );
            
            if (!podcastCollectionCandidate) {
                return null;
            }
            
            return (
              <PodcastResonanceBubble 
                key={nodeItem.identification} 
                processedNode={nodeItem} 
                associatedPodcast={podcastCollectionCandidate}
                onPodcastSelectionAction={() => setSelectedPodcastIntelligence(podcastCollectionCandidate)} 
              />
            );
          })}

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
                        Cerrar Enfoque
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