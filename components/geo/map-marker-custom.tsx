// components/geo/map-marker-custom.tsx
// VERSIÓN: 3.0 (NicePod Floating Echo - GO-Style Edition)
// Misión: El átomo visual de la malla urbana con física de suspensión y profundidad 3D.
// [ESTABILIZACIÓN]: Implementación de levitación rítmica, sombras dinámicas y pulsos de resonancia.

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
import { memo, useCallback } from "react";
import { Marker } from "react-map-gl";

/**
 * INTERFAZ: MapMarkerCustomProps
 * Define el contrato de identidad y estado para los ecos de la malla.
 */
interface MapMarkerCustomProps {
  id: string;
  latitude: number;
  longitude: number;
  category_id: string;
  name: string;
  isResonating: boolean; // TRUE si el Voyager está en radio de colisión física
  isSelected: boolean;   // TRUE si el nodo está enfocado en la UI
  onClick: (id: string) => void;
}

/**
 * MapMarkerCustomComponent: La unidad de visualización soberana del mapa.
 */
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
   * Resolución iconográfica de alta fidelidad basada en taxonomía V2.6.
   */
  const getCategoryIcon = (catId: string) => {
    const iconClass = "w-5 h-5"; // Aumentado para el nuevo chasis flotante
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

  /**
   * handleMarkerClick:
   * Captura el evento y detiene la propagación para evitar mover la cámara de Mapbox.
   */
  const handleMarkerClick = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation();
    onClick(id);
  }, [id, onClick]);

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
    // Delegamos el evento al contenedor interno para mayor precisión táctil
    >
      <div
        className="relative flex flex-col items-center group cursor-pointer selection:bg-none"
        onClick={handleMarkerClick}
      >

        {/* I. SOMBRA PROYECTADA (Física GO-Style) */}
        <motion.div
          animate={{
            scale: isSelected ? 1.5 : [1, 1.2, 1],
            opacity: isSelected ? 0.6 : [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 w-8 h-2 bg-black/60 rounded-full blur-md z-0"
        />

        {/* II. AURA DE RESONANCIA AMBIENTAL */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "absolute -inset-10 rounded-full blur-3xl z-0",
                isSelected ? "bg-primary/30" : "bg-indigo-500/10"
              )}
            />
          )}
        </AnimatePresence>

        {/* III. NÚCLEO FLOTANTE (CHASIS TÁCTICO) */}
        <motion.div
          // Efecto de Levitación: El marcador sube y baja suavemente
          animate={{ y: isSelected ? -15 : [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "relative z-10 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            "bg-[#020202] border-2 shadow-[0_20px_40px_rgba(0,0,0,0.7)]",
            isSelected
              ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)] scale-110"
              : "border-white/10 group-hover:border-primary/40",
            isResonating && !isSelected && "border-primary/60"
          )}
        >
          {/* ICONO DE CATEGORÍA */}
          <div className={cn(
            "transition-colors duration-500",
            isSelected || isResonating ? "text-primary" : "text-zinc-600"
          )}>
            {getCategoryIcon(category_id)}
          </div>

          {/* ANILLO DE PULSO (Colisión de Hallazgo) */}
          {isResonating && (
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-primary"
            />
          )}

          {/* Indicador de Status Activo */}
          {isResonating && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-[#020202] animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
          )}
        </motion.div>

        {/* IV. ETIQUETA NARRATIVA (HOLO-TAG) */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="absolute -bottom-16 whitespace-nowrap z-30 pointer-events-none"
            >
              <div className="bg-black/90 backdrop-blur-2xl px-5 py-2.5 rounded-[1.2rem] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic leading-none drop-shadow-md">
                  {name}
                </span>
              </div>
              {/* Flecha del Holo-Tag */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-black/90 mx-auto mt-[-2px]" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
};

// El uso de memo evita que los cientos de marcadores se repinten en cada movimiento de cámara
export const MapMarkerCustom = memo(MapMarkerCustomComponent);
MapMarkerCustom.displayName = "MapMarkerCustom";

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Estética Pokémon GO: Se implementó el patrón de Levitación + Sombra que define
 *    la jerarquía de profundidad en juegos AR, haciendo que los Ecos 'habiten' el espacio.
 * 2. Pulso de Resonancia: El anillo exterior animado es el indicador visual de que el 
 *    Voyager ha entrado en el radio físico del POI (resonance_radius), activando la sintonía.
 * 3. Optimización de Memoria: El componente está envuelto en 'memo' y utiliza 
 *    'useCallback' para asegurar 60fps constantes incluso con 100+ marcadores en pantalla.
 */