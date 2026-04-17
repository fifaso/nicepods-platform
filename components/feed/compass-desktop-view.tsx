/**
 * ARCHIVO: components/feed/compass-desktop-view.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Proyectar la malla estelar de conocimiento.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE DATOS Y COMPONENTES SOBERANOS ---
import { PodcastCard } from '@/components/podcast/podcast-card';
import { cn } from '@/lib/utils';
import { Tables } from '@/types/database.types';
import { PodcastWithProfile, GeoLocation } from '@/types/podcast';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * INTERFAZ: CompassDesktopViewProperties
 */
interface CompassDesktopViewProperties {
  userResonanceProfile: ResonanceProfile | null;
  podcastCollection: PodcastWithProfile[];
}

/**
 * INTERFAZ: LegacyPostGISPoint
 */
interface LegacyPostGISPoint {
  x?: number;
  y?: number;
  coordinates?: [number, number];
}

/**
 * normalizeGeographicCoordinates:
 */
const normalizeGeographicCoordinates = (geographicPoint: GeoLocation | LegacyPostGISPoint | unknown | null): { xAxisPercentage: number; yAxisPercentage: number } => {
  const CENTER_LATITUDE = 40.4167;
  const CENTER_LONGITUDE = -3.7037;
  const COVERAGE_RANGE = 0.05;

  let latitude = CENTER_LATITUDE;
  let longitude = CENTER_LONGITUDE;

  if (typeof geographicPoint === 'object' && geographicPoint !== null) {
    const point = geographicPoint as LegacyPostGISPoint;
    if (point.coordinates && Array.isArray(point.coordinates)) {
      longitude = point.coordinates[0];
      latitude = point.coordinates[1];
    } else if ('x' in point && 'y' in point && typeof point.x === 'number' && typeof point.y === 'number') {
      longitude = point.x;
      latitude = point.y;
    }
  }

  const xAxisPercentageCalculation = ((longitude - (CENTER_LONGITUDE - COVERAGE_RANGE)) / (COVERAGE_RANGE * 2)) * 100;
  const yAxisPercentageCalculation = 100 - (((latitude - (CENTER_LATITUDE - COVERAGE_RANGE)) / (COVERAGE_RANGE * 2)) * 100);

  return {
    xAxisPercentage: Math.max(5, Math.min(95, xAxisPercentageCalculation)),
    yAxisPercentage: Math.max(5, Math.min(95, yAxisPercentageCalculation))
  };
};

/**
 * CompassDesktopView: El visor inmersivo de la Malla.
 */
export function CompassDesktopView({ userResonanceProfile, podcastCollection }: CompassDesktopViewProperties) {
  
  const [selectedPodcastMatch, setSelectedPodcastMatch] = useState<PodcastWithProfile | null>(null);

  const userNormalizedCoordinates = useMemo(() =>
    normalizeGeographicCoordinates(userResonanceProfile?.current_center),
    [userResonanceProfile]
  );

  return (
    <div className="relative w-full aspect-square max-w-5xl mx-auto bg-[#020202] rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/5 group">

      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div 
        className="absolute rounded-full border border-primary/20 animate-pulse"
        style={{ 
          left: `${userNormalizedCoordinates.xAxisPercentage}%`, 
          top: `${userNormalizedCoordinates.yAxisPercentage}%`, 
          width: '30%', 
          paddingTop: '30%', 
          transform: 'translate(-50%, -50%)' 
        }} 
      />
      <div 
        className="absolute rounded-full border border-primary/10"
        style={{ 
          left: `${userNormalizedCoordinates.xAxisPercentage}%`, 
          top: `${userNormalizedCoordinates.yAxisPercentage}%`, 
          width: '60%', 
          paddingTop: '60%', 
          transform: 'translate(-50%, -50%)' 
        }} 
      />

      <motion.div
        className="absolute w-6 h-6 bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.8)] z-20"
        style={{ 
          left: `${userNormalizedCoordinates.xAxisPercentage}%`, 
          top: `${userNormalizedCoordinates.yAxisPercentage}%`, 
          transform: 'translate(-50%, -50%)' 
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
      </motion.div>

      {podcastCollection.map((podcastItem, podcastIndex) => {
        const itemCoordinates = normalizeGeographicCoordinates(podcastItem.geographicLocationPoint);

        return (
          <motion.button
            key={podcastItem.identification}
            className={cn(
              "absolute w-3 h-3 rounded-full transition-all duration-500 z-10 shadow-2xl",
              selectedPodcastMatch?.identification === podcastItem.identification
                ? "bg-white scale-150 shadow-white/50" 
                : "bg-primary/40 hover:bg-primary"
            )}
            style={{ 
              left: `${itemCoordinates.xAxisPercentage}%`, 
              top: `${itemCoordinates.yAxisPercentage}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            onClick={() => setSelectedPodcastMatch(podcastItem)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + podcastIndex * 0.02 }}
            whileHover={{ scale: 2, zIndex: 30 }}
          />
        );
      })}

      <AnimatePresence>
        {selectedPodcastMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-12 z-[100]"
            onClick={() => setSelectedPodcastMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg relative"
              onClick={(mouseEvent) => mouseEvent.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPodcastMatch(null)}
                className="absolute -top-4 -right-4 p-3 bg-zinc-900 rounded-full border border-white/10 text-white hover:bg-red-500 transition-colors z-20 shadow-2xl"
              >
                <X size={20} />
              </button>
              
              <PodcastCard initialPodcastData={selectedPodcastMatch} />
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
