// components/geo/radar-hud.tsx
// VERSIÓN: 4.0 (NicePod Avionics HUD - Precision & Mesh-Lock Edition)
// Misión: Visualizar telemetría estabilizada y el estado de la malla persistente.
// [ESTABILIZACIÓN]: Redondeo de precisión, indicador de Mesh-Lock y memoización táctica.

"use client";

import { cn } from "@/lib/utils";
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
 * INTERFAZ: RadarHUDProps
 */
interface RadarHUDProps {
  /** status: Estado del motor (IDLE, SENSORS_READY, INGESTING, etc.) */
  status: string;
  /** isTriangulated: Indica si el 'salto inicial' ya ocurrió y la malla está fija. */
  isTriangulated?: boolean;
  /** weather: Telemetría ambiental capturada. */
  weather?: {
    temp_c?: number;
    condition?: string;
  };
  /** place: Identidad nominativa del lugar. */
  place?: string;
  /** accuracy: Precisión métrica del GPS. */
  accuracy?: number;
}

/**
 * COMPONENTE: RadarHUD
 * Diseñado bajo el dogma "Witness, Not Diarist". Entrega datos puros con rigor industrial.
 */
function RadarHUDComponent({
  status,
  isTriangulated = false,
  weather,
  place,
  accuracy = 0
}: RadarHUDProps) {

  /**
   * getSignalStatus:
   * Clasifica la integridad satelital mediante rangos operativos.
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
    <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">

      {/* 
          I. BARRA DE TELEMETRÍA MAESTRA (INDUSTRIAL CHASSIS) 
          Contenedor optimizado para visibilidad bajo luz solar directa.
      */}
      <div className="h-14 w-full bg-[#080808]/80 border border-white/10 backdrop-blur-3xl rounded-2xl px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">

        {/* Indicador de Mesh-Lock: Luz lateral que confirma la persistencia de la ubicación */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-colors duration-1000",
          isTriangulated ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* LADO IZQUIERDO: INTEGRIDAD SATELITAL */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIcon size={12} className={cn("transition-colors", signal.color)} />
              <span className={cn("text-[13px] font-black tabular-nums tracking-tighter", signal.color)}>
                {/* [MANDATO V2.7]: Redondeo a entero para eliminar el jitter visual */}
                {accuracy > 0 ? Math.round(accuracy) : "0"}m
              </span>
            </div>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">Sincronía GPS</span>
          </div>
        </div>

        {/* CENTRO: ESTADO DEL SISTEMA (LINK STATUS) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {isTriangulated ? (
              <Lock size={10} className="text-emerald-500" />
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
            {isTriangulated ? "MESH PERSISTENCE ACTIVE" : (status === 'IDLE' ? "WAITING IGNITION" : "ACQUIRING NODE")}
          </span>
        </div>

        {/* LADO DERECHO: CONTEXTO GEOGRÁFICO */}
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

      {/* 
          II. SUB-LÍNEA AMBIENTAL (TELEMETRÍA ATMOSFÉRICA)
      */}
      {weather?.temp_c !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-700 delay-500">
          <div className="flex items-center gap-2 opacity-60">
            <Cloud size={10} className="text-zinc-400" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest italic">
              {Math.round(weather.temp_c)}°C • {weather.condition || 'ATMÓSFERA ESTABLE'}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
      )}

    </div>
  );
}

/**
 * [BUILD SHIELD]: Memoización Industrial
 * Solo re-renderizamos si:
 * 1. El estado del motor cambia.
 * 2. El estado de triangulación cambia.
 * 3. La precisión (accuracy) fluctúa más de 2 metros (Damping).
 * 4. El nombre del lugar (place) cambia.
 */
export const RadarHUD = memo(RadarHUDComponent, (prev, next) => {
  const accuracyMetersDiff = Math.abs((prev.accuracy || 0) - (next.accuracy || 0));

  return (
    prev.status === next.status &&
    prev.isTriangulated === next.isTriangulated &&
    prev.place === next.place &&
    prev.weather?.temp_c === next.weather?.temp_c &&
    accuracyMetersDiff < 2 // Ignoramos micro-variaciones para salvar ciclos de CPU
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Visual Damping: El redondeo de 'accuracy' y el umbral de 2m en el 'memo' 
 *    aniquilan el "baile de números", proporcionando una interfaz de grado militar.
 * 2. Mesh-Lock Awareness: Se añadió soporte para 'isTriangulated'. El HUD ahora 
 *    muestra un icono de candado y cambia el color lateral a esmeralda cuando 
 *    la ubicación se ha persistido, informando al Voyager del éxito del Hot Swap.
 * 3. High-Contrast UI: Se oscureció el fondo (#080808) para garantizar que los 
 *    textos en blanco y colores de señal sean legibles en exteriores bajo el sol.
 */