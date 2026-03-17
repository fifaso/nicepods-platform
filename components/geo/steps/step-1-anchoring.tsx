// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Anchoring - Hybrid Desktop/Mobile Edition)
// Misión: Definir posición física, taxonomía y radio con autoridad de Admin absoluta.
// [ESTABILIZACIÓN]: Erradicación de banner inferior, fix de avance 0.0M y soporte ubicuo.

"use client";

import {
  AlertCircle,
  ArrowRight,
  History,
  Landmark,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Palette,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE SOBERANÍA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { SpatialEngine } from "../SpatialEngine";

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/**
 * TAXONOMÍA INDUSTRIAL NICEPOD (V2.6)
 */
const CATEGORIES = [
  { id: 'historia', label: 'Historia', icon: History },
  { id: 'arquitectura', label: 'Arquitectura', icon: Landmark },
  { id: 'arte', label: 'Arte', icon: Palette },
  { id: 'naturaleza', label: 'Botánica', icon: Leaf },
  { id: 'secreto', label: 'Secreto', icon: Zap },
  { id: 'cultural', label: 'Resonancia', icon: Sparkles },
];

export function StepAnchoring() {
  const { state, dispatch, nextStep } = useForge();
  const geoEngine = useGeoEngine();

  const {
    userLocation,
    isSearching: isLocating,
    setManualAnchor,
    isLocked
  } = geoEngine;

  // Estado local para forzar visualización de mapa en hardware lento (PC)
  const [mapReady, setMapReady] = useState(false);

  /**
   * PROTOCOLO DE SINCRONÍA DE MEMORIA:
   * Mantenemos el estado de la forja alineado con el pulso del hardware.
   */
  useEffect(() => {
    if (userLocation) {
      setMapReady(true);
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          acc: userLocation.accuracy
        }
      });
    }
  }, [userLocation, dispatch]);

  /**
   * handleManualOverride:
   * Callback para el long-press en el SpatialEngine.
   */
  const handleManualOverride = useCallback((lngLat: [number, number]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    setManualAnchor(lngLat[0], lngLat[1]);
  }, [setManualAnchor]);

  /**
   * canProceed: Lógica de validación de salto al Step 2.
   * [SOBERANÍA]: Si hay ubicación (aunque sea estimada en PC), permitimos avanzar.
   */
  const canProceed = !!userLocation && !isLocating;

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-primary/20">

      {/* 
          I. ESCENARIO TÁCTICO (EL MAPA)
          Ocupa el espacio central. Sin distracciones.
      */}
      <div className="relative flex-1 min-h-[350px] w-full px-2">
        <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative bg-[#020202] group">

          {mapReady ? (
            <SpatialEngine
              mode="FORGE"
              onManualAnchor={handleManualOverride}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-md gap-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse text-center px-8">
                Sincronizando Malla Geográfica...
              </p>
            </div>
          )}

          {/* BADGE DE SEÑAL REACTIVO */}
          {userLocation && (
            <div className="absolute bottom-8 right-8 z-20">
              <Badge className={cn(
                "px-6 py-3 rounded-2xl backdrop-blur-3xl border-2 font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl",
                isLocked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : userLocation.accuracy < 25
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {isLocked ? <Target className="inline mr-2 h-3 w-3" /> : <Navigation className="inline mr-2 h-3 w-3" />}
                {isLocked ? "Anclaje Admin" : `Señal: ${userLocation.accuracy.toFixed(1)}m`}
              </Badge>
            </div>
          )}

          {/* AVISO DE PRECISIÓN (Solo si es > 30m y no está bloqueado) */}
          {userLocation && userLocation.accuracy > 30 && !isLocked && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-[85%] animate-in slide-in-from-top-4">
              <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                <AlertCircle className="text-amber-500 shrink-0" size={16} />
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-relaxed">
                  Baja precisión detectada. Puedes situar el nodo manualmente manteniendo presionado el mapa.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* II. CONSOLA DE CONFIGURACIÓN (Intención) */}
      <div className="px-8 space-y-10 pb-4">

        {/* SELECTOR DE CATEGORÍA SOBERANA */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-1 opacity-40">
            <MapPin size={12} className="text-primary" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
              Identidad del Nodo
            </h3>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar-hide pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = state.categoryId === cat.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    dispatch({ type: 'SET_CATEGORY', payload: cat.id });
                  }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border transition-all duration-500 whitespace-nowrap group",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-zinc-700")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE RADIO DE RESONANCIA */}
        <div className="space-y-6 bg-white/[0.01] border border-white/5 p-6 rounded-[2.5rem] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
              Radio de Sintonía
            </h3>
            <span className="text-sm font-black text-primary italic tabular-nums">
              {state.resonanceRadius}m
            </span>
          </div>

          <Slider
            value={[state.resonanceRadius]}
            min={15}
            max={100}
            step={5}
            onValueChange={(val) => dispatch({ type: 'SET_RADIUS', payload: val[0] })}
            className="py-2"
          />
        </div>

        {/* III. ACCIÓN DE PROGRESO (HACIA FASE 2) */}
        <div className="w-full">
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative z-10 flex items-center justify-center gap-4 text-xl">
              CONFIRMAR ANCLAJE
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
            </span>
          </Button>
        </div>

      </div>

      {/* 
          NOTA DE ELIMINACIÓN: 
          El banner inferior ha sido purgado físicamente del DOM 
          para maximizar el espacio de los botones de categoría.
      */}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Solución de Avance Ubicuo: Al eliminar el bloqueo estricto por precisión 
 *    en el botón (Línea 148), el Administrador puede avanzar desde un PC 
 *    con 55m de error. Su validación visual sobre el mapa satelital es 
 *    suficiente para NicePod.
 * 2. Higiene Visual: Se ha aumentado el radio de los botones y eliminado 
 *    el footer animado, reduciendo el ruido de CPU y mejorando la tasa 
 *    de éxito de pulsación en pantallas pequeñas.
 * 3. Atomicidad: El botón de avance ahora es de escala masiva (h-20) 
 *    y texto XL para enfatizar el paso crítico de la materialización del anclaje.
 */