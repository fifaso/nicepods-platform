// components/geo/map-marker-custom.tsx
// VERSIÓN: 1.1

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
 * Define el contrato visual y posicional del nodo en el mapa de NicePod.
 */
interface MapMarkerCustomProps {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  name: string;
  /**
   * isResonating: TRUE si el usuario está dentro del radio de sintonía física.
   */
  isResonating: boolean;
  /**
   * isSelected: TRUE si el marcador ha sido activado por el cursor o pulgar.
   */
  isSelected: boolean;
  onClick: (id: string) => void;
}

/**
 * COMPONENTE: MapMarkerCustom
 * El átomo visual de la malla urbana de Madrid Resonance.
 * 
 * [ARQUITECTURA V1.1]:
 * Se define como una constante nombrada y se le asigna un displayName 
 * para satisfacer los requerimientos de ESLint en el despliegue de Vercel.
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
   * Mapea la taxonomía de la Bóveda a la iconografía técnica de la Workstation.
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

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      onClick={(event) => {
        // Detenemos la propagación para evitar que el mapa capture el clic del marcador.
        event.originalEvent.stopPropagation();
        onClick(id);
      }}
    >
      <div className="relative flex flex-col items-center group cursor-pointer selection:bg-none">
        
        {/* I. EL AURA DE RESONANCIA (GLOW) */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
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

          {/* III. EL NÚCLEO (CORE) */}
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

            {/* Micro-luz de 'Conexión Situacional' */}
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

// [FIX]: Envolvemos el componente en memo para optimización geoespacial.
export const MapMarkerCustom = memo(MapMarkerCustomComponent);

// [FIX DEFINITIVO]: Asignamos el nombre de visualización para silenciar a ESLint.
MapMarkerCustom.displayName = "MapMarkerCustom";

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Build: La asignación explícita de 'displayName' garantiza que 
 *    el compilador de Vercel acepte el componente memoizado sin generar errores 
 *    de depuración.
 * 2. Rendimiento Térmico: Al usar '#020202' sólido en lugar de transparencias 
 *    complejas en el núcleo del marcador, reducimos el 'overdraw' de la GPU, 
 *    mejorando los FPS durante el paneo del mapa satelital.
 * 3. UX de Sintonía: El 'entrance_radius' se visualiza mediante la animación 
 *    del 'Anillo de Pulso', cuya frecuencia aumenta un 50% cuando el usuario 
 *    está en zona de resonancia, proporcionando un feedback háptico-visual.
 */