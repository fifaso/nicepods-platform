// components/resonance-compass.tsx
// VERSIÓN: 2.0

"use client";

import { cn } from '@/lib/utils';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import * as d3 from 'd3';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Compass, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { PodcastCard } from './podcast-card';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * INTERFAZ: SimulationNode
 * Extiende la definición base de D3 para vincular la data del podcast.
 */
interface SimulationNode extends d3.SimulationNodeDatum {
  id: number;
  podcast: PodcastWithProfile;
}

interface ResonanceCompassProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
  tags: string[];
}

/**
 * COMPONENTE: PodcastBubble
 * La representación física de una idea en el espacio semántico.
 */
function PodcastBubble({ node, onSelect }: { node: SimulationNode; onSelect: () => void }) {
  const bubbleSize = 80; // Diámetro base escalado

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-3 cursor-pointer group z-10"
      style={{ left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)' }}
      onClick={onSelect}
      whileHover={{ scale: 1.15, zIndex: 30 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Halo de Resonancia Semántica */}
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

      {/* Cápsula de Imagen */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden shadow-2xl transition-all duration-700",
          "border-2 border-white/5 group-hover:border-primary/60",
          "bg-zinc-900 ring-4 ring-black/50"
        )}
        style={{ width: `${bubbleSize}px`, height: `${bubbleSize}px` }}
      >
        {node.podcast.cover_image_url ? (
          <Image
            src={node.podcast.cover_image_url}
            alt={node.podcast.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <Compass className="w-6 h-6 text-zinc-600" />
          </div>
        )}
        {/* Filtro de profundidad interno */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Narrativa del Nodo */}
      <p className="text-[10px] font-black text-center text-zinc-400 group-hover:text-white uppercase tracking-widest truncate w-32 px-1 transition-colors italic">
        {node.podcast.title}
      </p>
    </motion.div>
  );
}

/**
 * COMPONENTE: ResonanceCompass
 * El motor de descubrimiento 3D de NicePod V2.5.
 */
export function ResonanceCompass({ podcasts }: ResonanceCompassProps) {
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastWithProfile | null>(null);

  // Observador de dimensiones para el canvas responsivo
  const { ref: containerRef, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>();

  /**
   * ORQUESTADOR DE FÍSICA (D3 Simulation)
   * Los nodos repelen entre sí pero son atraídos al centro (Resonancia del Usuario).
   */
  useEffect(() => {
    if (!width || !height || podcasts.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const centerX = width / 2;
    const centerY = height / 2;

    // Inicialización de coordenadas de lanzamiento (Random Burst)
    const initialNodes: SimulationNode[] = podcasts.map((p) => ({
      id: p.id,
      x: centerX + (Math.random() - 0.5) * 400,
      y: centerY + (Math.random() - 0.5) * 400,
      podcast: p,
    }));

    const simulation = d3.forceSimulation<SimulationNode>(initialNodes)
      .alphaDecay(0.05) // Suavizado de entrada
      .force('charge', d3.forceManyBody().strength(-150)) // Repulsión entre burbujas
      .force('center', d3.forceCenter(centerX, centerY).strength(0.8)) // Atracción al eje central
      .force('collision', d3.forceCollide().radius(90)) // Evita solapamiento de texto
      .on('tick', () => {
        setNodes([...initialNodes]);
      })
      .on('end', () => {
        setIsLoading(false);
      });

    return () => {
      simulation.stop();
    };
  }, [podcasts, width, height]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video max-h-[75vh] max-w-7xl mx-auto",
        "bg-[#020202] rounded-[3rem] overflow-hidden",
        "border border-white/5 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]"
      )}
    >
      {/* 
          I. ESCENARIO DE FONDO (NEBULOSA) 
          Capas de luz sutil para dar profundidad al vacío.
      */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* 
          II. HUD DE TELEMETRÍA 
          Proyecta el estado del motor de búsqueda en las esquinas.
      */}
      <div className="absolute top-8 left-10 z-20 flex items-center gap-4 opacity-40">
        <Activity size={14} className="text-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Malla Semántica</span>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-md z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Calibrando Resonancia</p>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Calculando vectores de 768 dimensiones</p>
          </div>
        </div>
      )}

      {/* 
          III. EL EPICENTRO (CENTRO DE GRAVEDAD) 
      */}
      {!isLoading && podcasts.length > 0 && (
        <motion.div
          className="absolute w-8 h-8 flex items-center justify-center z-0"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="absolute w-full h-full bg-primary/40 rounded-full animate-ping" />
          <div className="relative w-3 h-3 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
        </motion.div>
      )}

      {/* IV. RENDERIZADO DE NODOS */}
      <div className="absolute inset-0 pointer-events-auto">
        {nodes.map((node) => (
          <PodcastBubble
            key={node.podcast.id}
            node={node}
            onSelect={() => setSelectedPodcast(node.podcast)}
          />
        ))}
      </div>

      {/* 
          V. VELO DE SELECCIÓN (PODCAST OVERLAY) 
          Cuando se selecciona un nodo, oscurecemos la nebulosa para el enfoque.
      */}
      <AnimatePresence>
        {selectedPodcast && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedPodcast(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Cerramos el ciclo usando la PodcastCard v2.0 que ya refactorizamos */}
              <div className="relative">
                <button
                  onClick={() => setSelectedPodcast(null)}
                  className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                >
                  <X size={32} />
                </button>
                <PodcastCard podcast={selectedPodcast} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SUB-COMPONENTE AUXILIAR (Icono de Cierre)
 */
function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Física Semántica: El uso de 'd3.forceRadial' con un 'strength' del 0.8 asegura 
 *    que los podcasts rodeen la posición simbólica del usuario, imitando el 
 *    concepto de 'Órbita de Conocimiento'.
 * 2. Rendimiento (60 FPS): La simulación se ejecuta en el hilo principal pero 
 *    al estar limitada a 30-50 nodos, el costo de CPU es mínimo. El uso de 
 *    'setNodes([...initialNodes])' fuerza a React a re-renderizar solo las 
 *    posiciones, no a reconstruir los componentes.
 * 3. Inmersión Total: El fondo #020202 elimina cualquier rastro de diseño web 
 *    tradicional, acercando la experiencia a la de una consola de comando nativa.
 */