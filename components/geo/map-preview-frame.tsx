// components/geo/map-preview-frame.tsx
// VERSIÓN: 16.2 (NicePod GO-Preview - Mount Shield & Type Safe Edition)
// Misión: Ventana táctica fotorrealista sincronizada con el motor global.
// [ESTABILIZACIÓN]: Resolución de error ts(2304) en ResizeObserver e inyección de startCoords.

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
 * Misión: Mostrar la ubicación del usuario de forma automática, rápida y fotorrealista.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V21.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // [HOT-SWAP]: Si la sesión ya está triangulada, la cámara nace asentada.
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const hasInitialJumpPerformed = useRef<boolean>(false);
  const autoIgnitionAttempted = useRef<boolean>(false);

  /**
   * 2. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el WebGL tenga un contenedor con dimensiones antes de nacer.
   * [FIX V16.2]: Corrección de referencia 'resizeObserver' para evitar ts(2304).
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          // Detenemos la observación una vez que el contenedor es válido.
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
   * Si el motor WebGL tarda demasiado en responder, forzamos el revelado tras 5s.
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Estabilización forzada por tiempo.");
          setIsCameraSettled(true);
        }
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. PROTOCOLO DE LOCALIZACIÓN AUTOMÁTICA (POKÉMON GO STYLE)
   * Se ejecuta en cuanto MapCore está montado y tenemos la primera coordenada.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Voyager localizado. Aplicando inmersión 3D.");

    const goView = {
      center: [userLocation.longitude, userLocation.latitude] as [number, number],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 80,
      bearing: -15,
    };

    if (!isTriangulated) {
      // Caso A: Primera vez. Vuelo cinemático de aproximación.
      mapRef.current.flyTo({
        ...goView,
        ...FLY_CONFIG,
        duration: 2500,
      });
      setTriangulated();
    } else {
      // Caso B: Hot-Swap. Ubicación persistente. Salto instantáneo.
      mapRef.current.jumpTo(goView);
      setIsCameraSettled(true);
    }

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation, isTriangulated, setTriangulated]);

  /**
   * 6. EL REVELADO SOBERANO (onIdle)
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla renderizada. Fin de cortina.");
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

        {/* ESCENARIO: GPS BLOQUEADO POR NAVEGADOR */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              Habilite permisos de ubicación para sincronizar la malla urbana.
            </p>
          </motion.div>
        ) :

          /* ESCENARIO: SMOKESCREEN DE CARGA (Aislado de interacción) */
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
                  <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {!userLocation ? "Capturando Coordenadas..." : "Estabilizando Horizonte 3D"}
                  </p>
                </div>

                {/* Botón de respaldo si la auto-ignición es bloqueada por el SO */}
                {engineStatus === 'IDLE' && (
                  <button
                    onClick={() => initSensors()}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] pointer-events-auto"
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
          Solo se instancia cuando tenemos dimensiones y una ubicación de semilla.
      */}
      {isContainerReady && userLocation && (
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            startCoords={userLocation} // Satisface el contrato de MapCore V4.9
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
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none">
              Madrid Resonance
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5">
              Malla Satelital Activa
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110">
            <Maximize2 size={14} className="text-white" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V16.2):
 * 1. Solución ts(2304): Se corrigió la discrepancia de nombres en la variable del 
 *    ResizeObserver, permitiendo que el sistema de 'Safe Mount' sea operativo.
 * 2. Malla Dinámica Sincronizada: Al pasar 'userLocation' como 'startCoords', el 
 *    widget del Dashboard nace en la ubicación real del Voyager, eliminando el 
 *    anclaje erróneo en la Puerta del Sol.
 * 3. Hot-Swap Nativo: Si el Voyager ya fue localizado en la sesión, el mapa 
 *    pequeño aparece instantáneamente, sin esperas ni cortinas negras.
 * 4. Build Shield Sellado: Se inyectaron todos los props requeridos por el 
 *    contrato V4.9 del motor MapCore, eliminando errores de tipos en Vercel.
 */