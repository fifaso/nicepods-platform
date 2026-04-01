/**
 * ARCHIVO: components/geo/radar-hud.tsx
 * VERSIÓN: 5.0 (NicePod Avionics HUD - Triple-Core & Precision Tracking Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Visualizar telemetría purificada y estado de autoridad sensorial.
 * [REFORMA V5.0]: Integración con FSM de la Forja, indicador de GPS_LOCK y 
 * optimización de ciclos de repintado (Damping 3m).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
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
 * INTERFAZ: RadarHUDProps
 */
interface RadarHUDProps {
  /** status: Estado determinista del motor de la Workstation. */
  status: GeoEngineState;
  /** isTriangulated: Confirma que el anclaje inicial se ha completado. */
  isTriangulated?: boolean;
  /** isGPSLock: Autoridad máxima del hardware satelital detectada. */
  isGPSLock?: boolean;
  /** weather: Datos ambientales del nodo actual. */
  weather?: {
    temp_c?: number;
    condition?: string;
  };
  /** place: Identidad nominativa procesada por el Oráculo. */
  place?: string;
  /** accuracy: Margen de error en metros del sensor. */
  accuracy?: number;
}

/**
 * COMPONENTE: RadarHUD
 * Diseñado bajo el dogma "Witness, Not Diarist". Refleja la estabilidad de la Malla.
 */
function RadarHUDComponent({
  status,
  isTriangulated = false,
  isGPSLock = false,
  weather,
  place,
  accuracy = 0
}: RadarHUDProps) {

  /**
   * getSignalStatus:
   * Mapeo industrial de la integridad del enlace satelital.
   */
  const getSignalStatus = (acc: number) => {
    if (acc === 0) return { label: "BUSCANDO", color: "text-zinc-600", icon: Activity };
    if (acc < 15) return { label: "ÓPTIMA", color: "text-emerald-400", icon: SignalHigh };
    if (acc < 35) return { label: "NOMINAL", color: "text-primary", icon: Target };
    return { label: "DEGRADADA", color: "text-amber-500", icon: SignalLow };
  };

  const signal = getSignalStatus(accuracy);
  const SignalIcon = signal.icon;

  return (
    <div className="w-full flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-4 duration-1000">

      {/* I. CHASSIS PRINCIPAL: TELEMETRÍA DE AVIONICA */}
      <div className="h-14 w-full bg-[#080808]/90 border border-white/10 backdrop-blur-3xl rounded-2xl px-6 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group">

        {/* INDICADOR DE MESH-LOCK (V3.0) */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-all duration-1000",
          isTriangulated
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* SECCIÓN A: INTEGRIDAD DE SEÑAL */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIcon size={12} className={cn("transition-colors", signal.color)} />
              <span className={cn("text-[14px] font-black tabular-nums tracking-tighter", signal.color)}>
                {accuracy > 0 ? Math.round(accuracy) : "0"}m
              </span>
              {isGPSLock && (
                <div className="flex items-center gap-1 ml-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                  <Cpu size={8} className="text-emerald-400" />
                  <span className="text-[6px] font-black text-emerald-400 uppercase tracking-tighter">HD</span>
                </div>
              )}
            </div>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">Sincronía GPS</span>
          </div>
        </div>

        {/* SECCIÓN B: ESTADO DETERMINISTA (FSM) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {isTriangulated ? (
              <Lock size={10} className="text-emerald-500 animate-in zoom-in duration-500" />
            ) : (
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse"
              )} />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {status.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-500 italic">
            {isTriangulated ? "MESH PERSISTENCE ACTIVE" : "ACQUIRING SPATIAL NODE"}
          </span>
        </div>

        {/* SECCIÓN C: ANCLAJE GEOGRÁFICO */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 max-w-[140px]">
            <MapPin size={10} className={cn("transition-colors", isTriangulated ? "text-emerald-500" : "text-primary/60")} />
            <span className="text-[10px] font-black uppercase text-white truncate tracking-tighter">
              {place || "DETECTANDO..."}
            </span>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-500">Spatial Anchor</span>
        </div>

      </div>

      {/* II. SUB-LÍNEA AMBIENTAL (ATMÓSFERA TÁCTICA) */}
      {weather?.temp_c !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-1000 delay-300">
          <div className="flex items-center gap-2 opacity-70">
            <Cloud size={10} className="text-zinc-400" />
            <span className="text-[8.5px] font-black text-white uppercase tracking-[0.2em] italic">
              {Math.round(weather.temp_c)}°C • {weather.condition || 'Atmósfera Estable'}
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">Neural Link v3.0</span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO (Damping Logic)
 */
export const RadarHUD = memo(RadarHUDComponent, (prev, next) => {
  // Solo re-renderizamos si hay cambios significativos en la telemetría.
  const accuracyDelta = Math.abs((prev.accuracy || 0) - (next.accuracy || 0));
  const tempDelta = Math.abs((prev.weather?.temp_c || 0) - (next.weather?.temp_c || 0));

  return (
    prev.status === next.status &&
    prev.isTriangulated === next.isTriangulated &&
    prev.isGPSLock === next.isGPSLock &&
    prev.place === next.place &&
    accuracyDelta < 3 && // [DAMPING]: Ignora variaciones de precisión < 3m
    tempDelta < 1        // [DAMPING]: Ignora micro-cambios de temperatura
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Interaction Synergy: Al utilizar un damping de 3m en la precisión, el HUD 
 *    permanece visualmente estático mientras el Voyager camina, eliminando el 
 *    "pestañeo de números" que distraía del peritaje del mapa.
 * 2. GPS_LOCK Visualization: Se incorporó el badge 'HD' (High Definition) que 
 *    se activa solo cuando isGPSLock es true, informando al usuario de la 
 *    máxima fidelidad satelital.
 * 3. FSM Integration: Mapeo de estados 'SENSORS_READY' y 'INGESTING' alineados 
 *    con el nuevo GeoEngineFacade V43.0.
 */