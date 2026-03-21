// components/geo/user-location-marker.tsx
// VERSIÓN: 1.0 (NicePod Voyager Avatar - The Resonance Core)
// Misión: Representar al usuario en la malla con anillos de resonancia y brújula activa.
// [ESTABILIZACIÓN]: Implementación de telemetría de rumbo (Heading) y pulsos concéntricos.

"use client";

import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { Marker } from "react-map-gl";

/**
 * INTERFAZ: UserLocationMarkerProps
 */
interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean; // TRUE si el usuario está captando un eco cercano
}

/**
 * UserLocationMarker: El epicentro de la experiencia 'Pokémon GO'.
 * Proyecta la posición del Voyager y su rango de acción semántica.
 */
const UserLocationMarkerComponent = ({
  location,
  isResonating
}: UserLocationMarkerProps) => {

  const { latitude, longitude, heading, accuracy } = location;

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      pitchAlignment="map" // Mantiene los anillos planos contra el asfalto WebGL
    >
      <div className="relative flex items-center justify-center">

        {/* I. ANILLO DE PRECISIÓN GPS (Hardware Awareness) */}
        {/* Este círculo representa el margen de error real devuelto por el satélite */}
        <div
          className="absolute rounded-full bg-primary/5 border border-primary/10 transition-all duration-1000"
          style={{
            // Convertimos metros de error en escala visual aproximada
            width: Math.max(accuracy * 2, 40),
            height: Math.max(accuracy * 2, 40),
          }}
        />

        {/* II. ANILLOS DE RESONANCIA CONCÉNTRICOS (GO-STYLE) */}
        {/* Generamos ondas de luz que emanan del Voyager cada segundo */}
        {[1, 2, 3].map((index) => (
          <motion.div
            key={`resonance-ring-${index}`}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{
              scale: isResonating ? [0, 4, 6] : [0, 2.5, 3.5],
              opacity: [0.6, 0.2, 0]
            }}
            transition={{
              duration: isResonating ? 2 : 4, // El pulso se acelera en resonancia
              repeat: Infinity,
              delay: index * 1.2,
              ease: "easeOut",
            }}
            className={cn(
              "absolute h-24 w-24 rounded-full border-2",
              isResonating
                ? "border-primary/40 bg-primary/5 shadow-[inset_0_0_20px_rgba(var(--primary),0.2)]"
                : "border-white/10 bg-white/5"
            )}
          />
        ))}

        {/* III. PUNTERO DE DIRECCIÓN (HEADING / BEAM) */}
        {/* Se orienta según la brújula del dispositivo móvil */}
        <AnimatePresence>
          {heading !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, rotate: heading }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute -top-12 z-20"
            >
              {/* Luz de Proyección (Haz de dirección) */}
              <div className="relative flex flex-col items-center">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-primary drop-shadow-[0_0_15px_rgba(var(--primary),1)]" />
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-32 bg-gradient-to-t from-primary/40 to-transparent blur-xl mt-[-10px] rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* IV. NÚCLEO DEL VOYAGER (CHASIS FÍSICO) */}
        <div className="relative z-30">
          {/* Sombra proyectada para elevar el avatar */}
          <div className="absolute inset-0 bg-black/60 rounded-full blur-md translate-y-2" />

          {/* Núcleo de alta fidelidad */}
          <motion.div
            animate={isResonating ? {
              scale: [1, 1.2, 1],
              boxShadow: ["0 0 20px rgba(var(--primary), 0.5)", "0 0 50px rgba(var(--primary), 0.9)", "0 0 20px rgba(var(--primary), 0.5)"]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              "h-7 w-7 rounded-full bg-white border-[4px] transition-colors duration-500 relative",
              isResonating ? "border-primary" : "border-zinc-800"
            )}
          >
            {/* Brillo interno técnico */}
            <div className="absolute inset-1 rounded-full bg-zinc-100" />

            {/* Indicador de Status en vivo */}
            <div className={cn(
              "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#020202] transition-colors duration-500",
              isResonating ? "bg-primary animate-ping" : "bg-zinc-500"
            )} />
          </motion.div>
        </div>

      </div>
    </Marker>
  );
};

// Memoizamos para evitar el jitter visual durante el movimiento de cámara
export const UserLocationMarker = memo(UserLocationMarkerComponent);
UserLocationMarker.displayName = "UserLocationMarker";

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Estética Pokémon GO: La combinación de anillos concéntricos con 'pitchAlignment="map"'
 *    asegura que las ondas de luz se proyecten sobre el suelo en la perspectiva 3D (75°).
 * 2. Telemetría en vivo: El haz de luz superior (Línea 75) utiliza el 'heading' del GPS
 *    para mostrar hacia dónde mira el usuario, facilitando la navegación táctica.
 * 3. Economía de GPU: Aunque los efectos son avanzados, utilizamos Framer Motion con 
 *    propiedades de transformación ('scale', 'opacity', 'rotate') que se ejecutan 
 *    fuera del hilo principal (GPU Accelerated).
 */