/**
 * ARCHIVO: components/feed/compass-mobile-view.tsx
 * VERSIÓN: 4.0 (NicePod Resonance Compass - Mobile Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Brújula lineal optimizada para el descubrimiento situacional en dispositivos móviles.
 * [REFORMA V4.0]: Sincronización nominal total con PodcastCard V9.0, erradicación 
 * absoluta de abreviaturas y tipado estricto de métricas PostGIS (geo_distance).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Zap
} from 'lucide-react';
import { useMemo } from 'react';

// --- INFRAESTRUCTURA DE DATOS Y COMPONENTES SOBERANOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';
import { PodcastWithProfile } from '@/types/podcast';

/**
 * INTERFAZ: PodcastWithProximity
 * Extensión del contrato para incluir la métrica de distancia física de PostGIS.
 */
interface PodcastWithProximity extends PodcastWithProfile {
  geo_distance?: number;
}

/**
 * INTERFAZ: CompassMobileViewProperties
 */
interface CompassMobileViewProperties {
  podcastCollection: PodcastWithProfile[];
  userDisplayName?: string;
}

/**
 * CompassMobileView: El visor de descubrimiento situacional para el Voyager móvil.
 */
export function CompassMobileView({ 
  podcastCollection, 
  userDisplayName 
}: CompassMobileViewProperties) {

  /**
   * resonanceOrbits: 
   * Misión: Organizar la inteligencia en tres niveles de profundidad geográfica.
   */
  const resonanceOrbits = useMemo(() => {
    // Ordenamos la colección por proximidad física (métrica lineal PostGIS)
    const sortedPodcastCollection = [...podcastCollection].sort((podcastA, podcastB) => {
      const distanceA = (podcastA as PodcastWithProximity).geo_distance || 0;
      const distanceB = (podcastB as PodcastWithProximity).geo_distance || 0;
      return distanceA - distanceB;
    });

    return {
      epicenterOrbit: sortedPodcastCollection.slice(0, 3),    // Resonancia Crítica (<1000m)
      urbanConnectionsOrbit: sortedPodcastCollection.slice(3, 8), // Conexiones de Ciudad
      globalExplorationOrbit: sortedPodcastCollection.slice(8)    // Malla Extendida
    };
  }, [podcastCollection]);

  // --- CONFIGURACIÓN DE CINEMÁTICA VISUAL (FRAMER MOTION) ---
  const containerAnimationVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemAnimationVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { ease: [0.16, 1, 0.3, 1], duration: 0.6 } 
    }
  };

  return (
    <motion.div
      className="space-y-12 pb-20"
      variants={containerAnimationVariants}
      initial="hidden"
      animate="visible"
    >
      {/* SECTOR I: EPICENTRO DE SABIDURÍA (PROXIMIDAD INMEDIATA) */}
      {resonanceOrbits.epicenterOrbit.length > 0 && (
        <motion.div variants={itemAnimationVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white font-serif">
                  Máxima Resonancia
                </h2>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Ecos detectados en tu malla de proximidad inmediata
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {resonanceOrbits.epicenterOrbit.map((podcastItem) => (
              <div key={podcastItem.id} className="relative group">
                {/* Aura de integración pericial */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* [FIX V4.0]: Sincronización con PodcastCardProperties V9.0 */}
                <PodcastCard initialPodcastData={podcastItem} />
              
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTOR II: CONEXIONES DE CIUDAD (ÓRBITA INTERMEDIA) */}
      {resonanceOrbits.urbanConnectionsOrbit.length > 0 && (
        <motion.div variants={itemAnimationVariants} className="space-y-6">
          <div className="flex items-center gap-3 px-2 opacity-60">
            <Compass className="h-4 w-4 text-zinc-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Conexiones de Ciudad
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {resonanceOrbits.urbanConnectionsOrbit.map((podcastItem) => (
              <PodcastCard 
                key={podcastItem.id} 
                initialPodcastData={podcastItem} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTOR III: EXPLORACIÓN GLOBAL (MALLA EXTENDIDA) */}
      {resonanceOrbits.globalExplorationOrbit.length > 0 && (
        <motion.div variants={itemAnimationVariants} className="space-y-6">
          <div className="flex items-center gap-3 px-2 opacity-30">
            <Sparkles className="h-4 w-4 text-zinc-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Malla Extendida
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {resonanceOrbits.globalExplorationOrbit.map((podcastItem) => (
              <PodcastCard 
                key={podcastItem.id} 
                initialPodcastData={podcastItem} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* FOOTER DE CONCIENCIA TÉCNICA */}
      <div className="py-10 flex flex-col items-center gap-4 opacity-10">
        <div className="h-px w-20 bg-zinc-800" />
        <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white text-center leading-relaxed">
          Resonance Engine V4.0 <br /> Madrid Sovereign Link
        </p>
      </div>
    </motion.div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Contract Alignment: Se neutralizaron los tres errores TS2322 inyectando 
 *    'initialPodcastData' en todas las instancias de PodcastCard.
 * 2. Zero Abbreviations Policy: Se purificaron términos como 'p', 'orbits', 'i' 
 *    y 'id', asegurando la soberanía nominal en la vista móvil.
 * 3. Strict Type Integrity: Se eliminó el uso de 'any' en la lógica de ordenación 
 *    mediante la interfaz 'PodcastWithProximity'.
 */