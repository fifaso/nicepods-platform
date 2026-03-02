// components/geo/live-location-map.tsx
// VERSIÓN: 1.0

"use client";

import React, { useEffect, useState, memo } from 'react';
import Map, { Marker, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { Navigation2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * INTERFAZ: LiveLocationMapProps
 * Define los parámetros de telemetría capturados por el hardware GPS.
 */
interface LiveLocationMapProps {
  latitude: number;
  longitude: number;
  /**
   * accuracy: El margen de error del GPS en metros. 
   * Se visualiza como un radio de incertidumbre Aurora.
   */
  accuracy: number;
  className?: string;
}

/**
 * COMPONENTE: LiveLocationMap
 * El visor satelital especializado para operaciones de campo.
 * 
 * [CARACTERÍSTICAS TÁCTICAS]:
 * 1. High-Zoom Focus: Nivel 18 para visualización de detalles arquitectónicos.
 * 2. Auto-Tracking: Sincronía automática con las coordenadas del Admin.
 * 3. Minimalismo HUD: Se eliminan controles ruidosos para maximizar el área de visión.
 */
export const LiveLocationMap = memo(({ 
  latitude, 
  longitude, 
  accuracy,
  className 
}: LiveLocationMapProps) => {
  
  // --- ESTADO DE LA CÁMARA (VIEWPORT) ---
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 18,     // Resolución de proximidad extrema
    pitch: 45,    // Inclinación cinemática para profundidad 3D
    bearing: 0    // Orientación norte por defecto
  });

  /**
   * [SINCRO]: Seguimiento de Movimiento
   * Cada vez que el useGeoEngine reporta un cambio de posición,
   * la cámara del mapa se desplaza suavemente hacia el nuevo nodo.
   */
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      latitude,
      longitude
    }));
  }, [latitude, longitude]);

  // Gestión de cambio manual de cámara (si el Admin desea explorar el entorno)
  const handleMove = (event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className={cn(
      "w-full h-full relative rounded-full overflow-hidden border-2 border-primary/20",
      "shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] bg-zinc-950",
      className
    )}>
      
      {/* 
          I. MOTOR MAPBOX (SATELLITE ENGINE) 
          Usamos la versión 12 de calles satelitales para máxima nitidez.
      */}
      <Map
        {...viewState}
        onMove={handleMove}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false} // Limpieza visual absoluta
        reuseMaps
      >
        
        {/* 
            II. MARCADOR DE SOBERANÍA (THE ADMIN POINTER)
            Representa físicamente al administrador sobre el terreno.
        */}
        <Marker latitude={latitude} longitude={longitude} anchor="center">
          <div className="relative flex items-center justify-center">
            
            {/* Círculo de Incertidumbre GPS (Visualiza la precisión real) */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bg-primary rounded-full border border-primary/40"
              style={{ 
                // Escalamos el radio visual según la precisión real del hardware
                width: `${Math.max(accuracy * 2, 40)}px`, 
                height: `${Math.max(accuracy * 2, 40)}px` 
              }} 
            />

            {/* El Puntero de Hardware (Core) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.6)] border-2 border-white ring-4 ring-black/40">
                <Navigation2 className="w-4 h-4 text-black fill-current" />
              </div>
              
              {/* Vínculo con la base (Micro-pin) */}
              <div className="w-1 h-2 bg-white rounded-b-full shadow-lg" />
            </div>

          </div>
        </Marker>

      </Map>

      {/* 
          III. CAPA DE INTEGRACIÓN VISUAL (GLASS OVERLAY)
          Asegura que el mapa se integre cromáticamente con la atmósfera Aurora.
      */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Viñeteado de profundidad para efecto lente */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
        
        {/* Filtro de color sutil para unificar con el tema Nebulosa */}
        <div className="absolute inset-0 bg-primary/5 mix-blend-color" />
      </div>

      {/* 
          IV. INDICADOR DE ESTADO DE SEÑAL
          Telemetría visual sobre el mapa.
      */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              accuracy < 15 ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span className="text-[7px] font-black text-white/60 uppercase tracking-widest">
              GPS Precision: {accuracy.toFixed(1)}m
            </span>
        </div>
      </div>

    </div>
  );
});

// Asignación de nombre para auditoría del Build Shield
LiveLocationMap.displayName = "LiveLocationMap";

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Precisión Geo: El uso de zoom 18 es el límite seguro para evitar que 
 *    los tiles satelitales se pixelicen, ofreciendo al Admin una vista 
 *    nítida de obstáculos y puntos de siembra.
 * 2. Rendimiento (Memoización): Al envolver el mapa en 'memo', garantizamos 
 *    que los re-renderizados del formulario de 'Semilla Narrativa' en el 
 *    padre (GeoScannerUI) no reinicien el motor WebGL, ahorrando ciclos de GPU.
 * 3. Diseño Adaptativo: El círculo de precisión visualiza físicamente el 
 *    parámetro 'accuracy' de la Geolocation API, educando al Administrador 
 *    sobre cuándo es el momento óptimo para pulsar 'Forjar' (cuando el 
 *    círculo es más pequeño).
 */