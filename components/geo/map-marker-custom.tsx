// components/geo/map-marker-custom.tsx
// VERSIÓN: 1.3

"use client";

import React, { memo } from "react";
import { Marker } from "react-map-gl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Palette, 
  Leaf, 
  Music, 
  Camera, 
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * INTERFAZ: MapMarkerCustomProps
 * Define el contrato visual y posicional del nodo en el mapa.
 */
interface MapMarkerCustomProps {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  name: string;
  isResonating: boolean;
  isSelected: boolean;
  onClick: (id: string) => void;
}

/**
 * COMPONENTE: MapMarkerCustom
 * El átomo visual de la malla urbana de Madrid Resonance.
 */
const MapMarkerCustomComponent = ({
  id,
  latitude,
  longitude,
  category,
  name,
  isResonating,
  isSelected,
  onClick
}: MapMarkerCustomProps) => {

  /**
   * getCategoryIcon:
   * Taxonomía iconográfica de NicePod.
   */
  const getCategoryIcon = (cat: string) => {
    const iconClass = "w-4 h-4";
    switch (cat.toLowerCase()) {
      case 'historia': return <History className={iconClass} />;
      case 'arte': return <Palette className={iconClass} />;
      case 'naturaleza': return <Leaf className={iconClass} />;
      case 'musica': return <Music className={iconClass} />;
      case 'foto': return <Camera className={iconClass} />;
      case 'secreto': return <Zap className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  /**
   * handleMarkerClick:
   * [FIX DEFINITIVO]: Para evitar el error de Namespace de Mapbox, tipamos 
   * el evento de forma estructural garantizando acceso a 'originalEvent'.
   */
  const handleMarkerClick = (e: { originalEvent: { stopPropagation: () => void } }) => {
    // Detenemos la propagación para evitar que el mapa capture el clic.
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
        
        {/* I. EL AURA DE RESONANCIA (GLOW) */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              /**
               * [FIX CSS]: Se cambia la sintaxis de easing para evitar la ambigüedad 
               * detectada por Vercel. Usamos cubic-bezier explícito.
               */
              transition={{ 
                duration: 1, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className={cn(
                "absolute -inset-6 rounded-full blur-2xl z-0 transition-colors duration-1000",
                isSelected ? "bg-primary/40" : "bg-purple-500/20"
              )}
            />
          )}
        </AnimatePresence>

        {/* II. EL ANILLO DE PULSO TÉCNICO */}
        <div className="relative z-10">
          <motion.div
            animate={isResonating ? {
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5]
            } : {
              scale: [1, 1.2, 1],
              opacity: [0.2, 0, 0.2]
            }}
            transition={{
              duration: isResonating ? 1.2 : 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "absolute inset-0 rounded-full border-2",
              isResonating ? "border-primary" : "border-white/10"
            )}
          />

          {/* III. EL NÚCLEO SOBERANO */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative z-20 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
              "bg-[#020202] border-2 shadow-2xl",
              isSelected 
                ? "border-primary shadow-[0_0_25px_rgba(var(--primary),0.6)]" 
                : "border-white/5 group-hover:border-white/20",
              isResonating && !isSelected && "border-purple-500/50"
            )}
          >
            <div className={cn(
              "transition-colors duration-500",
              isSelected || isResonating ? "text-primary" : "text-zinc-600"
            )}>
              {getCategoryIcon(category)}
            </div>

            {isResonating && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-[#020202] animate-pulse shadow-lg" />
            )}
          </motion.div>
        </div>

        {/* IV. NARRATIVA FLOTANTE (LABEL) */}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Desacoplamiento de Tipos: Al usar un tipado estructural para el evento 
 *    onClick, eliminamos la dependencia del namespace de Mapbox que estaba 
 *    causando fallos de resolución en el build worker de Vercel.
 * 2. Higiene Atmosférica: La normalización de las curvas de easing asegura que 
 *    el motor de estilos de Tailwind procese las clases de forma determinista, 
 *    silenciando las alertas del compilador.
 * 3. Integridad en Producción: Este componente es el último eslabón para que 
 *    la Malla Geoespacial de NicePod V2.5 alcance la certificación de vuelo.
 */