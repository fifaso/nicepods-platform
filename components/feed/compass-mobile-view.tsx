/**
 * ARCHIVO: components/feed/compass-mobile-view.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Brújula lineal para dispositivos móviles.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
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
 */
interface PodcastWithProximity extends PodcastWithProfile {
  geographicDistanceMagnitude?: number;
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
   */
  const resonanceOrbits = useMemo(() => {
    const sortedPodcastCollection = [...podcastCollection].sort((podcastA, podcastB) => {
      const distanceA = (podcastA as PodcastWithProximity).geographicDistanceMagnitude || 0;
      const distanceB = (podcastB as PodcastWithProximity).geographicDistanceMagnitude || 0;
      return distanceA - distanceB;
    });

    return {
      epicenterOrbit: sortedPodcastCollection.slice(0, 3),    // Resonancia Crítica
      urbanConnectionsOrbit: sortedPodcastCollection.slice(3, 8), // Conexiones de Ciudad
      globalExplorationOrbit: sortedPodcastCollection.slice(8)    // Malla Extendida
    };
  }, [podcastCollection]);

  // --- CONFIGURACIÓN DE CINEMÁTICA VISUAL ---
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
              <div key={podcastItem.identification} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <PodcastCard initialPodcastData={podcastItem} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
                key={podcastItem.identification}
                initialPodcastData={podcastItem} 
              />
            ))}
          </div>
        </motion.div>
      )}

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
                key={podcastItem.identification}
                initialPodcastData={podcastItem} 
              />
            ))}
          </div>
        </motion.div>
      )}

      <div className="py-10 flex flex-col items-center gap-4 opacity-10">
        <div className="h-px w-20 bg-zinc-800" />
        <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white text-center leading-relaxed">
          Resonance Engine V7.0 <br /> Madrid Sovereign Link
        </p>
      </div>
    </motion.div>
  );
}
