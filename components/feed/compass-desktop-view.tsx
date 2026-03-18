// components/feed/compass-desktop-view.tsx
// VERSIÓN: 3.0 (NicePod Resonance Compass - Desktop Sovereign Edition)
// Misión: Proyectar la malla estelar de conocimiento en una interfaz cinemática.
// [ESTABILIZACIÓN]: Fix TS2339 y normalización de coordenadas mediante Soberanía PostGIS.

"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE DATOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';
import { cn } from '@/lib/utils';
import { Tables } from '@/types/database.types';
import { PodcastWithProfile } from '@/types/podcast';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface CompassDesktopViewProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
}

/**
 * normalizeCoordinates:
 * Transforma coordenadas geográficas de Madrid en porcentajes de pantalla 
 * para el visor estelar.
 */
const normalizeCoordinates = (point: any): { x: number; y: number } => {
  // Coordenadas base de Madrid (aproximadas para el visor)
  const CENTER_LAT = 40.4167;
  const CENTER_LNG = -3.7037;
  const RANGE = 0.05; // Radio de cobertura de la brújula

  let lat = CENTER_LAT;
  let lng = CENTER_LNG;

  // Extracción segura del metal (PostGIS Geography)
  if (typeof point === 'object' && point !== null) {
    if (point.coordinates) {
      lng = point.coordinates[0];
      lat = point.coordinates[1];
    } else if ('x' in point && 'y' in point) {
      lng = point.x;
      lat = point.y;
    }
  }

  // Mapeo a porcentaje (0-100)
  const x = ((lng - (CENTER_LNG - RANGE)) / (RANGE * 2)) * 100;
  const y = 100 - (((lat - (CENTER_LAT - RANGE)) / (RANGE * 2)) * 100);

  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y))
  };
};

export function CompassDesktopView({ userProfile, podcasts }: CompassDesktopViewProps) {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastWithProfile | null>(null);

  // Epicentro del usuario
  const userCoords = useMemo(() =>
    normalizeCoordinates(userProfile?.current_center),
    [userProfile]
  );

  return (
    <div className="relative w-full aspect-square max-w-5xl mx-auto bg-[#020202] rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/5 group">

      {/* CAPA 1: FONDO DE MALLA (GRID) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* CAPA 2: ONDAS DE RESONANCIA (Anillos concéntricos) */}
      <div className="absolute rounded-full border border-primary/20 animate-pulse"
        style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '30%', paddingTop: '30%', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute rounded-full border border-primary/10"
        style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '60%', paddingTop: '60%', transform: 'translate(-50%, -50%)' }} />

      {/* CAPA 3: EL EPICENTRO (EL USUARIO) */}
      <motion.div
        className="absolute w-6 h-6 bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary),0.8)] z-20"
        style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
      </motion.div>

      {/* CAPA 4: LOS ECOS (PODCASTS) */}
      {podcasts.map((podcast, i) => {
        // [FIX TS2339]: Usamos casting a 'any' para leer las coordenadas del metal
        const coords = normalizeCoordinates((podcast as any).final_coordinates || (podcast as any).geo_location);

        return (
          <motion.button
            key={podcast.id}
            className={cn(
              "absolute w-3 h-3 rounded-full transition-all duration-500 z-10 shadow-2xl",
              selectedPodcast?.id === podcast.id ? "bg-white scale-150 shadow-white/50" : "bg-primary/40 hover:bg-primary"
            )}
            style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => setSelectedPodcast(podcast)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.02 }}
            whileHover={{ scale: 2, zIndex: 30 }}
          />
        );
      })}

      {/* CAPA 5: INTERFAZ DE DETALLE (OVERLAY) */}
      <AnimatePresence>
        {selectedPodcast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-12 z-[100]"
            onClick={() => setSelectedPodcast(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPodcast(null)}
                className="absolute -top-4 -right-4 p-3 bg-zinc-900 rounded-full border border-white/10 text-white hover:bg-red-500 transition-colors z-20 shadow-2xl"
              >
                <X size={20} />
              </button>
              <PodcastCard podcast={selectedPodcast} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD INFERIOR */}
      <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <Compass className="h-5 w-5 text-primary animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Malla Estelar</span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">Madrid Resonance Active</span>
        </div>
      </div>
    </div>
  );
}