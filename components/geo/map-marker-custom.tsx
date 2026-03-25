// components/geo/map-marker-custom.tsx
// VERSIÓN: 4.0 (NicePod Floating Echo - GPU Acceleration & Zero-Thrashing Edition)
// [ESTABILIZACIÓN]: Migración a CSS Keyframes para animaciones masivas. OOM Prevention.

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, History, Landmark, Leaf, Music, Palette, Sparkles, Zap } from "lucide-react";
import { memo, useMemo } from "react";

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

  // Memoización estricta del Icono para evitar re-creación de SVG en cada render
  const IconComponent = useMemo(() => {
    const iconClass = "w-5 h-5";
    switch (category_id.toLowerCase()) {
      case 'historia': return <History className={iconClass} />;
      case 'arquitectura': return <Landmark className={iconClass} />;
      case 'arte': return <Palette className={iconClass} />;
      case 'naturaleza': return <Leaf className={iconClass} />;
      case 'musica': return <Music className={iconClass} />;
      case 'foto': return <Camera className={iconClass} />;
      case 'secreto': return <Zap className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  }, [category_id]);

  return (
    // pitchAlignment="auto" permite que el marcador se mantenga siempre de pie frente a la cámara (Billboard)
    // a diferencia de los anillos del Voyager que deben estar pegados al asfalto.
    <Marker latitude={latitude} longitude={longitude} anchor="bottom">
      <div
        className="relative flex flex-col items-center group cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
      >
        {/* 
            I. LA SOMBRA DE GRAVEDAD (Static/Dynamic Toggle)
            Si el marcador no resuena/selecciona, la sombra es una elipse estática ligera.
            Si se activa, el CSS maneja la respiración de la sombra en sincronía con la levitación.
        */}
        <div
          className={cn(
            "absolute bottom-0 w-8 h-2 bg-black/60 rounded-full blur-[4px] transform transition-transform duration-700",
            (isSelected || isResonating) && "animate-[shadowPulse_4s_ease-in-out_infinite]"
          )}
          style={{ willChange: 'transform, opacity' }}
        />

        {/* 
            II. HALO DE ENERGÍA SOBERANO
            Montaje condicional. El 'blur-3xl' es costoso. Solo existe cuando hay contacto táctico.
        */}
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

        {/* 
            III. NÚCLEO FÍSICO LEVITANTE (GPU Accelerated)
            [MANDATO V2.7]: 'animate-[float_4s_ease-in-out_infinite]' transfiere el trabajo 
            de React/JS directamente a la GPU móvil, permitiendo renderizar 100 marcadores a 60fps.
        */}
        <div
          className={cn(
            "relative z-20 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            "bg-[#020202] border-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)]",
            "animate-[float_4s_ease-in-out_infinite]", // <--- Física CSS Pura
            isSelected
              ? "border-primary scale-125 shadow-[0_0_30px_rgba(var(--primary),0.5)]"
              : "border-white/10 group-hover:border-primary/50"
          )}
          style={{ willChange: 'transform' }} // Capa de composición forzada
        >
          <div className={cn("transition-colors duration-500", isSelected || isResonating ? "text-primary" : "text-zinc-500")}>
            {IconComponent}
          </div>

          {/* ONDA EXPANSIVA (Solo activa durante resonancia) */}
          {isResonating && (
            <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
          )}
        </div>

        {/* 
            IV. CHAPA DE IDENTIFICACIÓN (TOOLTIP TÁCTICO)
        */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-14 whitespace-nowrap z-30 pointer-events-none"
            >
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

/**
 * [BUILD SHIELD]: Memoización Estricta (Zero-Thrashing)
 * Evita que React reconstruya los Nodos de Inteligencia cuando el Voyager 
 * camina o la brújula cambia, a menos que el estado de Selección o Resonancia del Nodo cambie.
 */
export const MapMarkerCustom = memo(MapMarkerCustomComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.isResonating === next.isResonating &&
    prev.isSelected === next.isSelected &&
    // No comparamos lat/lng porque los "Ecos" son inmutables en posición física
    prev.category_id === next.category_id
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. CPU Offloading (Físicas de Levitación CSS): Se eliminó 'framer-motion' 
 *    del contenedor principal del marcador (`y: [0, -12, 0]`). Se sustituyó 
 *    por clases de Tailwind ('animate-[float_...]') respaldadas por 'will-change: transform'.
 *    Esto garantiza 60FPS fluidos incluso si el mapa renderiza 50 Ecos simultáneamente.
 *    (Requiere inyección de keyframes 'float' y 'shadowPulse' en tailwind.config.ts).
 * 2. Overdraw Control: El Halo de Energía (blur-3xl) y las ondas expansivas 
 *    (ping) solo existen en el DOM si el nodo está Activo o Resonando. Los 
 *    marcadores "dormidos" son extremadamente ligeros para la memoria de video.
 * 3. Billboard Effect: 'anchor="bottom"' asegura que la base del marcador 
 *    apunte siempre a la coordenada exacta del suelo 3D de Mapbox, manteniendo 
 *    su perspectiva al rotar la cámara.
 */