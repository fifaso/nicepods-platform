// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 2.6 (NicePod Sovereign Anchoring)
// Misión: Definir la posición física, taxonomía y radio del nuevo nodo urbano.
// [ESTABILIZACIÓN]: Erradicación de LiveLocationMap. Integración con SpatialEngine.

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
import { SpatialEngine } from "../SpatialEngine"; // EL NUEVO MOTOR UNIFICADO V2.6

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// --- CONTRATOS DE TAXONOMÍA V2.6 ---
// (Alineados con el Enum de categories en validation/poi-schema.ts)
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
    setManualAnchor // Invocamos la nueva facultad de Anclaje Manual
  } = geoEngine;

  /**
   * PROTOCOLO DE SINCRONÍA:
   * Mantenemos el estado de la forja (RAM) alineado con los sensores del motor.
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

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 selection:bg-primary/20">

      {/* 
          I. ESCENARIO TÁCTICO DE VISIÓN SATELITAL (SPATIAL ENGINE)
          Hemos reemplazado los mini-mapas dispersos por el motor maestro en Modo FORGE.
      */}
      <div className="relative flex-1 min-h-[300px] w-full px-4">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,1)] relative bg-[#050505] group">

          {userLocation ? (
            <SpatialEngine
              mode="FORGE"
              onManualAnchor={(lngLat) => {
                // Si el Admin hace long-press, bloqueamos el GPS y forzamos la coordenada.
                setManualAnchor(lngLat[0], lngLat[1]);
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                Sintonizando Constelación GPS...
              </p>
            </div>
          )}

          {/* HUD DE PRECISIÓN (El semáforo de integridad) */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
            <Badge className={cn(
              "px-5 py-2.5 rounded-xl backdrop-blur-2xl border font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl",
              (userLocation?.accuracy || 100) < 15
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : (userLocation?.accuracy || 100) < 30
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
            )}>
              Señal: {userLocation?.accuracy.toFixed(1) || "0.0"}m
            </Badge>
          </div>

          {/* Alerta visible para que el Admin sepa que puede corregir el GPS */}
          <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/80 border border-white/10 text-white/50 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md">
              Mantener presionado para Anclaje Manual
            </span>
          </div>

        </div>
      </div>

      {/* II. CONSOLA DE PARÁMETROS TÁCTICOS */}
      <div className="px-6 pb-12 space-y-12">

        {/* SELECTOR DE TAXONOMÍA (Category) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1 opacity-60">
            <Target size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
              Clasificación del Nodo
            </h3>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar-hide pb-3">
            {CATEGORIES.map((cat) => {
              const isActive = state.categoryId === cat.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.id })}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border transition-all duration-500 whitespace-nowrap group",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/20 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-zinc-700 group-hover:text-zinc-400"
                  )} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE RADIO DE RESONANCIA */}
        <div className="space-y-6 bg-white/[0.01] border border-white/5 p-8 rounded-[2.5rem] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <Navigation size={14} className="text-primary/60" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                Alcance de Sintonía
              </h3>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-xs px-3">
              {state.resonanceRadius}m
            </Badge>
          </div>

          <Slider
            value={[state.resonanceRadius]}
            min={10}
            max={100}
            step={5}
            onValueChange={(val) => dispatch({ type: 'SET_RADIUS', payload: val[0] })}
            className="py-4"
          />

          <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.5em] text-center px-4 leading-relaxed">
            Distancia física requerida para que un Voyager active este eco.
          </p>
        </div>

        {/* III. PUERTA HACIA LOS SENSORES */}
        <Button
          onClick={nextStep}
          disabled={!userLocation || isLocating}
          className="w-full h-20 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] group"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {isLocating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                CALIBRANDO...
              </>
            ) : (
              <>
                CONFIRMAR ANCLAJE
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.6):
 * 1. Muerte del LiveLocationMap: Al integrar 'SpatialEngine', el componente se 
 *    beneficia del caché de Mapbox y de la lógica centralizada. El Administrador 
 *    disfruta de un mapa satelital de alto rendimiento.
 * 2. Empowering the Admin: Se ha añadido el 'onManualAnchor' y una instrucción 
 *    visual clara. Si el GPS marca 60m de error, el Admin pincha la pantalla 
 *    y asume el control absoluto de la topología.
 */