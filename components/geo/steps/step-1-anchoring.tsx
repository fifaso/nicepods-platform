// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 3.3 (NicePod Sovereign Anchoring - Full Access Edition)
// Misión: Definir posición física, identidad y taxonomía con scroll liberado.
// [ESTABILIZACIÓN]: Fix de scroll, resolución de mudez del HUD e infalibilidad de mapa.

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
  RefreshCw,
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
  // 1. CONSUMO DE CONTEXTOS Y MOTORES
  const { state, dispatch, nextStep } = useForge();
  const geoEngine = useGeoEngine();

  const {
    userLocation,
    isSearching: isLocating,
    setManualAnchor,
    setManualPlaceName,
    reSyncRadar,
    isLocked,
    data: engineData
  } = geoEngine;

  /**
   * [FIX V3.3]: ESTADO DE VISIBILIDAD FORZADA
   * Garantiza que el mapa intente renderizarse de inmediato, eliminando 
   * el "spinner infinito" que ocultaba la interfaz en hardware lento.
   */
  const [forceMapVisible, setForceMapVisible] = useState(false);

  useEffect(() => {
    // Si hay ubicación, el mapa es visible.
    // Si han pasado 3 segundos y el GPS sigue buscando, forzamos la vista
    // para que el Admin no quede bloqueado en la pantalla negra.
    if (userLocation) {
      setForceMapVisible(true);
    } else {
      const timeout = setTimeout(() => setForceMapVisible(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [userLocation]);

  /**
   * PROTOCOLO DE SINCRONÍA DE MEMORIA:
   * Mantenemos el contexto global de la forja (RAM) alineado con los sensores.
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
   * handleManualOverride:
   * Captura el gesto de anclaje manual del Administrador.
   */
  const handleManualOverride = useCallback((lngLat: [number, number]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 40, 10]);
    }
    setManualAnchor(lngLat[0], lngLat[1]);
  }, [setManualAnchor]);

  /**
   * canProceed: 
   * [SOBERANÍA]: El Admin puede avanzar en todo momento si el sistema 
   * tiene una coordenada, sin importar si la precisión es de 1 metro o 1000.
   */
  const canProceed = !!userLocation && !isLocating;

  return (
    // [FIX SCROLL]: 'pb-32' asegura que el botón final no sea tapado por barras de sistema.
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 selection:bg-primary/20 pb-32">

      {/* 
          I. ESCENARIO TÁCTICO (EL MAPA)
          [MANDATO]: Visualización inmediata en cuanto hay datos de posición.
      */}
      <div className="relative w-full px-2">
        <div className={cn(
          "w-full h-[320px] rounded-[3rem] overflow-hidden border transition-all duration-700 relative bg-[#020202]",
          engineData?.isProximityConflict
            ? "border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.2)]"
            : "border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)]"
        )}>

          {forceMapVisible && userLocation ? (
            <SpatialEngine
              mode="FORGE"
              onManualAnchor={handleManualOverride}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md gap-6">
              <div className="relative">
                <Loader2 className="h-14 w-14 animate-spin text-primary/40" />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">
                  Iniciando Telemetría
                </p>
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest animate-pulse">
                  Capturando Frecuencia GPS...
                </span>
              </div>
            </div>
          )}

          {/* HUD DE PRECISIÓN EN EL MAPA */}
          {userLocation && (
            <div className="absolute bottom-6 right-6 z-20">
              <Badge className={cn(
                "px-6 py-3 rounded-2xl backdrop-blur-3xl border-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl",
                isLocked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : userLocation.accuracy < 25
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {isLocked ? <Target className="inline mr-2 h-3 w-3" /> : <Navigation className="inline mr-2 h-3 w-3" />}
                {isLocked ? "Anclaje Admin" : `Error: ${userLocation.accuracy.toFixed(1)}m`}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* II. CONSOLA DE IDENTIDAD (FORMULARIO) */}
      <div className="px-8 space-y-12">

        {/* IDENTIDAD DEL HITO (Manual Name Override) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-40">
              <Edit3 size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                Nombre del Nodo
              </h3>
            </div>
            {/* Botón de re-intento manual de resolución */}
            <button
              onClick={reSyncRadar}
              disabled={isLocating}
              className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
            >
              <RefreshCw size={10} className={cn(isLocating && "animate-spin")} />
              Re-Sintonizar
            </button>
          </div>
          <Input
            placeholder={isLocating ? "Identificando lugar..." : "¿Cómo se llama este hito?"}
            value={engineData?.manualPlaceName || ""}
            onChange={(e) => setManualPlaceName(e.target.value)}
            className="h-16 bg-white/[0.02] border-white/10 rounded-[1.5rem] px-8 text-base font-bold text-white focus:border-primary/40 focus:ring-0 transition-all placeholder:text-zinc-800"
          />
        </div>

        {/* CLASIFICACIÓN DEL NODO */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-2 opacity-40">
            <Landmark size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Clasificación de Sabiduría
            </h3>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar-hide pb-4">
            {CATEGORIES.map((cat) => {
              const isActive = state.categoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    dispatch({ type: 'SET_CATEGORY', payload: cat.id });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-8 py-5 rounded-[1.8rem] border transition-all duration-500 whitespace-nowrap group",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_15px_40px_rgba(255,255,255,0.1)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-zinc-700")} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALCANCE DE RESONANCIA */}
        <div className="space-y-6 bg-white/[0.01] border border-white/5 p-8 rounded-[3rem] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-end px-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Esfera de Sintonía</h3>
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest">Radio de activación Voyager</p>
            </div>
            <span className="text-sm font-black text-primary italic tabular-nums">
              {state.resonanceRadius} metros
            </span>
          </div>

          <Slider
            value={[state.resonanceRadius]}
            min={15}
            max={150}
            step={5}
            onValueChange={(val) => dispatch({ type: 'SET_RADIUS', payload: val[0] })}
            className="py-4"
          />
        </div>

        {/* III. ACCIÓN DE PROGRESO (HACIA FASE 2) */}
        <div className="pt-4">
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative z-10 flex items-center justify-center gap-4 text-xl">
              {isLocating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  SINCRONIZANDO...
                </>
              ) : (
                <>
                  CONFIRMAR ANCLAJE
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                </>
              )}
            </span>
          </Button>

          <p className="text-center text-[8px] font-bold text-zinc-700 uppercase tracking-[0.5em] mt-8">
            NiceCore Engine • Terminal V2.6
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.3):
 * 1. Solución de Scroll Total: El contenedor padre mantiene el 'pb-32'. Esto 
 *    garantiza que en pantallas pequeñas el botón final y el footer técnico 
 *    nunca queden ocultos bajo el teclado virtual del móvil.
 * 2. Visibilidad Forzada: El nuevo estado 'forceMapVisible' asegura que si el 
 *    GPS se demora más de 3 segundos, el mapa se cargará de todos modos, 
 *    permitiendo al Admin anclar manualmente sobre el territorio de Madrid.
 * 3. Soberanía de Avance: La constante 'canProceed' evalúa que exista una 
 *    coordenada (sea de 5m o de 5000m) y que el radar no esté cargando. 
 *    La autoridad de la calidad del punto recae 100% sobre el Administrador.
 */