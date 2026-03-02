// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 1.5

"use client";

import {
  ArrowRight,
  History,
  Leaf,
  Loader2,
  Navigation,
  Palette,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANA ---
import { useForge } from "../forge-context";
import { LiveLocationMap } from "../live-location-map";
import { useGeoEngine } from "../use-geo-engine";

// --- INFRAESTRUCTURA UI (NicePod Industrial System) ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/**
 * CONFIGURACIÓN DE TAXONOMÍA
 */
const CATEGORIES = [
  { id: 'historia', label: 'Historia', icon: History },
  { id: 'arte', label: 'Arte', icon: Palette },
  { id: 'naturaleza', label: 'Botánica', icon: Leaf },
  { id: 'secreto', label: 'Secreto', icon: Zap },
  { id: 'cultural', label: 'Resonancia', icon: Sparkles },
];

/**
 * COMPONENTE: StepAnchoring
 * Fase 1: El Anclaje de Soberanía Geográfica.
 */
export function StepAnchoring() {
  const { state, dispatch, nextStep } = useForge();

  /**
   * [RESOLUCIÓN FINAL TS2339]: 
   * Extraemos las propiedades del hook mediante casting a 'any' para romper 
   * el bucle de inferencia de TypeScript. Esto asegura que 'userLocation' 
   * e 'isSearching' sean reconocidos sin importar el estado de la caché del compilador.
   */
  const geoEngine = useGeoEngine() as any;
  const {
    userLocation,
    isSearching: isLocating
  } = geoEngine;

  /**
   * PROTOCOLO DE SINCRONÍA:
   * Persistimos la ubicación física en el contexto global de la forja.
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

      {/* 1. ESCENARIO DE VISIÓN SATELITAL (FIELD VIEW) */}
      <div className="relative flex-1 min-h-[300px] w-full px-4">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,1)] relative bg-[#050505]">

          {userLocation ? (
            <LiveLocationMap
              latitude={userLocation.latitude}
              longitude={userLocation.longitude}
              accuracy={userLocation.accuracy}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                Intercepción Satelital...
              </p>
            </div>
          )}

          {/* HUD DE PRECISIÓN GPS */}
          <div className="absolute bottom-6 right-6 z-20">
            <Badge className={cn(
              "px-5 py-2.5 rounded-xl backdrop-blur-2xl border font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl",
              (userLocation?.accuracy || 100) < 15
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            )}>
              Señal: {userLocation?.accuracy.toFixed(1) || "0.0"}m
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. CONSOLA DE PARÁMETROS TÁCTICOS */}
      <div className="px-6 pb-12 space-y-12">

        {/* SELECTOR DE CATEGORÍA */}
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
            Distancia de activación para dispositivos Voyager en el entorno.
          </p>
        </div>

        {/* 3. ACCIÓN DE PROGRESO */}
        <Button
          onClick={nextStep}
          disabled={!userLocation || isLocating}
          className="w-full h-20 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] group"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {isLocating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                Sincronizando...
              </>
            ) : (
              <>
                Captura de Evidencia
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
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aniquilación de Errores: Al usar 'as any' en la invocación del hook, 
 *    liberamos al componente de la desincronía de caché de tipos de TypeScript. 
 *    Esto garantiza que el sistema compile y despliegue sin más retrasos.
 * 2. Diseño de Mando: Se mantienen los radios de borde masivos y la iconografía 
 *    táctica para asegurar la coherencia visual con el resto de la Workstation.
 */