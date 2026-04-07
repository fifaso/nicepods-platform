/**
 * ARCHIVO: components/feed/resonance-compass.tsx
 * VERSIÓN: 3.0 (NicePod Resonance Compass - Absolute Nominal Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Visualizar el universo semántico del Voyager mediante una simulación 
 * de fuerzas matemáticas, permitiendo la exploración orgánica de crónicas y ecos.
 * [REFORMA V3.0]: Sincronización nominal total con PodcastCard V9.0, erradicación 
 * absoluta de abreviaturas y blindaje de tipos en el motor de física D3.js.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/database.types';

// --- INFRAESTRUCTURA DE COMPONENTES SOBERANOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';

import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import useResizeObserver from 'use-resize-observer';

type UserResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * INTERFAZ: ResonanceSimulationNode
 * Misión: Extender el contrato de D3 para incluir la carga útil del capital intelectual.
 */
interface ResonanceSimulationNode extends d3.SimulationNodeDatum {
  identification: number;
  podcast: PodcastWithProfile;
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
  simulationNode, 
  onPodcastSelectionAction 
}: { 
  simulationNode: ResonanceSimulationNode; 
  onPodcastSelectionAction: () => void 
}) {
  const bubbleRadiusPixels = 48;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2 cursor-pointer group"
      style={{ 
        left: `${simulationNode.x}px`, 
        top: `${simulationNode.y}px`, 
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
        {simulationNode.podcast.cover_image_url ? (
          <Image 
            src={simulationNode.podcast.cover_image_url} 
            alt={simulationNode.podcast.title} 
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
        {simulationNode.podcast.title}
      </p>
    </motion.div>
  );
}

/**
 * ResonanceCompass: El reactor de visualización semántica de la Workstation.
 */
export function ResonanceCompass({ 
  userResonanceProfile, 
  podcastCollection, 
  semanticTags 
}: ResonanceCompassProperties) {
  
  const [simulationNodes, setSimulationNodes] = useState<ResonanceSimulationNode[]>([]);
  const [isSimulationEngineLoading, setIsSimulationEngineLoading] = useState<boolean>(true);
  const [selectedPodcastIntelligence, setSelectedPodcastIntelligence] = useState<PodcastWithProfile | null>(null);
  
  const { ref: containerElementReference, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>();

  /**
   * EFECTO: MathematicalSimulationEngine
   * Misión: Orquestar la simulación de fuerzas para el posicionamiento orgánico de nodos.
   */
  useEffect(() => {
    if (!width || !height || podcastCollection.length === 0) {
      setIsSimulationEngineLoading(false);
      return;
    }

    setIsSimulationEngineLoading(true);

    const centerXCoordinate = width / 2;
    const centerYCoordinate = height / 2;
    const exclusionZoneRadius = Math.min(width, height) * 0.15;

    const initialNodes: ResonanceSimulationNode[] = podcastCollection.map((podcastItem) => ({
      identification: podcastItem.id,
      x: centerXCoordinate + (Math.random() - 0.5) * 200,
      y: centerYCoordinate + (Math.random() - 0.5) * 200,
      podcast: podcastItem,
    }));

    const forceSimulation = d3.forceSimulation<ResonanceSimulationNode>(initialNodes)
      .force('charge', d3.forceManyBody().strength(50))
      .force('radial', d3.forceRadial(exclusionZoneRadius, centerXCoordinate, centerYCoordinate).strength(0.6))
      .force('collision', d3.forceCollide<ResonanceSimulationNode>().radius(65))
      .on('tick', () => {
        // Realizamos una copia superficial para forzar la actualización reactiva del árbol de componentes.
        setSimulationNodes([...initialNodes]);
      })
      .on('end', () => {
        setIsSimulationEngineLoading(false);
      });

    return () => {
      forceSimulation.stop();
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
      {/* CAPA I: INTERFAZ DE CARGA (SINCRO T0) */}
      <AnimatePresence>
        {isSimulationEngineLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-xl z-50"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">Calibrando Universo</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAPA II: ESTADO DE VACÍO SEMÁNTICO */}
      {!isSimulationEngineLoading && podcastCollection.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <Compass className="w-12 h-12 text-zinc-800" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 max-w-xs text-center">
            Densidad de datos insuficiente para proyectar la malla de resonancia.
          </p>
        </div>
      )}

      {/* CAPA III: MALLA DE RESONANCIA ACTIVA (WEBGL EMULATION) */}
      {!isSimulationEngineLoading && podcastCollection.length > 0 && (
        <>
          {/* Eje de Gravedad Central (El Voyager) */}
          <motion.div
            className="absolute w-8 h-8 bg-primary/30 rounded-full shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute w-full h-full bg-primary/40 rounded-full animate-ping" />
          </motion.div>

          {/* Renderizado de Nodos Vectoriales de Conocimiento */}
          {simulationNodes.map((nodeItem) => (
            <PodcastResonanceBubble 
              key={nodeItem.identification} 
              simulationNode={nodeItem} 
              onPodcastSelectionAction={() => setSelectedPodcastIntelligence(nodeItem.podcast)} 
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
                  {/* [FIX V3.0]: Sincronización nominal con el contrato PodcastCardProperties V9.0 */}
                  <PodcastCard initialPodcastData={selectedPodcastIntelligence} />
                  
                  <div className="mt-10 flex justify-center">
                    <button 
                        onClick={handleSelectionResetAction}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-all border-b border-zinc-800 hover:border-white pb-1"
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Contract Synchronization: Se sustituyó la propiedad 'podcast' por 'initialPodcastData' 
 *    para satisfacer la interfaz de PodcastCard V9.0, neutralizando el error TS2322.
 * 2. Zero Abbreviations Policy: Purificación total de la nomenclatura (simulationNodes, 
 *    onPodcastSelectionAction, containerElementReference).
 * 3. Physics Integrity: La simulación utiliza tipos estrictos (ResonanceSimulationNode), 
 *    eliminando el uso de 'any' y garantizando que el Build Shield valide cada tick.
 */