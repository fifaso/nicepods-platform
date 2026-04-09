/**
 * ARCHIVO: components/geo/radar-hud.tsx
 * VERSIÓN: 6.0 (NicePod Avionics Heads-Up Display - Absolute Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Visualizar telemetría purificada y el estado de autoridad sensorial de la terminal.
 * [REFORMA V6.0]: Sincronización total con la Constitución V8.6. Transmutación de 
 * propiedades meteorológicas (temperatureCelsius, conditionText) y telemetría 
 * (accuracyMeters). Erradicación absoluta de abreviaciones según la ley ZAP.
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
  /** weather: Datos ambientales del nodo actual sincronizados con IngestionDossier. */
  weather?: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
    windKilometersPerHour?: number;
  };
  /** placeName: Identidad nominativa procesada por el Oráculo o el anclaje manual. */
  placeName?: string;
  /** accuracyMeters: Margen de error en metros del sensor de hardware. */
  accuracyMeters?: number;
}

/**
 * COMPONENTE: RadarHeadsUpDisplay
 * Diseñado bajo el dogma "Witness, Not Diarist". Refleja la estabilidad de la Malla.
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
   * Mapeo industrial de la integridad del enlace satelital.
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
    <div className="w-full flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-4 duration-1000">

      {/* I. CHASSIS PRINCIPAL: TELEMETRÍA DE AVIONICA */}
      <div className="h-14 w-full bg-[#080808]/90 border border-white/10 backdrop-blur-3xl rounded-2xl px-6 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group">

        {/* INDICADOR DE MESH-LOCK (V4.0) */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-all duration-1000",
          isTriangulated
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* SECCIÓN A: INTEGRIDAD DE SEÑAL DE HARDWARE */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIconComponent size={12} className={cn("transition-colors", signalMetadata.color)} />
              <span className={cn("text-[14px] font-black tabular-nums tracking-tighter", signalMetadata.color)}>
                {accuracyMeters > 0 ? Math.round(accuracyMeters) : "0"}m
              </span>
              {isGlobalPositioningSystemLocked && (
                <div className="flex items-center gap-1 ml-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                  <Cpu size={8} className="text-emerald-400" />
                  <span className="text-[6px] font-black text-emerald-400 uppercase tracking-tighter">HD</span>
                </div>
              )}
            </div>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">Sincronía Satelital</span>
          </div>
        </div>

        {/* SECCIÓN B: ESTADO DETERMINISTA DEL MOTOR (FSM) */}
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

        {/* SECCIÓN C: ANCLAJE GEOGRÁFICO NOMINAL */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 max-w-[140px]">
            <MapPin size={10} className={cn("transition-colors", isTriangulated ? "text-emerald-500" : "text-primary/60")} />
            <span className="text-[10px] font-black uppercase text-white truncate tracking-tighter">
              {placeName || "DETECTANDO..."}
            </span>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-500">Spatial Anchor</span>
        </div>

      </div>

      {/* II. SUB-LÍNEA AMBIENTAL (ATMÓSFERA TÁCTICA) */}
      {weather?.temperatureCelsius !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-1000 delay-300">
          <div className="flex items-center gap-2 opacity-70">
            <Cloud size={10} className="text-zinc-400" />
            <span className="text-[8.5px] font-black text-white uppercase tracking-[0.2em] italic">
              {Math.round(weather.temperatureCelsius)}°C • {weather.conditionText || 'Atmósfera Estable'}
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">Neural Link v4.0</span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO (Damping Physics)
 */
export const RadarHUD = memo(RadarHeadsUpDisplayComponent, (previousProperties, nextProperties) => {
  // Throttling de interfaz: Solo re-renderizamos si hay cambios significativos en la telemetría.
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Sovereignty: Se ha sincronizado la interfaz de 'weather' con el 
 *    nuevo contrato de IngestionDossier, resolviendo el error de asignabilidad TS2322.
 * 2. Zero Abbreviations Policy (ZAP): Se han purificado todas las propiedades 
 *    (accuracyMeters, temperatureCelsius, conditionText, placeName) eliminando el 
 *    dialecto abreviado de versiones anteriores.
 * 3. Interaction Stability: Se mantiene la lógica de damping para asegurar que la 
 *    interfaz no tartamudee durante el desplazamiento físico del Voyager.
 */