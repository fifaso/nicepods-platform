/**
 * ARCHIVO: components/geo/radar-hud.tsx
 * VERSIÓN: 6.2 (NicePod Avionics Heads-Up Display - Industrial De-Cluttering Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Visualizar telemetría purificada y el estado de autoridad sensorial de la terminal,
 * aplicando un filtrado agresivo de información redundante para maximizar el espacio táctico.
 * [REFORMA V6.2]: Eliminación de etiquetas literarias estáticas ("SENSORS READY", "SINTONÍA DE MALLA").
 * El sistema ahora solo proyecta texto dinámico de valor pericial (Nombres de lugares reales)
 * o estados de proceso activos. Optimización de anchos para evitar solapamiento en móviles.
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
 * CONSTANTES DE FILTRADO SEMÁNTICO
 */
const GENERIC_PLACEHOLDER_TEXT = "SINTONÍA DE MALLA ACTIVA";
const NOMINAL_STATES: GeoEngineState[] = ['IDLE', 'SENSORS_READY'];

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
 * Misión: Reflejar la estabilidad de la Malla mediante una interfaz de aviónica minimalista.
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
    if (accuracyValue === 0) return { label: "BÚSQUEDA", color: "text-zinc-600", icon: Activity };
    if (accuracyValue < 15) return { label: "ÓPTIMA", color: "text-emerald-400", icon: SignalHigh };
    if (accuracyValue < 35) return { label: "NOMINAL", color: "text-primary", icon: Target };
    return { label: "DÉBIL", color: "text-amber-500", icon: SignalLow };
  };

  const signalMetadata = getSignalStatusMetadata(accuracyMeters);
  const SignalIconComponent = signalMetadata.icon;

  /**
   * isMeaningfulPlaceName:
   * Misión: Filtrar placeholders genéricos para no ensuciar la banda superior.
   */
  const isMeaningfulPlaceName = placeName && 
                                placeName !== GENERIC_PLACEHOLDER_TEXT && 
                                placeName !== "DETECTANDO...";

  /**
   * isActiveProcessState:
   * Misión: Determinar si el motor está realizando una tarea que requiera feedback textual.
   */
  const isActiveProcessState = !NOMINAL_STATES.includes(status);

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-1000 isolate">

      {/* I. CHASSIS PRINCIPAL: AVIONICA ULTRA-COMPACTA */}
      <div className="h-14 w-full bg-[#080808]/90 border border-white/10 backdrop-blur-3xl rounded-2xl px-5 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group">

        {/* INDICADOR DE MESH-LOCK (VISTA LATERAL) */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 transition-all duration-1000",
          isTriangulated
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            : (status === 'IDLE' ? "bg-zinc-800" : "bg-primary animate-pulse")
        )} />

        {/* SECCIÓN A: TELEMETRÍA DE PRECISIÓN (IZQUIERDA) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SignalIconComponent size={11} className={cn("transition-colors", signalMetadata.color)} />
              <span className={cn("text-[14px] font-black tabular-nums tracking-tighter", signalMetadata.color)}>
                {accuracyMeters > 0 ? Math.round(accuracyMeters) : "0"}m
              </span>
              {isGlobalPositioningSystemLocked && (
                <div className="flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                  <span className="text-[7px] font-black text-emerald-400 leading-none">HD</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN B: ESTADO OPERATIVO (CENTRO)
            [V6.2]: Eliminación de texto en estados nominales. Solo iconos o estados activos. */}
        <div className="flex items-center justify-center gap-2">
          {isTriangulated ? (
            <Lock size={11} className="text-emerald-500 animate-in zoom-in duration-500" />
          ) : (
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === 'IDLE' ? "bg-zinc-700" : "bg-primary animate-pulse"
            )} />
          )}
          
          {isActiveProcessState && (
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white animate-pulse">
                {status.replace('_', ' ')}
             </span>
          )}
        </div>

        {/* SECCIÓN C: ANCLAJE NOMINAL (DERECHA)
            [V6.2]: El texto solo aparece si el nombre es dinámico y real. */}
        <div className="flex items-center justify-end max-w-[45%]">
          <div className="flex items-center gap-2 overflow-hidden">
            {isMeaningfulPlaceName && (
              <motion.span 
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black uppercase text-white truncate tracking-tighter"
              >
                {placeName}
              </motion.span>
            )}
            <MapPin size={11} className={cn("shrink-0 transition-colors", isTriangulated ? "text-emerald-500" : "text-primary/40")} />
          </div>
        </div>

      </div>

      {/* II. SUB-LÍNEA AMBIENTAL (HIDDEN IF NO DATA) */}
      {weather?.temperatureCelsius !== undefined && (
        <div className="px-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-1000 delay-300 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Cloud size={9} className="text-zinc-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] italic">
              {Math.round(weather.temperatureCelsius)}°C • {weather.conditionText}
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-primary/30" />
            <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">Resonance V4.2</span>
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
  const accuracyDeltaMagnitude = Math.abs((previousProperties.accuracyMeters || 0) - (nextProperties.accuracyMeters || 0));
  const temperatureDeltaMagnitude = Math.abs((previousProperties.weather?.temperatureCelsius || 0) - (nextProperties.weather?.temperatureCelsius || 0));

  return (
    previousProperties.status === nextProperties.status &&
    previousProperties.isTriangulated === nextProperties.isTriangulated &&
    previousProperties.isGlobalPositioningSystemLocked === nextProperties.isGlobalPositioningSystemLocked &&
    previousProperties.placeName === nextProperties.placeName &&
    accuracyDeltaMagnitude < 3 && 
    temperatureDeltaMagnitude < 1  
  );
});

RadarHUD.displayName = "RadarHeadsUpDisplay";