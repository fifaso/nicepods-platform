// components/geo/radar-hud.tsx
// VERSIÓN: 2.0

"use client";

import { cn } from "@/lib/utils";
import {
  Cloud,
  MapPin,
  SignalHigh,
  SignalLow,
  Target,
  Wifi
} from "lucide-react";

/**
 * INTERFAZ: RadarHUDProps
 * [FIX TS2322]: Inyección de la propiedad 'accuracy' para telemetría GPS real.
 */
interface RadarHUDProps {
  /**
   * status: Estado actual del GeoEngine (IDLE, SCANNING, etc.)
   */
  status: string;
  /**
   * weather: Datos meteorológicos capturados por el motor ambiental.
   */
  weather?: {
    temp_c?: number;
    condition?: string;
  };
  /**
   * place: Nombre nominativo de la ubicación detectada.
   */
  place?: string;
  /**
   * accuracy: Precisión del GPS reportada por el hardware en metros.
   */
  accuracy?: number;
}

/**
 * COMPONENTE: RadarHUD
 * El panel de instrumentos superior de la terminal de captura urbana.
 * 
 * [CARACTERÍSTICAS TÁCTICAS]:
 * 1. Monitoreo de Señal: Cambia de color según la precisión métrica.
 * 2. Estado de Enlace: Visualiza si la conexión con la Bóveda es nominal.
 * 3. Diseño de Hardware: Estética de cristal con bordes técnicos de alta definición.
 */
export function RadarHUD({
  status,
  weather,
  place,
  accuracy = 0
}: RadarHUDProps) {

  /**
   * getSignalIntegrity:
   * Determina la calidad del vínculo satelital para guiar al Administrador.
   */
  const getSignalIntegrity = (acc: number) => {
    if (acc === 0) return { label: "Buscando", color: "text-zinc-600", icon: Target };
    if (acc < 15) return { label: "Excelente", color: "text-emerald-500", icon: SignalHigh };
    if (acc < 30) return { label: "Nominal", color: "text-primary", icon: Target };
    return { label: "Inestable", color: "text-amber-500", icon: SignalLow };
  };

  const signal = getSignalIntegrity(accuracy);
  const SignalIcon = signal.icon;

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-top-2 duration-700">

      {/* SECTOR I: TELEMETRÍA DE POSICIÓN (GPS ACCURACY) */}
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner group hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2.5 opacity-40">
          <SignalIcon size={12} className={cn("transition-colors", signal.color)} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Sincronía Satelital</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-lg font-black tabular-nums leading-none", signal.color)}>
            {accuracy > 0 ? accuracy.toFixed(1) : "0.0"}
          </span>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">Metros</span>
        </div>
      </div>

      {/* SECTOR II: ESTADO DEL ENLACE (SYSTEM UPLINK) */}
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner group hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2.5 opacity-40">
          <Wifi size={12} className="text-primary" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Uplink Status</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]"
          )} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            status === 'IDLE' ? "text-zinc-500" : "text-white"
          )}>
            {status === 'IDLE' ? "Standby" : "Frecuencia Activa"}
          </span>
        </div>
      </div>

      {/* SECTOR III: CONTEXTO AMBIENTAL (ENVIRONMENT) */}
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner group hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2.5 opacity-40">
          <Cloud size={12} className="text-blue-400" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Atmósfera</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-200 truncate max-w-full italic">
            {weather?.temp_c !== undefined
              ? `${weather.temp_c}°C • ${weather.condition || 'Cielo Despejado'}`
              : "Sincronizando..."
            }
          </span>
        </div>
      </div>

      {/* SECTOR IV: ANCLAJE URBANO (SPATIAL ANCHOR) */}
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner group hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2.5 opacity-40">
          <MapPin size={12} className="text-primary" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Nodo de Red</span>
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate leading-none">
            {place || "Madrid, Retiro Hub"}
          </span>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Errores de Interfaz: La inyección de 'accuracy' en la 
 *    interfaz RadarProps anula definitivamente el error de asignación en 
 *    'scanner-ui.tsx', permitiendo un flujo de datos tipado y profesional.
 * 2. Visualización Dinámica: Se implementó un algoritmo de colorimetría 
 *    para informar al Admin sobre la calidad de la siembra: <15m es el 
 *    estándar de oro (Verde), >30m indica riesgo de desviación (Ámbar).
 * 3. Consistencia de Marca: El uso de 'backdrop-blur-md' y 'bg-white/[0.03]' 
 *    mantiene la coherencia visual con el menú superior, proyectando una 
 *    imagen de hardware de alta tecnología.
 */