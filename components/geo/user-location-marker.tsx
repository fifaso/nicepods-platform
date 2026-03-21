// components/geo/user-location-marker.tsx
// VERSIÓN: 1.2 (NicePod GO Avatar - Standard Utils Edition)
// Misión: Representar al usuario en la malla con anillos de resonancia.

"use client";

import { motion } from "framer-motion";

// [FIX VERCEL]: Enrutamiento explícito al motor Mapbox
import { Marker } from "react-map-gl/mapbox";

import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import { memo } from "react";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {
  return (
    <Marker latitude={location.latitude} longitude={location.longitude} anchor="center">
      <div className="relative flex items-center justify-center">

        {/* ANILLOS DE RESONANCIA */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: isResonating ? 5 : 3.5, opacity: 0 }}
            transition={{
              duration: isResonating ? 2 : 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
            className={cn(
              "absolute h-20 w-20 rounded-full border",
              isResonating ? 'border-primary/50 bg-primary/10' : 'border-white/20 bg-white/5'
            )}
          />
        ))}

        {/* NÚCLEO FÍSICO DEL VOYAGER */}
        <div className="h-5 w-5 bg-white rounded-full border-[3px] border-primary shadow-[0_0_20px_rgba(var(--primary),1)] z-10" />

        {/* PUNTERO DE DIRECCIÓN */}
        {location.heading !== null && (
          <motion.div
            animate={{ rotate: location.heading }}
            className="absolute -top-6 text-primary"
          >
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-current" />
          </motion.div>
        )}
      </div>
    </Marker>
  );
};

export const UserLocationMarker = memo(UserLocationMarkerComponent);