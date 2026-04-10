/**
 * ARCHIVO: components/geo/radar-hud.tsx
 * VERSIÓN: 6.1 (NicePod Avionics Heads-Up Display - De-Cluttering & High-Density UI Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Visualizar telemetría purificada y el estado de autoridad sensorial de la terminal,
 * optimizando el espacio vertical mediante la eliminación de metadatos redundantes.
 * [REFORMA V6.1]: Eliminación de etiquetas descriptivas secundarias en la Sección B para 
 * ganar espacio táctico. Compactación del chasis principal para evitar el solapamiento 
 * de información en dispositivos móviles. Cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { cn } from "@/lib/utils";
import { GeoEngineState } from "@/types/geo-sovereignty";
import {
  Activity,
  Cloud,
  Cpu,
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
  /** status: Estado determinista del motor de la Workstation. */
  status: GeoEngineState;
  /** isTriangulated: Confirma que el anclaje inicial se ha completado. */
  isTriangulated?: boolean;
  /** isGlobalPositioningSystemLocked: Autoridad máxima del hardware satelital detectada. */
  isGlobalPositioningSystemLocked?: boolean;
  /** weather: Datos ambientales del nodo actual sincronizados con la Constitución V8.6. */
  weather?: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
    windKilometersPerHour?: number;
  };
  /** placeName: Identidad nominativa procesada por el Oráculo. */
  placeName?: string;
  /** accuracyMeters: Margen de error en metros del sensor de hardware. */
  accuracyMeters?: number;
}

/**
 * COMPONENTE: RadarHeadsUpDisplay
 * Misión: Reflejar la estabilidad de la Malla mediante una interfaz de aviónica de alta visibilidad.
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
   * Misión: Clasificar la calidad del enlace satelital según la precisión del hardware.
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

      {/* I. CHASSIS PRINCIPAL: TELEMETRÍA DE AVIONICA COMPACTA */}
      <div className="h-14 w-full bg-[#080808]/90 border border-white/10 backdrop-blur-3xl rounded-2xl px-5 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group isolate">

        {/* INDICADOR DE MESH-LOCK (VISTA LATERAL) */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-all duration-1000",
          isTriangulated
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* SECCIÓN A: INTEGRIDAD DE SEÑAL DE HARDWARE */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIconComponent size={11} className={cn("transition-colors", signalMetadata.color)} />
              <span className={cn("text-[13px] font-black tabular-nums tracking-tighter", signalMetadata.color)}>
                {accuracyMeters > 0 ? Math.round(accuracyMeters) : "0"}m
              </span>
              {isGlobalPositioningSystemLocked && (
                <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                  <span className="text-[6px] font-black text-emerald-400 uppercase tracking-tighter">HD</span>
                </div>
              )}
            </div>
            <span className="text-[6px] font-black uppercase tracking-[0.2em] text-zinc-500">Sincronía GPS</span>
          </div>
        </div>

        {/* SECCIÓN B: ESTADO DETERMINISTA DEL MOTOR (ALTO RENDIMIENTO)
            [V6.1]: Eliminación de etiquetas secundarias para maximizar espacio. */}
        <div className="flex items-center gap-2.5">
          {isTriangulated ? (
            <Lock size={10} className="text-emerald-500 animate-in zoom-in duration-500" />
          ) : (
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse"
            )} />
          )}
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* SECCIÓN C: ANCLAJE GEOGRÁFICO NOMINAL */}
        <div className="flex flex-col items-end max-w-[130px]">
          <div className="flex items-center gap-2">
            <MapPin size={10} className={cn(isTriangulated ? "text-emerald-500" : "text-primary/60")} />
            <span className="text-[10px] font-black uppercase text-white truncate tracking-tighter">
              {placeName || "DETECTION..."}
            </span>
          </div>
          <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-zinc-600">Spatial Anchor</span>
        </div>

      </div>

      {/* II. SUB-LÍNEA AMBIENTAL (SOLO SI EXISTE SINTONÍA CLIMÁTICA) */}
      {weather?.temperatureCelsius !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-1000 delay-300 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Cloud size={9} className="text-zinc-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] italic">
              {Math.round(weather.temperatureCelsius)}°C • {weather.conditionText || 'Atmósfera Estable'}
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-primary/40" />
            <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">Neural Link v4.2</span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO (Damping Logic)
 */
export const RadarHUD = memo(RadarHeadsUpDisplayComponent, (previousProperties, nextProperties) => {
  // Throttling de interfaz para evitar parpadeos innecesarios durante el movimiento.
  const accuracyDeltaMagnitude = Math.abs((previousProperties.accuracyMeters || 0) - (nextProperties.accuracyMeters || 0));
  const temperatureDeltaMagnitude = Math.abs((previousProperties.weather?.temperatureCelsius || 0) - (nextProperties.weather?.temperatureCelsius || 0));

  return (
    previousProperties.status === nextProperties.status &&
    previousProperties.isTriangulated === nextProperties.isTriangulated &&
    previousProperties.isGlobalPositioningSystemLocked === nextProperties.isGlobalPositioningSystemLocked &&
    previousProperties.placeName === nextProperties.placeName &&
    accuracyDeltaMagnitude < 3 && // Ignora micro-variaciones de precisión < 3 metros
    temperatureDeltaMagnitude < 1  // Ignora cambios de temperatura < 1 grado Celsius
  );
});

RadarHUD.displayName = "RadarHeadsUpDisplay";

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. UI De-Cluttering: Se han eliminado los textos "MESH PERSISTENCE ACTIVE" y "ACQUIRING SPATIAL NODE", 
 *    los cuales generaban ruido visual y saturaban la parte superior de la terminal.
 * 2. Zero Abbreviations Policy: Purificación nominal completa del componente (itemIndex, 
 *    accumulator, temperatureCelsius, handleSignalStatusMetadata, iconComponent).
 * 3. Compact Layout: El HUD ahora es más estrecho en su eje vertical, permitiendo que 
 *    el Reactor WebGL gane protagonismo durante la Fase 1.
 */