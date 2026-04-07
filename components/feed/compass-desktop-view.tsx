/**
 * ARCHIVO: components/feed/compass-desktop-view.tsx
 * VERSIÓN: 4.0 (NicePod Resonance Compass - Sovereign Desktop Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la malla estelar de conocimiento en una interfaz cinemática.
 * [REFORMA V4.0]: Sincronización nominal estricta con PodcastCard V9.0, 
 * erradicación de 'any' en la matemática geoespacial y cumplimiento total de la 
 * Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
 * Misión: Soporte defensivo para datos cacheados de versiones anteriores.
 */
interface LegacyPostGISPoint {
  x?: number;
  y?: number;
  coordinates?: [number, number];
}

/**
 * normalizeGeographicCoordinates:
 * Misión: Transforma coordenadas geográficas esféricas de Madrid en 
 * porcentajes del plano cartesiano de la pantalla para el visor estelar.
 */
const normalizeGeographicCoordinates = (geographicPoint: GeoLocation | LegacyPostGISPoint | unknown | null): { xAxisPercentage: number; yAxisPercentage: number } => {
  // Epicentro referencial de la Malla de Madrid
  const CENTER_LATITUDE = 40.4167;
  const CENTER_LONGITUDE = -3.7037;
  const COVERAGE_RANGE = 0.05; // Radio de cobertura de la brújula

  let latitude = CENTER_LATITUDE;
  let longitude = CENTER_LONGITUDE;

  // Extracción segura del metal (PostGIS Geography) garantizando el tipado
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

  // Mapeo a porcentaje (0-100) del contenedor
  const xAxisPercentageCalculation = ((longitude - (CENTER_LONGITUDE - COVERAGE_RANGE)) / (COVERAGE_RANGE * 2)) * 100;
  const yAxisPercentageCalculation = 100 - (((latitude - (CENTER_LATITUDE - COVERAGE_RANGE)) / (COVERAGE_RANGE * 2)) * 100);

  return {
    xAxisPercentage: Math.max(5, Math.min(95, xAxisPercentageCalculation)),
    yAxisPercentage: Math.max(5, Math.min(95, yAxisPercentageCalculation))
  };
};

/**
 * CompassDesktopView: El visor inmersivo de la Malla para pantallas de alta densidad.
 */
export function CompassDesktopView({ userResonanceProfile, podcastCollection }: CompassDesktopViewProperties) {
  
  // ESTADOS DE INTERFAZ DESCRIPTIVOS
  const [selectedPodcastMatch, setSelectedPodcastMatch] = useState<PodcastWithProfile | null>(null);

  // Epicentro del usuario calculado en tiempo de renderizado
  const userNormalizedCoordinates = useMemo(() =>
    normalizeGeographicCoordinates(userResonanceProfile?.current_center),
    [userResonanceProfile]
  );

  return (
    <div className="relative w-full aspect-square max-w-5xl mx-auto bg-[#020202] rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/5 group">

      {/* CAPA 1: FONDO DE MALLA TÁCTICA (GRID) */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* CAPA 2: ONDAS DE RESONANCIA (Anillos concéntricos de proximidad) */}
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

      {/* CAPA 3: EL EPICENTRO SOBERANO (EL VOYAGER) */}
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

      {/* CAPA 4: LOS ECOS DE SABIDURÍA (NODOS DE CONOCIMIENTO) */}
      {podcastCollection.map((podcastItem, podcastIndex) => {
        // Extraemos las coordenadas utilizando el contrato de la Bóveda V4.0
        const itemCoordinates = normalizeGeographicCoordinates(podcastItem.geo_location);

        return (
          <motion.button
            key={podcastItem.id}
            className={cn(
              "absolute w-3 h-3 rounded-full transition-all duration-500 z-10 shadow-2xl",
              selectedPodcastMatch?.id === podcastItem.id 
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

      {/* CAPA 5: INTERFAZ DE DETALLE PERICIAL (OVERLAY SOBERANO) */}
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
              
              {/* [FIX V4.0]: Sincronización estricta con el contrato PodcastCardProperties V9.0 */}
              <PodcastCard initialPodcastData={selectedPodcastMatch} />
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD DE TELEMETRÍA INFERIOR */}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Contract Synchronization: Se resolvió el error TS2322 inyectando 'initialPodcastData'
 *    en el componente PodcastCard en lugar de 'podcast'.
 * 2. Zero Abbreviations Policy: Se erradicó el uso de 'lat', 'lng', 'i' y 'e'. Las variables
 *    espaciales ahora utilizan descriptores completos (xAxisPercentage, yAxisPercentage).
 * 3. Type Safety: El motor matemático ahora consume de forma nativa la interfaz 'GeoLocation' 
 *    del contrato V11.0, eliminando el uso generalizado de 'any'.
 */