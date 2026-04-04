/**
 * ARCHIVO: components/geo/map-marker-custom.tsx
 * VERSIÓN: 5.0 (NicePod Floating Echo - Multidimensional Identity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Representar los Nodos de Inteligencia con identidad visual única basada 
 * en la taxonomía de dos capas, garantizando el reconocimiento cognitivo inmediato.
 * [REFORMA V5.0]: Implementación de estilos por Misión, mapeo total de Entidades 
 * y purificación total de nomenclatura (Sin abreviaciones).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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
  Zap, 
  Droplets, 
  Wind, 
  BatteryCharging, 
  ShieldCheck, 
  Building2, 
  ScrollText, 
  Gem, 
  Library, 
  Binary, 
  Paintbrush, 
  Telescope, 
  Waves, 
  Coffee,
  ShoppingBag,
  MapPin
} from "lucide-react";
import { memo, useMemo } from "react";
import { Marker } from "react-map-gl/mapbox";

// --- SOBERANÍA DE TIPOS ---
import { CategoryEntity, CategoryMission } from "@/types/geo-sovereignty";

interface MapMarkerCustomProps {
  identification: string;
  latitude: number;
  longitude: number;
  categoryMission: CategoryMission;
  categoryEntity: CategoryEntity;
  pointOfInterestName: string;
  isResonating: boolean;
  isSelected: boolean;
  onMarkerInteraction: (identification: string) => void;
}

/**
 * MapMarkerCustomComponent: La representación física de un Eco en la Malla.
 */
const MapMarkerCustomComponent = ({
  identification,
  latitude,
  longitude,
  categoryMission,
  categoryEntity,
  pointOfInterestName,
  isResonating,
  isSelected,
  onMarkerInteraction
}: MapMarkerCustomProps) => {

  /**
   * configuracionVisual: 
   * Misión: Definir colores y sombras según el cuadrante de misión.
   */
  const configuracionVisual = useMemo(() => {
    switch (categoryMission) {
      case 'infraestructura_vital':
        return { color: "text-amber-500", glow: "bg-amber-500/20", border: "border-amber-500/30" };
      case 'memoria_soberana':
        return { color: "text-emerald-500", glow: "bg-emerald-500/20", border: "border-emerald-500/30" };
      case 'capital_intelectual':
        return { color: "text-primary", glow: "bg-primary/20", border: "border-primary/30" };
      case 'resonancia_sensorial':
        return { color: "text-rose-500", glow: "bg-rose-500/20", border: "border-rose-500/30" };
      default:
        return { color: "text-zinc-500", glow: "bg-zinc-500/20", border: "border-zinc-500/30" };
    }
  }, [categoryMission]);

  /**
   * IconoEntidad:
   * Misión: Mapeo quirúrgico de la iconografía según la entidad física.
   */
  const IconoEntidad = useMemo(() => {
    const claseIcono = "w-5 h-5";
    const mapeo: Record<CategoryEntity, React.ReactNode> = {
      // Infraestructura Vital
      aseo_premium: <ShieldCheck className={claseIcono} />,
      nodo_hidratacion: <Droplets className={claseIcono} />,
      refugio_climatico: <Wind className={claseIcono} />,
      terminal_energia: <BatteryCharging className={claseIcono} />,
      zona_segura: <MapPin className={claseIcono} />,
      // Memoria Soberana
      monumento_nacional: <Landmark className={claseIcono} />,
      placa_sintonia: <ScrollText className={claseIcono} />,
      yacimiento_ruina: <History className={claseIcono} />,
      leyenda_urbana: <Zap className={claseIcono} />,
      arquitectura_epoca: <Building2 className={claseIcono} />,
      // Capital Intelectual
      museo_sabiduria: <Library className={claseIcono} />,
      atelier_galeria: <Palette className={claseIcono} />,
      libreria_autor: <Gem className={claseIcono} />,
      centro_innovacion: <Binary className={claseIcono} />,
      intervencion_plastica: <Paintbrush className={claseIcono} />,
      // Resonancia Sensorial
      mirador_estrategico: <Telescope className={claseIcono} />,
      paisaje_sonoro: <Waves className={claseIcono} />,
      pasaje_secreto: <Sparkles className={claseIcono} />,
      mercado_origen: <ShoppingBag className={claseIcono} />,
      obrador_tradicion: <Coffee className={claseIcono} />
    };

    return mapeo[categoryEntity] || <Sparkles className={claseIcono} />;
  }, [categoryEntity]);

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="bottom">
      <div
        className="relative flex flex-col items-center group cursor-pointer"
        onClick={(event) => { 
          event.stopPropagation(); 
          onMarkerInteraction(identification); 
        }}
      >
        {/* I. LA SOMBRA DE GRAVEDAD */}
        <div
          className={cn(
            "absolute bottom-0 w-8 h-2 bg-black/60 rounded-full blur-[4px] transform transition-transform duration-700",
            (isSelected || isResonating) && "animate-[shadowPulse_4s_ease-in-out_infinite]"
          )}
          style={{ willChange: 'transform, opacity' }}
        />

        {/* II. HALO DE ENERGÍA SOBERANO */}
        <AnimatePresence>
          {(isResonating || isSelected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={cn(
                "absolute -inset-10 rounded-full blur-3xl z-0",
                configuracionVisual.glow
              )}
            />
          )}
        </AnimatePresence>

        {/* III. NÚCLEO FÍSICO LEVITANTE (GPU Accelerated) */}
        <div
          className={cn(
            "relative z-20 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            "bg-[#020202] border-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)]",
            "animate-[float_4s_ease-in-out_infinite]",
            isSelected
              ? "border-primary scale-125 shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]"
              : cn("border-white/10 group-hover:border-white/30", configuracionVisual.border)
          )}
          style={{ willChange: 'transform' }}
        >
          <div className={cn(
            "transition-colors duration-500", 
            isSelected || isResonating ? "text-primary" : configuracionVisual.color
          )}>
            {IconoEntidad}
          </div>

          {/* ONDA EXPANSIVA DE RESONANCIA */}
          {isResonating && (
            <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
          )}
        </div>

        {/* IV. CHAPA DE IDENTIFICACIÓN NOMINATIVA */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-14 whitespace-nowrap z-30 pointer-events-none"
            >
              <div className="bg-black/95 backdrop-blur-3xl px-5 py-2.5 rounded-[1.2rem] border border-white/10 shadow-2xl">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic">
                  {pointOfInterestName}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
};

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 * Evitamos que React reconstruya los Nodos de Inteligencia ante movimientos del GPS,
 * a menos que cambie su estado de sintonía o su identidad básica.
 */
export const MapMarkerCustom = memo(MapMarkerCustomComponent, (previousProps, nextProps) => {
  return (
    previousProps.identification === nextProps.identification &&
    previousProps.isResonating === nextProps.isResonating &&
    previousProps.isSelected === nextProps.isSelected &&
    previousProps.categoryMission === nextProps.categoryMission &&
    previousProps.categoryEntity === nextProps.categoryEntity
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Cognitive Recognition: La asociación de colores a Misiones y de iconos a Entidades 
 *    permite al Voyager realizar un peritaje visual instantáneo del mapa, reduciendo 
 *    la carga cognitiva y elevando la percepción de "Herramienta de Grado Industrial".
 * 2. Visual Stasis: Al integrar 'categoryMission' y 'categoryEntity' en el comparador 
 *    del memo, aseguramos que el marcador solo se repinte si el Oráculo modifica su 
 *    clasificación tras un re-análisis.
 * 3. Atomic Identity: El uso de 'identification' en lugar de 'id' alinea este 
 *    componente con el estándar de nomenclatura del resto de la arquitectura V3.0.
 */