// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 2.8 (NicePod Sovereign Anchoring - Pro Edition)
// Misión: Definir la posición física, taxonomía y radio con interfaz ultra-limpia.
// [ESTABILIZACIÓN]: Fix 0.0M Accuracy, remoción de rastro técnico inferior y haptics.

"use client";

import {
  ArrowRight,
  History,
  Landmark,
  Leaf,
  Loader2,
  Navigation,
  Palette,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useEffect } from "react";

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
 * CONFIGURACIÓN DE TAXONOMÍA (NCIS V2.6)
 * Alineada estrictamente con el esquema de validación 'poi-schema.ts'.
 */
const CATEGORIES = [
  { id: 'historia', label: 'Historia', icon: History },
  { id: 'arquitectura', label: 'Arquitectura', icon: Landmark },
  { id: 'arte', label: 'Arte', icon: Palette },
  { id: 'naturaleza', label: 'Botánica', icon: Leaf },
  { id: 'secreto', label: 'Secreto', icon: Zap },
  { id: 'cultural', label: 'Resonancia', icon: Sparkles },
];

/**
 * COMPONENTE: StepAnchoring
 * Fase 1: La materialización de la coordenada en la Malla Urbana.
 */
export function StepAnchoring() {
  const { state, dispatch, nextStep } = useForge();
  const geoEngine = useGeoEngine();

  const {
    userLocation,
    isSearching: isLocating,
    setManualAnchor,
    status: engineStatus
  } = geoEngine;

  /**
   * PROTOCOLO DE SINCRONÍA DE MEMORIA:
   * Persiste la ubicación física en el ForgeContext para que la Fase 2 (Ingesta)
   * tenga el punto exacto de siembra bloqueado.
   */
  useEffect(() => {
    if (userLocation) {
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
   * handleManualPositioning:
   * Intercepta el long-press del mapa satelital.
   */
  const handleManualPositioning = (lngLat: [number, number]) => {
    setManualAnchor(lngLat[0], lngLat[1]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 selection:bg-primary/20">

      {/* 
          I. ESCENARIO TÁCTICO (MAPA SATELITAL V12)
          Ocupa el eje central de la terminal de mando.
      */}
      <div className="relative flex-1 min-h-[320px] w-full px-2">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative bg-[#020202] group">

          {userLocation ? (
            <SpatialEngine
              mode="FORGE"
              onManualAnchor={handleManualPositioning}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-md gap-6">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                  Interceptando Señal
                </p>
                <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                  Sintonizando Constelación GPS...
                </p>
              </div>
            </div>
          )}

          {/* INDICADOR DE INTEGRIDAD DE SEÑAL (Reactivación del 0.0M) */}
          {userLocation && (
            <div className="absolute bottom-6 right-6 z-20">
              <Badge className={cn(
                "px-5 py-2.5 rounded-xl backdrop-blur-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl",
                userLocation.accuracy < 15
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : userLocation.accuracy < 35
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
              )}>
                Señal: {userLocation.accuracy.toFixed(1)}m
              </Badge>
            </div>
          )}

          {/* TOOLTIP TÁCTICO DE AYUDA */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
                Mantén presionado para anclaje manual
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* II. CONSOLA DE PARÁMETROS (La Intención) */}
      <div className="px-6 space-y-10 pb-8">

        {/* SELECTOR DE TAXONOMÍA */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1 opacity-40">
            <Target size={12} className="text-primary" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
              Categoría del Eco
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
                    // Feedback táctico al seleccionar
                    if (navigator.vibrate) navigator.vibrate(10);
                    dispatch({ type: 'SET_CATEGORY', payload: cat.id });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 whitespace-nowrap",
                    isActive
                      ? "bg-white text-black border-white shadow-xl scale-105"
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-zinc-700"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE RADIO DE RESONANCIA */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 opacity-40">
              <Navigation size={12} className="text-zinc-400" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Radio de Sintonía
              </h3>
            </div>
            <span className="text-xs font-black text-primary italic tabular-nums">
              {state.resonanceRadius} metros
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

        {/* III. ACCIÓN DE PROGRESO */}
        <Button
          onClick={nextStep}
          disabled={!userLocation || isLocating}
          className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] group"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {isLocating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                Sincronizando...
              </>
            ) : (
              <>
                CONFIRMAR ANCLAJE
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </Button>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.8):
 * 1. Solución al Bug de Telemetría: Al usar el hook 'useGeoEngine' centralizado, 
 *    el componente ya no depende de estados locales lentos. El badge de metros 
 *    se actualiza en paridad con el hardware.
 * 2. Purga de Ruido: Se ha eliminado el bloque de texto inferior para limpiar la 
 *    línea de visión del Administrador, concentrando el éxito de la misión en el mapa.
 * 3. Haptic UI: El uso de vibraciones nativas (Línea 143) refuerza la sensación de 
 *    interacción con un dispositivo físico real durante la selección de categorías.
 */