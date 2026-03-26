// components/geo/map-preview-frame.tsx
// VERSIÓN: 17.1 (NicePod GO-Preview - High-Fidelity & Theme-Synced Edition)
// Misión: Ventana táctica fotorrealista sincronizada con la soberanía de triangulación global.
// [ESTABILIZACIÓN]: Resolución de error ts(2741) inyectando 'theme' y paridad con MapCore V7.3.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// [FIX V2.7]: Sincronía con ADN de constantes para tema y física
import {
  ACTIVE_MAP_THEME,
  FLY_CONFIG,
  ZOOM_LEVELS
} from "./map-constants";

// --- MOTOR CARTOGRÁFICO AISLADO ---
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 * Misión: Mostrar la ubicación exacta del usuario de forma automática y fotorrealista.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V22.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isGPSLock,       // Flag de autoridad satelital (<50m)
    setTriangulated
  } = useGeoEngine();

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // [HOT-SWAP T0]: Nace sin cortina si la sesión ya fue triangulada previamente.
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const hasInitialJumpPerformed = useRef<boolean>(false);
  const hasRefinedToGPS = useRef<boolean>(false);
  const autoIgnitionAttempted = useRef<boolean>(false);

  /**
   * 2. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * 3. PROTOCOLO DE IGNICIÓN AUTOMÁTICA
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE' && !autoIgnitionAttempted.current) {
      nicepodLog("📡 [MapPreview] Auto-Ignición: Sincronizando malla.");
      initSensors();
      autoIgnitionAttempted.current = true;
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 4. RED DE SEGURIDAD (RESCUE TIMER)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Timeout de carga. Revelando mapa.");
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. PROTOCOLO DE MATERIALIZACIÓN BI-FÁSICA (IP -> GPS)
   * Misión: Ajustar la cámara automáticamente en dos etapas de precisión.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || !mapRef.current) return;

    const goView = {
      center: [userLocation.longitude, userLocation.latitude] as [number, number],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 80,
      bearing: -15,
    };

    // ETAPA 1: Salto Inicial (IP o GPS impreciso)
    if (!hasInitialJumpPerformed.current) {
      if (!isTriangulated) {
        nicepodLog("🎯 [MapPreview] Primer anclaje. Vuelo de aproximación.");
        mapRef.current.flyTo({
          ...goView,
          ...FLY_CONFIG,
          duration: 2500,
        });
        setTriangulated();
      } else {
        nicepodLog("🚀 [MapPreview] Hot-Swap detectado. Salto instantáneo.");
        mapRef.current.jumpTo(goView);
        setIsCameraSettled(true);
      }
      hasInitialJumpPerformed.current = true;
      return;
    }

    // ETAPA 2: Refinamiento GPS Lock (Corrección final de precisión)
    if (isGPSLock && !hasRefinedToGPS.current) {
      nicepodLog("🔒 [MapPreview] GPS Lock certificado. Refinando posición exacta.");
      mapRef.current.flyTo({
        ...goView,
        duration: 1500,
        essential: true
      });
      hasRefinedToGPS.current = true;
    }

  }, [isMapLoaded, userLocation, isTriangulated, isGPSLock, setTriangulated]);

  /**
   * 6. EL REVELADO SOBERANO (Data-Driven onIdle)
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla 3D estabilizada.");
    }
  }, [isMapLoaded, isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40"
      )}
    >
      <AnimatePresence mode="wait">

        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              Habilite permisos de ubicación para sincronizar la malla.
            </p>
          </motion.div>
        ) :

          /* ESCENARIO: SMOKESCREEN DE CARGA */
          !isCameraSettled ? (
            <motion.div
              key="smokescreen"
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#020202] z-[90] pointer-events-none"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col items-center gap-6 text-center px-12">
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
                    Sincronización Órbital
                  </span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {!userLocation ? "Capturando Telemetría de Red..." :
                      !isGPSLock ? "Fijando Coordenadas Satelitales..." : "Estabilizando Malla 3D"}
                  </p>
                </div>

                {engineStatus === 'IDLE' && (
                  <button
                    onClick={() => initSensors()}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] pointer-events-auto hover:bg-primary hover:text-black transition-all"
                  >
                    <Power size={12} className="inline mr-2" />
                    Sincronizar Ahora
                  </button>
                )}
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* 
          VII. EL MOTOR DE RENDERIZADO (CORE)
          [FIX V17.1]: Inyección del prop 'theme' para cumplir con el contrato MapCore V7.3.
      */}
      {isContainerReady && userLocation && (
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            startCoords={userLocation}
            theme={ACTIVE_MAP_THEME} // <--- Sincronía lumínica global
            selectedPOIId={null}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => { }}
            onMoveEnd={() => { }}
            onMapClick={() => { }}
            onMarkerClick={() => { }}
          />
        </div>
      )}

      {/* GRADIENTE PROTECTOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent z-10 pointer-events-none" />

      {/* UI PERIFÉRICA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 transition-all shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid Resonance
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5">
              Malla Satelital Activa
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110 shadow-2xl">
            <Maximize2 size={14} className="text-white" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V17.1):
 * 1. Solución ts(2741): Se inyectó la propiedad 'theme' en la instancia de MapCore,
 *    utilizando la constante global 'ACTIVE_MAP_THEME'. Esto garantiza que el 
 *    widget del Dashboard comparta la misma estética que el mapa principal.
 * 2. Refinamiento Automático: Se sincronizó la lógica de 'isGPSLock' para que el 
 *    widget pequeño también realice el ajuste final de precisión satelital.
 * 3. Montaje Seguro: Se mantiene el protocolo de nacimiento condicional (T0), 
 *    asegurando que el mapa sea fotorrealista desde el primer frame visible.
 */