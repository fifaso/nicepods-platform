/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 4.0 (NicePod Forge Step 1 - Precision Anchoring & Contract Fix)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar el anclaje milimétrico del nodo urbano, permitiendo el 
 * ajuste manual de coordenadas antes de la ingesta sensorial.
 * [FIX V4.0]: Alineación de contrato nominal (mapInstanceId) para satisfacer 
 * al Build Shield y permitir el despliegue en Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { MapPin, Target, Check, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { SpatialEngine } from "../SpatialEngine";
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

/**
 * Step1Anchoring: La fase inicial del peritaje urbano.
 */
export default function Step1Anchoring() {
  // 1. CONSUMO DE LA FACHADA SOBERANA
  const { 
    userLocation, 
    recenterCamera, 
    isManualMode,
    status: engineStatus 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep } = useForge();

  // 2. ESTADOS DE CONTROL LOCAL
  const [forceMapVisible, setForceMapVisible] = useState<boolean>(false);

  /**
   * handleManualOverride:
   * Misión: Capturar el desplazamiento manual del marcador y actualizar 
   * el estado de la forja con rigor métrico.
   */
  const handleManualOverride = useCallback((longitudeLatitude: [number, number]) => {
    const [longitude, latitude] = longitudeLatitude;
    
    nicepodLog(`📍 [Forge:Step1] Ajuste de anclaje detectado: [${longitude}, ${latitude}]`);
    
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: latitude,
        lng: longitude,
        acc: 1 // Precisión de autoridad manual (máxima)
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [dispatch]);

  /**
   * PROTOCOLO DE SINCRONIZACIÓN INICIAL:
   * Si es la primera vez que entramos y tenemos GPS, sembramos la ubicación.
   */
  useEffect(() => {
    if (userLocation && forgeState.latitude === null) {
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          acc: userLocation.accuracy
        }
      });
    }
    
    // Pequeño retardo técnico para asegurar el repinte del contenedor antes de WebGL
    const timer = setTimeout(() => setForceMapVisible(true), 300);
    return () => clearTimeout(timer);
  }, [userLocation, forgeState.latitude, dispatch]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      
      {/* I. CABECERA TÁCTICA */}
      <div className="px-6 pt-2 pb-6 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 1: Anclaje Geográfico
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Sintonice la ubicación exacta del hito. Arrastre el mapa para un ajuste milimétrico.
        </p>
      </div>

      {/* II. VISOR DE PRECISIÓN (WEBGL) */}
      <div className="flex-1 relative mx-4 mb-6 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020202]">
        {forceMapVisible && (
          <SpatialEngine
            mapInstanceId="map-forge" // [FIX V4.0]: Nomenclatura alineada con V9.0
            mode="FORGE"
            performanceProfile="TACTICAL_LITE" // Máxima fluidez para el anclaje
            onManualAnchor={handleManualOverride}
            className="w-full h-full"
          />
        )}

        {/* CONTROLES FLOTANTES DEL VISOR */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <Button
            size="icon"
            variant={isManualMode ? "resonance" : "glass"}
            className="rounded-2xl shadow-2xl h-12 w-12"
            onClick={recenterCamera}
            title="Recuperar Voyager"
          >
            <Target size={20} className={cn(isManualMode && "animate-pulse")} />
          </Button>
        </div>

        {/* INDICADOR DE COORDENADAS VIVAS */}
        <div className="absolute top-6 left-6 right-6 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white tabular-nums tracking-tighter">
                  {forgeState.latitude?.toFixed(6)}°N, {forgeState.longitude?.toFixed(6)}°E
                </span>
                <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">
                  Puntero de Malla
                </span>
              </div>
            </div>
            {isManualMode && (
              <div className="flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                <span className="text-[7px] font-black text-primary uppercase tracking-widest">Manual</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* III. CHASSIS DE ACCIÓN INFERIOR */}
      <div className="px-6 pb-8 pt-2 mt-auto bg-gradient-to-t from-black to-transparent">
        <Button
          onClick={nextStep}
          disabled={forgeState.latitude === null || engineStatus === 'IDLE'}
          className="w-full h-16 rounded-[1.5rem] bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 font-black text-xs tracking-[0.3em] uppercase group"
        >
          <span className="flex items-center gap-3">
            Fijar Coordenadas
            <Check size={18} className="group-hover:scale-110 transition-transform" />
          </span>
        </Button>
        
        {engineStatus === 'IDLE' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-500/80">
            <AlertCircle size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Esperando Sintonía Satelital
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Compliance: Se corrigió el nombre de la propiedad 'mapInstanceId',
 *    garantizando que el compilador de Next.js reconozca la interfaz de SpatialEngine.
 * 2. Visual Performance: El uso de TACTICAL_LITE asegura que, durante el anclaje, 
 *    el dispositivo móvil no procese sombras ni oclusiones pesadas, otorgando 
 *    prioridad al refresco del marcador manual.
 * 3. Atomic Dispatch: La actualización de la ubicación en la forja ahora incluye 
 *    el 'acc: 1' para informar al Oráculo que el anclaje posee autoridad humana.
 */