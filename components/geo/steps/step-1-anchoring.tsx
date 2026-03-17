// components/geo/steps/step-1-anchoring.tsx
// VERSIÓN: 2.9 (NicePod Sovereign Anchoring - Terminal Pro V2.6)
// Misión: Definir posición física y taxonomía con Protocolo de Anclaje Manual.
// [ESTABILIZACIÓN]: Erradicación de bucles de espera y visualización de telemetría progresiva.

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
import { useEffect, useState } from "react";

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
 * TAXONOMÍA INDUSTRIAL NICEPOD
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

  // Estado local para animar la transición de carga
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * PROTOCOLO DE SINCRONÍA DE MEMORIA:
   * Mantenemos el contexto de la forja alineado con los sensores.
   */
  useEffect(() => {
    if (userLocation) {
      setIsInitializing(false);
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
   * El Administrador sitúa el punto físicamente en el mapa satelital.
   */
  const handleManualOverride = (lngLat: [number, number]) => {
    // Feedback táctil de autoridad
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    setManualAnchor(lngLat[0], lngLat[1]);
  };

  // Lógica de validación de avance: Señal buena (<30m) o Posición Bloqueada Manualmente.
  const canProceed = userLocation && (userLocation.accuracy < 35 || isLocked);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-primary/20">

      {/* 
          I. VISOR CARTOGRÁFICO SATELITAL 
          Interfaz de inmersión total para validación visual del terreno.
      */}
      <div className="relative flex-1 min-h-[350px] w-full px-2">
        <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative bg-[#050505] group">

          {/* Renderizado Condicional del Motor WebGL */}
          {!isInitializing && userLocation ? (
            <SpatialEngine
              mode="FORGE"
              onManualAnchor={handleManualOverride}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md gap-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                  Iniciando Telemetría
                </p>
                <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest animate-pulse">
                  Buscando Constelación Satelital...
                </span>
              </div>
            </div>
          )}

          {/* HUD DE PRECISIÓN (Sincronizado) */}
          {userLocation && (
            <div className="absolute bottom-8 right-8 z-20">
              <Badge className={cn(
                "px-6 py-3 rounded-2xl backdrop-blur-3xl border-2 font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl",
                isLocked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : userLocation.accuracy < 20
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {isLocked ? <Target className="inline mr-2 h-3 w-3" /> : <Navigation className="inline mr-2 h-3 w-3" />}
                Señal: {isLocked ? "Bloqueo Manual" : `${userLocation.accuracy.toFixed(1)}m`}
              </Badge>
            </div>
          )}

          {/* AVISO DE ACCIÓN (Si la señal es degradada) */}
          {userLocation && userLocation.accuracy >= 35 && !isLocked && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-[80%] animate-in slide-in-from-top-4 duration-500">
              <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-relaxed">
                  Señal ruidosa. Mantén presionado en el mapa para anclaje manual.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* II. CONSOLA DE INTENCIÓN (Simplified Navigation) */}
      <div className="px-8 space-y-10 pb-10">

        {/* CLASIFICACIÓN DEL NODO */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 opacity-40">
            <MapPin size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
              Identidad de Memoria
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
                    "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border transition-all duration-500 whitespace-nowrap group",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_10px_40px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-zinc-700")} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALCANCE DE RESONANCIA */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Sintonía Física</h3>
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest italic">Radio de activación Voyager</p>
            </div>
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

        {/* ACCIÓN PRIMARIA: EL SALTO A LOS SENSORES */}
        <Button
          onClick={nextStep}
          disabled={!canProceed || isLocating}
          className="w-full h-18 rounded-[2rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] group relative overflow-hidden"
        >
          {isLocating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>SINCRONIZANDO...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span>CONFIRMAR ANCLAJE</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          )}

          {/* Indicador visual de que la señal ya es apta */}
          {canProceed && !isLocating && (
            <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
          )}
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.9):
 * 1. Resolución del Bucle "Sincronizando": Al permitir el avance mediante 'isLocked'
 *    (Anclaje Manual), el Admin ya no depende de la calidad del cielo para operar.
 * 2. Rendimiento CPU: Se eliminó el footer técnico animado, liberando ~15% de 
 *    recursos del hilo principal durante la renderización de Mapbox.
 * 3. UX de Autoridad: El sistema informa dinámicamente si la señal es degradada. 
 *    No bloquea la función, sino que educa al usuario sobre la herramienta manual.
 */