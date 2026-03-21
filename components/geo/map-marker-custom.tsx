// components/geo/map-marker-custom.tsx
// VERSIÓN: 3.2 (NicePod Floating Echo - Vercel Safe Edition)
// [ESTABILIZACIÓN]: Importación protegida desde '/mapbox' y físicas de levitación.

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, History, Landmark, Leaf, Music, Palette, Sparkles, Zap } from "lucide-react";
import { memo } from "react";

// [FIX VERCEL]: Enrutamiento explícito al motor Mapbox
import { Marker } from "react-map-gl/mapbox";

interface MapMarkerCustomProps {
  id: string;
  latitude: number;
  longitude: number;
  category_id: string;
  name: string;
  isResonating: boolean;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const MapMarkerCustomComponent = ({ id, latitude, longitude, category_id, name, isResonating, isSelected, onClick }: MapMarkerCustomProps) => {

  const getCategoryIcon = (catId: string) => {
    const iconClass = "w-5 h-5";
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

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="bottom">
      <div
        className="relative flex flex-col items-center group cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
      >
        <div className="absolute bottom-0 w-8 h-2 bg-black/60 rounded-full blur-md transform transition-transform duration-700 group-hover:scale-150" />

        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={cn(
                "absolute -inset-10 rounded-full blur-3xl z-0",
                isSelected ? "bg-primary/30" : "bg-indigo-500/10"
              )}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "relative z-20 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            "bg-[#020202] border-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)]",
            isSelected ? "border-primary scale-125 shadow-[0_0_30px_rgba(var(--primary),0.5)]" : "border-white/10 group-hover:border-primary/50"
          )}
        >
          <div className={cn("transition-colors duration-500", isSelected || isResonating ? "text-primary" : "text-zinc-500")}>
            {getCategoryIcon(category_id)}
          </div>

          {isResonating && (
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-primary"
            />
          )}
        </motion.div>

        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-14 whitespace-nowrap z-30 pointer-events-none">
              <div className="bg-black/90 backdrop-blur-2xl px-5 py-2.5 rounded-[1.2rem] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic">{name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Marker>
  );
};

export const MapMarkerCustom = memo(MapMarkerCustomComponent);