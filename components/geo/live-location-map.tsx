// components/geo/live-location-map.tsx
// VERSIÓN: 1.1

"use client";

import React, { useEffect, useState, memo } from 'react';
import Map, { Marker } from 'react-map-gl';
import type { ViewStateChangeEvent } from 'react-map-gl'; // [FIX TS2709]: Importación de tipo explícita
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { Navigation2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * INTERFAZ: LiveLocationMapProps
 * Define los parámetros de telemetría inyectados por el GeoEngine.
 */
interface LiveLocationMapProps {
  latitude: number;
  longitude: number;
  /**
   * accuracy: El radio de precisión del GPS en metros.
   * Se visualiza como una malla pulsante alrededor del administrador.
   */
  accuracy: number;
  className?: string;
}

/**
 * COMPONENTE: LiveLocationMap
 * El visor de campo especializado para la siembra de sabiduría urbana.
 * 
 * [ARQUITECTURA DE ALTA FIDELIDAD]:
 * 1. Satellite Streets V12: Máxima resolución de texturas y etiquetas.
 * 2. Inercia de Cámara: Seguimiento fluido del pulso del Administrador.
 * 3. Aislamiento de GPU: El uso de 'memo' previene recalentamiento por re-renders.
 */
const LiveLocationMapComponent = ({ 
  latitude, 
  longitude, 
  accuracy,
  className 
}: LiveLocationMapProps) => {
  
  // --- ESTADO DE CÁMARA TÁCTICA ---
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 18,     // Zoom de grado arquitectónico
    pitch: 45,    // Ángulo cinemático para profundidad 3D
    bearing: 0
  });

  /**
   * [SINCRO]: Auto-Tracking
   * Asegura que la cámara se desplace automáticamente hacia las nuevas 
   * coordenadas cada vez que el hardware GPS reporta movimiento.
   */
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude,
      longitude
    }));
  }, [latitude, longitude]);

  /**
   * handleMove:
   * Gestiona el cambio manual de perspectiva si el Admin decide explorar 
   * el entorno inmediato antes de forjar la crónica.
   */
  const handleMove = (event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className={cn(
      "w-full h-full relative rounded-full overflow-hidden border-2 border-primary/20",
      "shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] bg-[#050505]",
      className
    )}>
      
      {/* I. MOTOR SATELITAL (MAPBOX V12) */}
      <Map
        {...viewState}
        onMove={handleMove}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        
        {/* II. MARCADOR DE SOBERANÍA (THE ADMIN NODE) */}
        <Marker latitude={latitude} longitude={longitude} anchor="center">
          <div className="relative flex items-center justify-center">
            
            {/* 
                ANILLO DE INCERTIDUMBRE (ACCURACY VISUALIZER) 
                Visualiza el margen de error real del satélite.
            */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bg-primary/20 rounded-full border border-primary/40"
              style={{ 
                // Convertimos la precisión métrica en escala visual
                width: `${Math.max(accuracy * 2, 40)}px`, 
                height: `${Math.max(accuracy * 2, 40)}px` 
              }} 
            />

            {/* El Puntero de Hardware */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary),0.8)] border-2 border-white ring-4 ring-black/50 transition-transform duration-500 hover:scale-110">
                <Navigation2 className="w-4 h-4 text-black fill-current" />
              </div>
              {/* Punto de anclaje físico */}
              <div className="w-1 h-2 bg-white rounded-b-full shadow-2xl" />
            </div>

          </div>
        </Marker>

      </Map>

      {/* III. CAPA DE ATMÓSFERA Y HUD */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Viñeteado Industrial */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
        
        {/* Indicador de Telemetría Superior */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2">
          <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl">
              <Target size={12} className={cn(
                "transition-colors",
                accuracy < 10 ? "text-emerald-500" : "text-amber-500"
              )} />
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] tabular-nums">
                Signal Accuracy: {accuracy.toFixed(1)}m
              </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// [FIX]: Envolvemos en memo para asegurar que el motor WebGL no sufra 
// micro-cortes por re-renders del formulario padre.
export const LiveLocationMap = memo(LiveLocationMapComponent);

// [FIX DEFINITIVO]: Display name para cumplimiento del linter.
LiveLocationMap.displayName = "LiveLocationMap";

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Build: Al importar ViewStateChangeEvent como 'import type', 
 *    el compilador de Vercel no intenta buscar el espacio de nombres en 
 *    tiempo de ejecución, eliminando el error fatal TS2709.
 * 2. Física de Cámara: El uso de useEffect para sincronizar la lat/lng con 
 *    el viewState garantiza un seguimiento determinista del Admin.
 * 3. Identidad Visual: El diseño circular y el uso del color 'primary' (262.1 83.3% 57.8%) 
 *    aseguran que esta herramienta de administración sea visualmente 
 *    compatible con el 'Portal de Búsqueda' y el 'Dashboard'.
 */