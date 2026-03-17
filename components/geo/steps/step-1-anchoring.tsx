// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 3.1 (NicePod Sovereign Anchoring - Omniscient Edition)
// Misión: Materializar la coordenada y la identidad del nodo con autoridad total.
// [ESTABILIZACIÓN]: Integración de Proximity Guard, Manual Name Override y Fix 0.0M.

"use client";

import {
  ArrowRight,
  Edit3,
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
import { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE SOBERANÍA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { SpatialEngine } from "../SpatialEngine";

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    setManualPlaceName,
    isLocked,
    data: engineData,
    status: engineStatus
  } = geoEngine;

  // Estado local para forzar visualización de mapa en hardware lento
  const [mapReady, setMapReady] = useState(false);

  /**
   * PROTOCOLO DE SINCRONÍA DE MEMORIA:
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
   * Captura el long-press y emite feedback físico.
   */
  const handleManualOverride = useCallback((lngLat: [number, number]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 40, 10]);
    }
    setManualAnchor(lngLat[0], lngLat[1]);
  }, [setManualAnchor]);

  /**
   * canProceed: 
   * [SOBERANÍA]: El Admin siempre puede avanzar si hay una coordenada situada.
   */
  const canProceed = !!userLocation && !isLocating;

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-primary/20">

      {/* 
          I. ESCENARIO TÁCTICO (EL MAPA)
          Diseño sin distracciones con bordes de alerta si hay conflicto.
      */}
      <div className="relative flex-1 min-h-[300px] w-full px-2">
        <div className={cn(
          "w-full h-full rounded-[3rem] overflow-hidden border transition-all duration-500 relative bg-[#020202]",
          engineData?.isProximityConflict
            ? "border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            : "border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        )}>

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
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse">
                Sincronizando Malla Urbana...
              </p>
            </div>
          )}

          {/* BADGE DE SEÑAL REACTIVO */}
          {userLocation && (
            <div className="absolute bottom-6 right-6 z-20">
              <Badge className={cn(
                "px-5 py-2.5 rounded-xl backdrop-blur-3xl border-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl",
                isLocked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : userLocation.accuracy < 25
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {isLocked ? <Target className="inline mr-2 h-3 w-3" /> : <Navigation className="inline mr-2 h-3 w-3" />}
                {isLocked ? "Anclaje Admin" : `Precisión: ${userLocation.accuracy.toFixed(1)}m`}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* II. CONSOLA DE IDENTIDAD (DATOS REALES) */}
      <div className="px-8 space-y-8 pb-4">

        {/* IDENTIDAD DEL LUGAR (Manual Name Override) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 opacity-40">
            <Edit3 size={12} className="text-primary" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
              Identidad del Hito
            </h3>
          </div>
          <Input
            placeholder="¿Cómo se llama este lugar?"
            value={engineData?.manualPlaceName || ""}
            onChange={(e) => setManualPlaceName(e.target.value)}
            className="h-14 bg-white/[0.02] border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:border-primary/40 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* SELECTOR DE CATEGORÍA */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 opacity-40">
            <Landmark size={12} className="text-primary" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
              Clasificación del Nodo
            </h3>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar-hide pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = state.categoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.id })}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-500 whitespace-nowrap group",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/10"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-zinc-700")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RADIO DE RESONANCIA */}
        <div className="space-y-4 bg-white/[0.01] border border-white/5 p-5 rounded-[2rem] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
              Alcance de Sintonía
            </h3>
            <span className="text-xs font-black text-primary italic tabular-nums">
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
        <Button
          onClick={nextStep}
          disabled={!canProceed}
          className="w-full h-18 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          <span className="relative z-10 flex items-center justify-center gap-4 text-lg">
            {isLocating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                ANCLAR MEMORIA
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </span>
        </Button>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Manual Name Override: Resolvemos la mudez de la IA permitiendo que el 
 *    Administrador bautice el hito urbano directamente (Línea 109). Esto es 
 *    crucial para monumentos no cartografiados.
 * 2. Proximity Guard Visual: El cambio de borde a ámbar (Línea 84) informa al 
 *    Admin de que su posición colisiona con un nodo existente, evitando 
 *    la saturación de la malla urbana.
 * 3. Soporte Híbrido: La lógica de 'canProceed' ahora ignora la precisión baja 
 *    si se ha realizado un anclaje manual, permitiendo operar en PC sin demoras.
 */