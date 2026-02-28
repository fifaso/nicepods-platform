// components/geo/map-marker-custom.tsx
// VERSIÓN: 1.2

"use client";

import React, { memo } from "react";
import { Marker, MapboxEvent } from "react-map-gl"; // [SINCRO]: Importación de tipo de evento
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
 * Contrato visual y posicional con validación de tipos estricta.
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
 * [RE-INGENIERÍA V1.2]: 
 * - Se implementa tipado explícito para el evento de Mapbox.
 * - Se normalizan las curvas de easing para silenciar advertencias de Vercel.
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
   * [FIX TS7006]: Se define el tipo MapboxEvent<MouseEvent> para el parámetro.
   * Esto garantiza que originalEvent sea accesible y tipado.
   */
  const handleMarkerClick = (e: MapboxEvent<MouseEvent>) => {
    // Detenemos la propagación para que el mapa no registre un clic en el fondo.
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
              // [FIX]: Uso de curva de easing normalizada para Vercel
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "absolute -inset-6 rounded-full blur-2xl z-0 transition-colors duration-1000",
                isSelected ? "bg-primary/40" : "bg-purple-500/20"
              )}
            />
          )}
        </AnimatePresence>

        {/* II. ANILLO DE PULSO TÉCNICO */}
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
 * 1. Resolución de Fuga de Tipos: El uso de 'MapboxEvent<MouseEvent>' elimina 
 *    el 'implicit any' del handler de clics, cumpliendo con el rigor del compilador.
 * 2. Limpieza de Logs: Al mantener las clases Tailwind dentro de un estándar 
 *    predecible, Vercel ya no emitirá advertencias de ambigüedad.
 * 3. Atomicidad: Este componente es ahora una pieza de hardware visual 
 *    autónoma, lista para ser instanciada masivamente en el mapa sin degradar 
 *    la performance del hilo principal.
 */