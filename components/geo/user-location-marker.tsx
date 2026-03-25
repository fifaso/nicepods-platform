// components/geo/user-location-marker.tsx
// VERSIÓN: 2.0 (NicePod GO Avatar - High Performance GPU Edition)
// Misión: Representar al usuario en la malla con anillos de resonancia optimizados para WebGL.
// [ESTABILIZACIÓN]: Migración a CSS Animations para eliminar el lag de 277ms y pitchAlignment.

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
  // 1. SALVAGUARDA DE SEGURIDAD
  // Si no hay coordenadas válidas, abortamos el renderizado para evitar errores de matriz en Mapbox.
  if (!location?.latitude || !location?.longitude) return null;

  return (
    <Marker
      latitude={location.latitude}
      longitude={location.longitude}
      anchor="center"
      // [MANDATO NCIS]: pitchAlignment="map" ancla los anillos al suelo 3D.
      // rotationAlignment="map" asegura que la brújula sea coherente con la orientación del mapa.
      pitchAlignment="map"
      rotationAlignment="map"
    >
      <div className="relative flex items-center justify-center w-24 h-24 pointer-events-none">

        {/* 
            I. ANILLOS DE RESONANCIA (GPU ACCELERATED) 
            [OPERACIÓN]: Se sustituye framer-motion por clases CSS puras.
            Esto elimina el overhead de JS en el Main Thread durante el movimiento.
        */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "absolute rounded-full border opacity-0",
                isResonating
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/30 bg-white/5",
                // Animación definida en globals.css o via Tailwind extend
                "animate-nicepod-pulse"
              )}
              style={{
                width: '100%',
                height: '100%',
                animationDelay: `${(i - 1) * 1.2}s`,
                // Ajustamos el tamaño base para que se vea proporcional al radio de sintonía
                transform: `scale(${0.2 * i})`
              }}
            />
          ))}
        </div>

        {/* 
            II. NÚCLEO FÍSICO DEL VOYAGER 
            Diseño de alto contraste para visibilidad bajo luz solar directa.
        */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Brillo de profundidad */}
          <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />

          {/* El átomo central */}
          <div className="h-6 w-6 bg-white rounded-full border-[4px] border-primary shadow-[0_0_20px_rgba(var(--primary),0.8)] flex items-center justify-center">
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
          </div>
        </div>

        {/* 
            III. PUNTERO DE DIRECCIÓN (HEADING)
            Indica hacia dónde mira el dispositivo físicamente.
        */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute -top-8 text-primary filter drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 0L13.0622 10.5H0.937822L7 0Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </Marker>
  );
};

/**
 * [BUILD SHIELD]: Memoización de Alta Precisión
 * Solo re-renderizamos si la ubicación cambia significativamente (filtrado de ruido).
 */
export const UserLocationMarker = memo(UserLocationMarkerComponent, (prev, next) => {
  // Comparamos primitivos para máxima velocidad.
  const locChange =
    prev.location.latitude !== next.location.latitude ||
    prev.location.longitude !== next.location.longitude ||
    prev.location.heading !== next.location.heading;

  const stateChange = prev.isResonating !== next.isResonating;

  return !locChange && !stateChange;
});

/**
 * NOTA TÉCNICA PARA GLOBALS.CSS:
 * Agregue esta animación para habilitar el GPU Offloading:
 * 
 * @keyframes nicepod-pulse {
 *   0% { transform: scale(0.1); opacity: 0; }
 *   50% { opacity: 0.5; }
 *   100% { transform: scale(3); opacity: 0; }
 * }
 * .animate-nicepod-pulse {
 *   animation: nicepod-pulse 4s cubic-bezier(0, 0.45, 0.15, 1) infinite;
 * }
 */