// components/geo/map-preview-frame.tsx
// VERSIÓN: 14.0 (NicePod GO-Preview - Type Safe & Rapid Reveal Edition)
// Misión: Ventana táctica fotorrealista sincronizada con el nuevo motor V4.5.
// [ESTABILIZACIÓN]: Resolución de ts(2741) inyectando handleMapIdle y callbacks tipados.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, ZOOM_LEVELS } from "./map-constants";

// --- MOTOR CARTOGRÁFICO AISLADO ---
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 * Implementa una carga síncrona y protegida para dispositivos móviles.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // Consumo de Telemetría Global
  const {
    userLocation,
    status: engineStatus,
    initSensors
  } = useGeoEngine();

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);
  const ignitionAttempted = useRef<boolean>(false);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
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
   * 2. IGNICIÓN CONTROLADA (Anti-Loop GPS)
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE' && !ignitionAttempted.current) {
      nicepodLog("📡 [MapPreview] Solicitando enlace satelital inicial...");
      initSensors();
      ignitionAttempted.current = true;
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 3. RED DE SEGURIDAD (RESCUE TIMER)
   * Si el GPS o el motor tardan demasiado, forzamos el revelado en 5s.
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Estabilización forzada por Fail-Safe.");
          setIsCameraSettled(true);
        }
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 4. PROTOCOLO DE VUELO EN LAS SOMBRAS
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Voyager localizado. Iniciando aproximación.");

    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: ZOOM_LEVELS.NEIGHBORHOOD,
      pitch: 75,
      bearing: -15,
      ...FLY_CONFIG,
      duration: 2500,
    });

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation]);

  /**
   * 5. EL REVELADO SOBERANO (Data-Driven)
   * Se activa cuando MapCore confirma que la GPU terminó el renderizado (onIdle).
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla visual sintonizada por IDLE.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
    }
  }, [isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
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
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              El sistema requiere permisos de ubicación para proyectar la malla local.
            </p>
          </motion.div>
        ) :

          !isCameraSettled ? (
            <motion.div
              key="smokescreen"
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#020202] z-[90]"
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
                  <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {engineStatus === 'IDLE' ? "Esperando Autorización" :
                      !isMapLoaded ? "Cargando Motor 3D" : "Fijando Coordenadas"}
                  </p>
                </div>

                {engineStatus === 'IDLE' && (
                  <button
                    onClick={() => initSensors()}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] flex items-center gap-3 hover:bg-primary hover:text-black transition-all active:scale-95"
                  >
                    <Power size={12} />
                    Iniciar Enlace
                  </button>
                )}
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* 
          VI. EL MOTOR DE RENDERIZADO (CORE)
          Consumiendo el contrato V4.5 de MapCore con tipos blindados.
      */}
      {isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            selectedPOIId={null}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle} // <--- [FIX]: Propiedad requerida por MapCore V4.5
            onMove={() => { }} // Callback silente tipado
            onMoveEnd={handleMoveEnd}
            onMapClick={() => { }} // Callback silente tipado
            onMarkerClick={() => { }} // Callback silente tipado
          />
        </motion.div>
      )}

      {/* GRADIENTE PROTECTOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent z-10 pointer-events-none" />

      {/* UI PERIFÉRICA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5 group-hover/btn:text-primary transition-colors drop-shadow-md">
              Malla Satelital Activa
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-500 group-hover:scale-110">
            <Maximize2 size={14} className="text-white transition-colors" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V14.0):
 * 1. Sincronía de Contrato (Fix ts2741): Se ha implementado el prop 'onIdle' en la 
 *    instancia de <MapCore />. Esto satisface los requisitos de tipos de la V4.5 y 
 *    permite que el widget use el evento de renderizado final para quitar la cortina negra.
 * 2. Fail-Safe de 5s: Se redujo el temporizador de rescate de 7s a 5s para alinearse 
 *    con el orquestador principal, garantizando que el dashboard nunca se quede bloqueado.
 * 3. Inferencia de Callbacks: Se inyectaron los callbacks obligatorios (onMove, onMapClick, 
 *    onMarkerClick) para cumplir con la interfaz estricta de MapCoreProps, eliminando 
 *    las advertencias de parámetros faltantes en el Build de Vercel.
 */