// components/feed/compass-mobile-view.tsx
// VERSIÓN: 3.0 (NicePod Resonance Compass - Mobile Sovereign Edition)
// Misión: Brújula lineal optimizada para el descubrimiento situacional.
// [ESTABILIZACIÓN]: Fix TS2339 y alineación con la estética Aurora Glass.

"use client";

import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Zap
} from 'lucide-react';
import { useMemo } from 'react';

// --- INFRAESTRUCTURA DE DATOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';
import { PodcastWithProfile } from '@/types/podcast';

interface CompassMobileViewProps {
  podcasts: PodcastWithProfile[];
  userName?: string;
}

/**
 * COMPONENTE: CompassMobileView
 */
export function CompassMobileView({ podcasts, userName }: CompassMobileViewProps) {

  // 1. ORGANIZACIÓN DE ÓRBITAS (Resonancia Semántica)
  // En la V2.6, la distancia ya viene calculada del servidor como 'geo_distance'.
  const orbits = useMemo(() => {
    // Ordenamos por proximidad física (métrica real PostGIS)
    const sorted = [...podcasts].sort((a, b) => (a as any).geo_distance - (b as any).geo_distance);

    return {
      epicenter: sorted.slice(0, 3),    // Órbita 1: Resonancia Crítica (<1km)
      connections: sorted.slice(3, 8),  // Órbita 2: Conexiones de Ciudad
      exploration: sorted.slice(8)      // Órbita 3: Exploración Global
    };
  }, [podcasts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.6 } }
  };

  return (
    <motion.div
      className="space-y-12 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* SECTOR I: EPICENTRO DE SABIDURÍA */}
      {orbits.epicenter.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">Máxima Resonancia</h2>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ecos a menos de 1000 metros de ti</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {orbits.epicenter.map(p => (
              <div key={p.id} className="relative group">
                {/* Resplandor de proximidad */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <PodcastCard podcast={p} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTOR II: CONEXIONES DE CIUDAD */}
      {orbits.connections.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3 px-2 opacity-60">
            <Compass className="h-4 w-4 text-zinc-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Conexiones de Ciudad</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {orbits.connections.map(p => <PodcastCard key={p.id} podcast={p} />)}
          </div>
        </motion.div>
      )}

      {/* SECTOR III: EXPLORACIÓN GLOBAL */}
      {orbits.exploration.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3 px-2 opacity-30">
            <Sparkles className="h-4 w-4 text-zinc-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Malla Extendida</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {orbits.exploration.map(p => <PodcastCard key={p.id} podcast={p} />)}
          </div>
        </motion.div>
      )}

      {/* FOOTER DE CONCIENCIA */}
      <div className="py-10 flex flex-col items-center gap-4 opacity-10">
        <div className="h-px w-20 bg-zinc-800" />
        <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white text-center leading-relaxed">
          Resonance Engine V2.6 <br /> Madrid Sovereign Link
        </p>
      </div>
    </motion.div>
  );
}