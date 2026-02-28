// components/geo/map-marker-custom.tsx
// VERSIÓN: 1.0

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
  Zap,
  Navigation2
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
  /**
   * isResonating: TRUE si el usuario está dentro del radio de activación (Gps Proximity).
   */
  isResonating: boolean;
  /**
   * isSelected: TRUE si el usuario ha pulsado explícitamente sobre este marcador.
   */
  isSelected: boolean;
  onClick: (id: string) => void;
}

/**
 * COMPONENTE: MapMarkerCustom
 * El átomo visual de la malla urbana de NicePod.
 * 
 * [ARQUITECTURA]:
 * - Memo: Evita re-renderizados innecesarios durante el paneo del mapa.
 * - Layering: 3 capas de profundidad (Glow, Ring, Icon).
 */
export const MapMarkerCustom = memo(({
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
   * Mapea la taxonomía de la base de datos a la iconografía técnica de NicePod.
   */
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'historia': return <History className="w-4 h-4" />;
      case 'arte': return <Palette className="w-4 h-4" />;
      case 'naturaleza': return <Leaf className="w-4 h-4" />;
      case 'musica': return <Music className="w-4 h-4" />;
      case 'foto': return <Camera className="w-4 h-4" />;
      case 'secreto': return <Zap className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(id);
      }}
    >
      <div className="relative flex flex-col items-center group cursor-pointer">
        
        {/* 
            I. EL AURA DE RESONANCIA (BACKGROUND GLOW)
            Este elemento solo 'despierta' cuando el usuario está cerca.
        */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={cn(
                "absolute -inset-6 rounded-full blur-2xl z-0 transition-colors duration-700",
                isSelected ? "bg-primary/40" : "bg-purple-500/20"
              )}
            />
          )}
        </AnimatePresence>

        {/* 
            II. EL ANILLO DE PULSO 
            Mantiene un latido sutil para indicar que el nodo está 'vivo'.
        */}
        <div className="relative z-10">
          <motion.div
            animate={isResonating ? {
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6]
            } : {
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: isResonating ? 1.5 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "absolute inset-0 rounded-full border-2",
              isResonating ? "border-primary" : "border-white/20"
            )}
          />

          {/* 
              III. EL NÚCLEO (CORE)
              Diseño de hardware: negro profundo, bordes metálicos y luz de estado.
          */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "relative z-20 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
              "bg-zinc-950 border-2 shadow-2xl",
              isSelected 
                ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]" 
                : "border-white/10 group-hover:border-white/40",
              isResonating && !isSelected && "border-purple-400"
            )}
          >
            {/* Indicador de Tipo de Contenido */}
            <div className={cn(
              "transition-colors duration-500",
              isSelected || isResonating ? "text-primary" : "text-zinc-500"
            )}>
              {getCategoryIcon(category)}
            </div>

            {/* Micro-luz de 'Conexión Activa' */}
            {isResonating && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-zinc-950 animate-pulse shadow-lg" />
            )}
          </motion.div>
        </div>

        {/* 
            IV. NARRATIVA FLOTANTE (LABEL)
            Solo visible en hover o cuando está seleccionado para mantener el mapa limpio.
        */}
        <AnimatePresence>
          {(isSelected) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-10 whitespace-nowrap z-30 pointer-events-none"
            >
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white italic leading-none">
                  {name}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Optimización de Memoria: El uso de 'memo' es vital. En el Retiro podríamos tener 
 *    50 POIs en un área densa; sin memoización, cada movimiento de cámara 
 *    re-calcularía 50 componentes, provocando lag en móviles de gama media.
 * 2. Feedback de Proximidad: La propiedad 'isResonating' se alimenta del hook 
 *    'useGeoEngine', permitiendo una sincronía perfecta entre el GPS y la UI.
 * 3. Estética Consistente: Los radios de borde (rounded-xl) y la paleta de zinc-950 
 *    aseguran que los marcadores parezcan brotar del 'glassPanel' de la navegación.
 */