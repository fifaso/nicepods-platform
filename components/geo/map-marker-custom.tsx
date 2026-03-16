// components/geo/map-marker-custom.tsx
// VERSIÓN: 2.0 (NicePod Sovereign Marker - V2.6 Standard)
// Misión: El átomo visual de la malla urbana.
// [ESTABILIZACIÓN]: Migración a category_id y optimización de colisiones táctiles.

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  History,
  Landmark,
  Leaf,
  Music,
  Palette,
  Sparkles,
  Zap
} from "lucide-react";
import { memo } from "react";
import { Marker } from "react-map-gl";

/**
 * INTERFAZ: MapMarkerCustomProps
 */
interface MapMarkerCustomProps {
  id: string;
  latitude: number;
  longitude: number;
  category_id: string; // [FIX]: Cambio de 'category' a 'category_id'
  name: string;
  isResonating: boolean;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const MapMarkerCustomComponent = ({
  id,
  latitude,
  longitude,
  category_id,
  name,
  isResonating,
  isSelected,
  onClick
}: MapMarkerCustomProps) => {

  /**
   * getCategoryIcon:
   * Taxonomía iconográfica alineada con poi-schema.ts
   */
  const getCategoryIcon = (catId: string) => {
    const iconClass = "w-4 h-4";
    switch (catId.toLowerCase()) {
      case 'historia': return <History className={iconClass} />;
      case 'arquitectura': return <Landmark className={iconClass} />;
      case 'arte': return <Palette className={iconClass} />;
      case 'naturaleza': return <Leaf className={iconClass} />;
      case 'musica': return <Music className={iconClass} />;
      case 'foto': return <Camera className={iconClass} />;
      case 'secreto': return <Zap className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  const handleMarkerClick = (e: { originalEvent: { stopPropagation: () => void } }) => {
    e.originalEvent.stopPropagation();
    onClick(id);
  };

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      onClick={handleMarkerClick}
    >
      <div className="relative flex flex-col items-center group cursor-pointer selection:bg-none">

        {/* I. AURA DE RESONANCIA */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "absolute -inset-6 rounded-full blur-2xl z-0",
                isSelected ? "bg-primary/40" : "bg-indigo-500/20"
              )}
            />
          )}
        </AnimatePresence>

        {/* II. ANILLO DE PULSO TÁCTICO */}
        <div className="relative z-10">
          <motion.div
            animate={isResonating ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } : { scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: isResonating ? 1.2 : 2.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 rounded-full border-2",
              isResonating ? "border-primary" : "border-white/10"
            )}
          />

          {/* III. NÚCLEO DEL MARCADOR */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative z-20 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
              "bg-[#020202] border-2 shadow-2xl",
              isSelected
                ? "border-primary shadow-[0_0_25px_rgba(var(--primary),0.6)]"
                : "border-white/5 group-hover:border-white/20",
              isResonating && !isSelected && "border-indigo-500/50"
            )}
          >
            <div className={cn(
              "transition-colors duration-500",
              isSelected || isResonating ? "text-primary" : "text-zinc-600"
            )}>
              {getCategoryIcon(category_id)}
            </div>

            {isResonating && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-[#020202] animate-pulse shadow-lg" />
            )}
          </motion.div>
        </div>

        {/* IV. ETIQUETA NARRATIVA */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-12 whitespace-nowrap z-30 pointer-events-none"
            >
              <div className="bg-black/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white italic leading-none">
                  {name}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
};

export const MapMarkerCustom = memo(MapMarkerCustomComponent);
MapMarkerCustom.displayName = "MapMarkerCustom";