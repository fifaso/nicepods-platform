// components/geo/radar-hud.tsx
// VERSIÓN: 3.0 (NicePod Avionics HUD - Minimalist Edition)
// Misión: Visualizar la integridad de los sensores y el enlace de red con mínima carga cognitiva.
// [ESTABILIZACIÓN]: Fusión de sectores y optimización de espacio para la terminal de siembra.

"use client";

import { cn } from "@/lib/utils";
import {
  Cloud,
  MapPin,
  SignalHigh,
  SignalLow,
  Target,
  Wifi,
  Activity
} from "lucide-react";

/**
 * INTERFAZ: RadarHUDProps
 */
interface RadarHUDProps {
  /** status: Estado del motor (IDLE, INGESTING, ANALYZING, etc.) */
  status: string;
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
 * El panel de instrumentos superior re-diseñado para la V2.6.
 */
export function RadarHUD({
  status,
  weather,
  place,
  accuracy = 0
}: RadarHUDProps) {

  /**
   * getSignalStatus:
   * Evalúa la calidad de la señal para la visualización de aviónica.
   */
  const getSignalStatus = (acc: number) => {
    if (acc === 0) return { label: "Buscando", color: "text-zinc-600", icon: Activity };
    if (acc < 15) return { label: "Excelente", color: "text-emerald-400", icon: SignalHigh };
    if (acc < 35) return { label: "Estable", color: "text-primary", icon: Target };
    return { label: "Degradada", color: "text-amber-500", icon: SignalLow };
  };

  const signal = getSignalStatus(accuracy);
  const SignalIcon = signal.icon;

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">
      
      {/* 
          I. BARRA DE TELEMETRÍA MAESTRA (GLASS CHASSIS) 
          Contenedor único con estética de hardware industrial.
      */}
      <div className="h-14 w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-2xl px-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
        
        {/* Glow de fondo para indicar actividad del sistema */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-colors duration-1000",
          status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse"
        )} />

        {/* LADO IZQUIERDO: INTEGRIDAD SATELITAL */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIcon size={12} className={cn("transition-colors", signal.color)} />
              <span className={cn("text-[11px] font-black tabular-nums tracking-tighter", signal.color)}>
                {accuracy > 0 ? accuracy.toFixed(1) : "0.0"}m
              </span>
            </div>
            <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-600">Sincronía GPS</span>
          </div>
        </div>

        {/* CENTRO: ESTADO DEL CEREBRO (SITUATIONAL AWARENESS) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse"
            )} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
              {status.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-600 italic">
            {status === 'IDLE' ? "Waiting Trigger" : "Neural Link Active"}
          </span>
        </div>

        {/* LADO DERECHO: CONTEXTO DEL NODO */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 max-w-[120px]">
            <MapPin size={10} className="text-primary/60" />
            <span className="text-[9px] font-black uppercase text-white truncate tracking-tighter">
              {place || "Madrid Resonance"}
            </span>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-600">Spatial Anchor</span>
        </div>

      </div>

      {/* 
          II. LÍNEA DE AMBIENTE (SUB-HUD) 
          Solo aparece si el clima ha sido resuelto para no añadir ruido innecesario.
      */}
      {weather?.temp_c !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-700 delay-500">
           <div className="flex items-center gap-2 opacity-40">
              <Cloud size={10} className="text-zinc-400" />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest italic">
                {weather.temp_c}°C • {weather.condition || 'Atmósfera estable'}
              </span>
           </div>
           <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Ergonomía de Misión: Al pasar de bloques verticales a una sola barra 
 *    horizontal (h-14), recuperamos espacio para los controles de anclaje manual.
 * 2. Visualización JIT (Just In Time): La información de clima se ha desplazado 
 *    fuera de la barra principal como una "sub-línea" informativa, reduciendo 
 *    el peso visual si la API de clima aún no ha respondido.
 * 3. Feedback Progresivo: El color de la señal (accuracy) cambia dinámicamente:
 *    - <15m: Esmeralda (Siembra certificada).
 *    - <35m: Púrpura/Primary (Siembra nominal).
 *    - >35m: Ámbar (Alerta de desviación).
 */