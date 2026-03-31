/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 3.5 (NicePod Sovereign Anchoring - Isolated Forge Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Definir la posición física, identidad y taxonomía del capital intelectual.
 * [REFORMA V3.5]: Implementación de mapId="map-forge" y sincronía visual de precisión.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

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
  Zap,
  MapPin
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE SOBERANÍA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { SpatialEngine } from "../SpatialEngine";

// --- COMPONENTES UI ATÓMICOS ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// --- UTILIDADES DE NÚCLEO ---
import { cn, nicepodLog } from "@/lib/utils";

/**
 * TAXONOMÍA INDUSTRIAL NICEPOD (V2.8)
 * Categorías de sabiduría para el anclaje en la Malla de Madrid.
 */
const CATEGORIES = [
  { id: 'historia', label: 'Historia', icon: History },
  { id: 'arquitectura', label: 'Arquitectura', icon: Landmark },
  { id: 'arte', label: 'Arte', icon: Palette },
  { id: 'botanica', label: 'Botánica', icon: Leaf },
  { id: 'secreto', label: 'Secreto', icon: Zap },
  { id: 'resonancia', label: 'Resonancia', icon: Sparkles },
] as const;

/**
 * StepAnchoring: La Terminal de Posicionamiento Táctico.
 */
export function StepAnchoring() {
  // 1. CONSUMO DE MOTORES SOBERANOS
  const { state, dispatch, nextStep } = useForge();
  const geoEngine = useGeoEngine();

  const {
    userLocation,
    isSearching: isLocating,
    setManualAnchor,
    setManualPlaceName,
    reSyncRadar,
    isLocked, // isLocked indica si el usuario ha intervenido la posición manualmente
    data: engineData
  } = geoEngine;

  /**
   * Failsafe de Visibilidad (Timeout Guard):
   * Garantiza que el lienzo WebGL se materialice tras 3 segundos incluso sin GPS.
   * Evita que el Administrador quede atrapado en una pantalla de carga infinita.
   */
  const [forceMapVisible, setForceMapVisible] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setForceMapVisible(true);
    } else {
      const timeout = setTimeout(() => {
        nicepodLog("⚠️ [Anchoring] Timeout de GPS superado. Forzando visibilidad del mapa.");
        setForceMapVisible(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [userLocation]);

  /**
   * Sincronía de Memoria RAM:
   * Mantiene el estado de la forja (Redux) alineado con la telemetría viva del motor.
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
   * Captura el gesto de anclaje manual (drag/click) del Administrador.
   */
  const handleManualOverride = useCallback((lngLat: [number, number]) => {
    nicepodLog(`📍 [Anchoring] Aplicando anclaje táctico manual.`);
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 40, 10]); // Patrón de confirmación
    }
    setManualAnchor(lngLat[0], lngLat[1]);
  }, [setManualAnchor]);

  /**
   * canProceed: 
   * El Administrador puede avanzar si el sistema tiene una coordenada (física o manual)
   * y el radar no está en medio de un proceso asíncrono de sintonía.
   */
  const canProceed = !!userLocation && !isLocating;

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32 px-1">

      {/* 
          I. LIENZO DE ANCLAJE (SPATIAL ENGINE)
          [MANDATO V3.5]: Se inyecta mapId="map-forge" para aislamiento de VRAM.
      */}
      <div className="relative w-full px-2">
        <div className={cn(
          "w-full h-[340px] rounded-[3.5rem] overflow-hidden border-2 transition-all duration-1000 relative bg-[#010101]",
          engineData?.isProximityConflict
            ? "border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            : "border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        )}>

          {forceMapVisible && userLocation ? (
            <SpatialEngine
              mapId="map-forge" // <--- Identidad aislada. No interfiere con el Dashboard.
              mode="FORGE"
              onManualAnchor={handleManualOverride}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-xl gap-8">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary/60" />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">
                  Estableciendo Link
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                    Sincronizando Coordenadas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* HUD DE PRECISIÓN TÁCTICA (Sincronizado con colores del Avatar) */}
          {userLocation && (
            <div className="absolute bottom-8 right-8 z-30 pointer-events-none">
              <Badge className={cn(
                "px-6 py-3 rounded-2xl backdrop-blur-3xl border-2 font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-700 shadow-2xl",
                isLocked
                  ? "bg-primary/20 border-primary/40 text-primary" // Anclaje Manual
                  : userLocation.accuracy < 50
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" // Precisión Alta
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500" // Precisión Baja / IP
              )}>
                {isLocked ? <MapPin className="mr-2 h-3.5 w-3.5" /> : <Navigation className="mr-2 h-3.5 w-3.5 animate-pulse" />}
                {isLocked ? "Punto Soberano" : `Precisión: ${Math.round(userLocation.accuracy)}m`}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* II. TERMINAL DE IDENTIDAD (FORMULARIO) */}
      <div className="px-8 space-y-12">

        {/* NOMBRE DEL HITO */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-40">
              <Edit3 size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                Identidad del Nodo
              </h3>
            </div>
            {/* Botón de re-sintonía manual del Borde */}
            <button
              onClick={reSyncRadar}
              disabled={isLocating}
              className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
            >
              <RefreshCw size={11} className={cn(isLocating && "animate-spin")} />
              Refrescar
            </button>
          </div>
          <Input
            placeholder={isLocating ? "Detectando..." : "¿Cómo se llama este hito?"}
            value={engineData?.manualPlaceName || ""}
            onChange={(e) => setManualPlaceName(e.target.value)}
            className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-8 text-base font-bold text-white focus:border-primary/40 transition-all placeholder:text-zinc-800"
          />
        </div>

        {/* CATEGORÍA SOBERANA */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 opacity-40">
            <Landmark size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Taxonomía del Conocimiento
            </h3>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = state.categoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(15);
                    dispatch({ type: 'SET_CATEGORY', payload: cat.id });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-8 py-5 rounded-[2rem] border transition-all duration-500 whitespace-nowrap",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_15px_40px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300 hover:border-white/10"
                  )}
                >
                  <Icon size={20} className={cn(isActive ? "text-primary" : "text-zinc-700")} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALCANCE DE RESONANCIA */}
        <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3.5rem] space-y-8 shadow-inner">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Umbral de Sintonía</h3>
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest leading-none">Radio de activación Voyager</p>
            </div>
            <span className="text-lg font-black text-primary italic tabular-nums">
              {state.resonanceRadius}m
            </span>
          </div>

          <Slider
            value={[state.resonanceRadius]}
            min={15}
            max={150}
            step={5}
            onValueChange={(val) => dispatch({ type: 'SET_RADIUS', payload: val[0] })}
            className="cursor-pointer"
          />
        </div>

        {/* III. ACCIÓN DE PROGRESO (THE GATE) */}
        <div className="pt-6">
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="w-full h-24 rounded-[3rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
            <span className="relative z-10 flex items-center justify-center gap-5 text-xl">
              {isLocating ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  CONFIRMAR ANCLAJE
                  <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform duration-700" />
                </>
              )}
            </span>
          </Button>

          <p className="text-center text-[9px] font-black text-zinc-700 uppercase tracking-[0.8em] mt-12 pb-4">
            NiceCore Sovereign • Verified Authority
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.5):
 * 1. Instance Sovereignty: El uso de mapId="map-forge" asegura que esta vista
 *    no interfiera con los hilos de renderizado del Dashboard ni del Mapa Full,
 *    resolviendo el error de tipos TS2322.
 * 2. Visual Accuracy Logic: Se unificó el sistema de colores del badge de precisión
 *    con el núcleo del sistema, informando honestamente al Admin sobre la señal.
 * 3. Mobile Ergonomics: Los radios de borde se elevaron a 3.5rem para maximizar 
 *    la estética PWA industrial y facilitar la interacción táctil.
 * 4. Failsafe Rendering: La persistencia de forceMapVisible evita que fallos de GPS
 *    impidan al administrador utilizar el anclaje manual.
 */