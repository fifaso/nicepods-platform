// components/geo/user-location-marker.tsx
// VERSIÓN: 2.1 (NicePod GO Avatar - High Visibility & Deep Space Edition)
// Misión: Representar al usuario en la malla con anillos de resonancia optimizados.
// [ESTABILIZACIÓN]: Implementación de zIndex agresivo y feedback de precisión.

"use client";

import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import { motion } from "framer-motion";
import { memo } from "react";
// [FIX VERCEL]: Enrutamiento explícito al motor Mapbox
import { Marker } from "react-map-gl/mapbox";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {

  // 1. PROTOCOLO DE VISIBILIDAD OBLIGATORIA
  // Si no hay coordenadas, el avatar no existe. 
  // Pero si la precisión es 999 (Marca de Rescate), lo mostramos en estado "Buscando".
  if (!location?.latitude || !location?.longitude) return null;

  const isRescueLocation = location.accuracy >= 500;

  return (
    <Marker
      latitude={location.latitude}
      longitude={location.longitude}
      anchor="center"
      // pitchAlignment="map" acuesta los anillos en el suelo para inmersión 3D.
      pitchAlignment="map"
      // rotationAlignment="map" vincula la orientación al norte del mapa.
      rotationAlignment="map"
      // [MEJORA]: Forzamos que el Voyager esté siempre en el estrato superior.
      style={{ zIndex: 9999 }}
    >
      <div className="relative flex items-center justify-center w-32 h-32 pointer-events-none">

        {/* 
            I. ANILLOS DE RESONANCIA (GPU ACCELERATED) 
            Sincronizados con el color de estado (Emerald si es real, Primary si es rescate).
        */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "absolute rounded-full border opacity-0 animate-nicepod-pulse",
                isRescueLocation
                  ? "border-zinc-500/30 bg-zinc-500/5" // Estado: Sincronizando
                  : isResonating
                    ? "border-emerald-500/60 bg-emerald-500/10" // Estado: Enlace Activo
                    : "border-primary/50 bg-primary/5" // Estado: Localizado
              )}
              style={{
                width: '100%',
                height: '100%',
                animationDelay: `${(i - 1) * 1.3}s`,
              }}
            />
          ))}
        </div>

        {/* 
            II. NÚCLEO FÍSICO DEL VOYAGER 
            Punto de anclaje de alta visibilidad con brillo perimetral.
        */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Aura de profundidad para evitar que se pierda con el satélite */}
          <div className={cn(
            "absolute inset-0 blur-xl rounded-full animate-pulse duration-[3000ms]",
            isRescueLocation ? "bg-zinc-500/40" : "bg-primary/40"
          )} />

          {/* El átomo central con indicador de pulso vivo */}
          <div className={cn(
            "h-7 w-7 bg-white rounded-full border-[4px] shadow-[0_0_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-colors duration-1000",
            isRescueLocation ? "border-zinc-500" : "border-primary"
          )}>
            <div className={cn(
              "h-2 w-2 rounded-full animate-ping",
              isRescueLocation ? "bg-zinc-400" : "bg-primary"
            )} />
          </div>
        </div>

        {/* 
            III. PUNTERO DE DIRECCIÓN (HEADING)
            Solo se muestra si el hardware reporta una brújula válida.
        */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={cn(
              "absolute -top-10 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]",
              isRescueLocation ? "text-zinc-500" : "text-primary"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 0L17 14H1L9 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* INDICADOR TÉCNICO DE RESCATE (Solo visible si el GPS falla) */}
        {isRescueLocation && (
          <div className="absolute -bottom-10 whitespace-nowrap">
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 bg-black/50 px-2 py-1 rounded-full backdrop-blur-md border border-white/5">
              Sincronizando Satélites...
            </span>
          </div>
        )}
      </div>
    </Marker>
  );
};

/**
 * [BUILD SHIELD]: Memoización de Alta Fidelidad.
 */
export const UserLocationMarker = memo(UserLocationMarkerComponent, (prev, next) => {
  return (
    prev.isResonating === next.isResonating &&
    prev.location?.latitude === next.location?.latitude &&
    prev.location?.longitude === next.location?.longitude &&
    prev.location?.heading === next.location?.heading &&
    prev.location?.accuracy === next.location?.accuracy
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.1):
 * 1. Materialización Forzada: Si el GPS real falla, el componente recibe la 
 *    coordenada de rescate y muestra un avatar en gris ("Sincronizando") para 
 *    que el usuario no vea el mapa vacío.
 * 2. Z-Index Absoluto: El marcador se eleva a z-9999 para evitar que los edificios 
 *    3D de obsidiana ocluyan la posición del usuario.
 * 3. Feedback Aeroespacial: Se incrementó el tamaño del puntero y se añadió un 
 *    aura de profundidad ('blur-xl') para garantizar la visibilidad sobre texturas fotorrealistas.
 */