// components/geo/live-location-map.tsx
// VERSIÓN: 1.3

"use client";

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Navigation2, Target } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { memo, useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl';

/**
 * INTERFAZ: LiveLocationMapProps
 * Define los parámetros de telemetría inyectados por el motor geoespacial padre.
 */
interface LiveLocationMapProps {
  latitude: number;
  longitude: number;
  /**
   * accuracy: El radio de precisión del hardware GPS en metros.
   * Se visualiza como una malla pulsante de seguridad.
   */
  accuracy: number;
  className?: string;
}

/**
 * COMPONENTE: LiveLocationMap
 * El visor de campo especializado para las operaciones del Administrador.
 * 
 * [ARQUITECTURA DE ALTA FIDELIDAD]:
 * 1. Satellite Streets V12: Empleado para asegurar la visibilidad de senderos y monumentos.
 * 2. Inercia Síncrona: La cámara persigue las coordenadas con transiciones fluidas.
 * 3. Memoización Táctica: Protege al WebGL de re-renderizados causados por la UI externa.
 */
const LiveLocationMapComponent = ({
  latitude,
  longitude,
  accuracy,
  className
}: LiveLocationMapProps) => {

  // --- ESTADO DE LA CÁMARA TÁCTICA (VIEWPORT) ---
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 18,     // Nivel de detalle arquitectónico
    pitch: 45,    // Inclinación para volumen 3D
    bearing: 0    // Rumbo norte geográfico
  });

  /**
   * PROTOCOLO DE AUTO-SEGUIMIENTO
   * Mantiene el epicentro visual sincronizado con los pasos del Administrador.
   */
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude,
      longitude
    }));
  }, [latitude, longitude]);

  /**
   * GESTIÓN DE CÁMARA MANUAL
   * [RESOLUCIÓN DEFINITIVA TS2709]:
   * En lugar de importar el conflictivo 'ViewStateChangeEvent', definimos 
   * estructuralmente que el evento contiene la propiedad 'viewState'. 
   * Esto satisface al compilador de Vercel sin romper la lógica del mapa.
   */
  const handleMove = (event: { viewState: any }) => {
    setViewState(event.viewState);
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className={cn(
      "w-full h-full relative rounded-full overflow-hidden border-2 border-primary/20",
      "shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] bg-[#050505]",
      className
    )}>

      {/* 
          I. MOTOR MAPBOX (SATELLITE ENGINE) 
          Desactivamos el attributionControl para mantener la estética de 'Instrumento'
      */}
      <Map
        {...viewState}
        onMove={handleMove}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >

        {/* 
            II. MARCADOR SOBERANO (THE ADMIN NODE)
            La representación visual de la autoridad en el terreno.
        */}
        <Marker latitude={latitude} longitude={longitude} anchor="center">
          <div className="relative flex items-center justify-center">

            {/* 
                ANILLO DE INCERTIDUMBRE (GPS ACCURACY)
                Su diámetro físico en píxeles refleja el margen de error de la señal satelital.
            */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bg-primary/20 rounded-full border border-primary/40"
              style={{
                width: `${Math.max(accuracy * 2, 40)}px`,
                height: `${Math.max(accuracy * 2, 40)}px`
              }}
            />

            {/* El Puntero de Hardware */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary),0.8)] border-2 border-white ring-4 ring-black/50 transition-transform duration-500 hover:scale-110">
                <Navigation2 className="w-4 h-4 text-black fill-current" />
              </div>
              {/* Estaca física para anclaje visual preciso */}
              <div className="w-1 h-2 bg-white rounded-b-full shadow-2xl" />
            </div>

          </div>
        </Marker>

      </Map>

      {/* 
          III. CAPA DE ATMÓSFERA Y HUD (GLASS OVERLAY)
          Integra cromáticamente el mapa satelital (verde/marrón) con el 
          universo visual Aurora de NicePod (púrpura/negro).
      */}
      <div className="absolute inset-0 pointer-events-none z-20">

        {/* Lente de viñeteado para enfoque central */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

        {/* Telemetría de Precisión (HUD Superior) */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2">
          <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl">
            <Target size={12} className={cn(
              "transition-colors duration-500",
              accuracy < 15 ? "text-emerald-500" : "text-amber-500"
            )} />
            <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] tabular-nums">
              Precisión GPS: {accuracy.toFixed(1)}m
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

// [MEMOIZACIÓN TÁCTICA]
// Previene renderizados de WebGL cuando la UI externa cambia de estado.
export const LiveLocationMap = memo(LiveLocationMapComponent);

// Propiedad obligatoria para el linter (ESLint) en componentes envueltos en memo.
LiveLocationMap.displayName = "LiveLocationMap";