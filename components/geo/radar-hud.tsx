/**
 * ARCHIVO: components/geo/radar-hud.tsx
 * VERSIÓN: 7.0 (NicePod Avionics HUD - Ultra-Compact & Precision Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Visualizar la telemetría de alta fidelidad y la identidad geográfica,
 * minimizando el ruido visual para priorizar la visibilidad del mapa.
 * [REFORMA V7.0]: Resolución definitiva de error 'motion is not defined' (JSX Undefined).
 * Eliminación de etiquetas descriptivas redundantes ("Sintonía de Malla"). 
 * Reducción de la interfaz a 2 campos dinámicos de alta autoridad.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { cn } from "@/lib/utils";
import { GeoEngineState } from "@/types/geo-sovereignty";
import { motion } from "framer-motion"; // [FIX]: Importación de motion restaurada
import {
  Activity,
  Cloud,
  Lock,
  MapPin,
  SignalHigh,
  SignalLow,
  Target
} from "lucide-react";
import { memo } from "react";

/**
 * INTERFAZ: RadarHeadsUpDisplayProperties
 */
interface RadarHeadsUpDisplayProperties {
  /** status: Estado operativo del motor de la terminal. */
  status: GeoEngineState;
  /** isTriangulated: Indica si el anclaje inicial es exitoso. */
  isTriangulated?: boolean;
  /** isGlobalPositioningSystemLocked: Autoridad satelital de alta precisión (HD). */
  isGlobalPositioningSystemLocked?: boolean;
  /** weather: Metadatos ambientales para el peritaje de campo. */
  weather?: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
  };
  /** placeName: Identidad nominativa procesada por el Oráculo. */
  placeName?: string;
  /** accuracyMeters: Magnitud de error en metros del sensor de hardware. */
  accuracyMeters?: number;
}

/**
 * RadarHeadsUpDisplay: El visor de telemetría purificado.
 */
function RadarHeadsUpDisplayComponent({
  status,
  isTriangulated = false,
  isGlobalPositioningSystemLocked = false,
  weather,
  placeName,
  accuracyMeters = 0
}: RadarHeadsUpDisplayProperties) {

  /**
   * getSignalStatusMetadata:
   * Misión: Clasificar la calidad del enlace basándose en el margen de error.
   */
  const getSignalStatusMetadata = (accuracyValue: number) => {
    if (accuracyValue === 0) return { label: "BUSCANDO", color: "text-zinc-600", icon: Activity };
    if (accuracyValue < 15) return { label: "ÓPTIMA", color: "text-emerald-400", icon: SignalHigh };
    if (accuracyValue < 35) return { label: "NOMINAL", color: "text-primary", icon: Target };
    return { label: "DEGRADADA", color: "text-amber-500", icon: SignalLow };
  };

  const signalMetadata = getSignalStatusMetadata(accuracyMeters);
  const SignalIconComponent = signalMetadata.icon;

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">

      {/* I. CHASSIS DE AVIONICA ULTRA-COMPACTA */}
      <div className="h-12 w-full bg-[#080808]/90 border border-white/10 backdrop-blur-3xl rounded-2xl px-5 flex items-center justify-between shadow-2xl relative overflow-hidden isolate">

        {/* INDICADOR DE BLOQUEO DE MALLA (LATERAL) */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-all duration-1000",
          isTriangulated ? "bg-emerald-500" : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* CAMPO 1: TELEMETRÍA DE SEÑAL (PRECISIÓN) */}
        <div className="flex items-center gap-3">
          <SignalIconComponent size={14} className={cn("transition-colors", signalMetadata.color)} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[14px] font-black tabular-nums tracking-tighter", signalMetadata.color)}>
                {accuracyMeters > 0 ? Math.round(accuracyMeters) : "0"}m
              </span>
              {isGlobalPositioningSystemLocked && (
                <div className="bg-emerald-500/10 px-1 py-0.5 rounded-sm border border-emerald-500/20">
                  <span className="text-[7px] font-black text-emerald-400">HD</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTOR DE ESTADO (COMPACTO) */}
        <div className="flex items-center gap-2">
          {isTriangulated ? (
            <Lock size={12} className="text-emerald-500" />
          ) : (
            <div className={cn("h-2 w-2 rounded-full", status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse")} />
          )}
        </div>

        {/* CAMPO 2: IDENTIDAD NOMINATIVA (PLACE) */}
        <div className="flex items-center gap-3 max-w-[150px]">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black uppercase text-white truncate tracking-tighter">
              {placeName || "DETECTION..."}
            </span>
          </div>
          <MapPin size={12} className={cn(isTriangulated ? "text-emerald-500" : "text-primary/60")} />
        </div>

      </div>

      {/* II. SUB-LÍNEA AMBIENTAL (OPCIONAL) */}
      {weather?.temperatureCelsius !== undefined && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="px-4 flex items-center gap-3"
        >
          <Cloud size={9} className="text-zinc-500" />
          <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] italic">
            {Math.round(weather.temperatureCelsius)}°C • {weather.conditionText}
          </span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </motion.div>
      )}

    </div>
  );
}

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 */
export const RadarHUD = memo(RadarHeadsUpDisplayComponent, (previousProperties, nextProperties) => {
  const accuracyDeltaMagnitude = Math.abs((previousProperties.accuracyMeters || 0) - (nextProperties.accuracyMeters || 0));
  
  return (
    previousProperties.status === nextProperties.status &&
    previousProperties.isTriangulated === nextProperties.isTriangulated &&
    previousProperties.isGlobalPositioningSystemLocked === nextProperties.isGlobalPositioningSystemLocked &&
    previousProperties.placeName === nextProperties.placeName &&
    accuracyDeltaMagnitude < 3
  );
});

RadarHUD.displayName = "RadarHeadsUpDisplay";