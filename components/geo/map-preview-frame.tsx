// components/geo/map-preview-frame.tsx
// VERSIÓN: 11.0 (NicePod GO-Preview - Ultimate Architecture Edition)
// Misión: Ventana táctica fotorrealista con carga invisible y persistencia de sensores.
// [ESTABILIZACIÓN]: Integración del Smokescreen Protocol y el motor MapCore aislado.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Loader2, Maximize2, ShieldAlert, Zap } from "lucide-react";
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
 * Diseñado para ser liviano, inmersivo y 100% estable.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // Consumo de Telemetría Global (Elevado en RootLayout)
  const geoEngine = useGeoEngine();
  const {
    userLocation,
    status: engineStatus,
    initSensors
  } = geoEngine;

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el contenedor tenga dimensiones físicas antes de instanciar WebGL.
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
   * 2. IGNICIÓN PROACTIVA
   * Solicitamos acceso a los sensores en cuanto el widget es visible.
   */
  useEffect(() => {
    if (isContainerReady) {
      initSensors();
    }
  }, [isContainerReady, initSensors]);

  /**
   * 3. PROTOCOLO DE VUELO EN LAS SOMBRAS (Ghost Flight)
   * Cuando el motor está listo y tenemos al usuario, volamos hacia él 
   * mientras el mapa permanece con opacidad cero.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Nodo detectado. Iniciando vuelo de proximidad.");

    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: ZOOM_LEVELS.NEIGHBORHOOD,
      pitch: 75,
      bearing: -15,
      ...FLY_CONFIG,
      duration: 2000, // Vuelo más corto para el Dashboard
    });

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation]);

  /**
   * 4. EL REVELADO (The Fade-In)
   * Disparamos el levantamiento de la cortina cuando el vuelo se detiene físicamente.
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Sincronía completada. Revelando Malla.");
    }
  }, [isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#030303] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
      )}
    >
      <AnimatePresence mode="wait">
        {/* ESCENARIO A: GPS BLOQUEADO */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">GPS Interceptado</span>
            <p className="text-xs text-zinc-500 mt-2 max-w-[200px] leading-relaxed uppercase">Habilite el GPS para ver la red.</p>
          </motion.div>
        ) :

          /* ESCENARIO B: CORTINA DE CARGA (SMOKESCREEN) */
          !isCameraSettled ? (
            <motion.div
              key="smokescreen"
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-5 bg-zinc-950 z-[90]"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white italic">
                  {!userLocation ? "Sintonizando Órbita" : "Calibrando 3D"}
                </span>
                <Loader2 className="h-3 w-3 animate-spin text-primary/40" />
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* 
          V. EL MOTOR CARTOGRÁFICO AISLADO 
          Delegamos el renderizado al MapCore, garantizando inmutabilidad.
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
            onMoveEnd={handleMoveEnd}
            onMapClick={() => { }} // Interacción limitada en Dashboard
            onMarkerClick={() => { }} // Redirección vía los botones inferiores
          />
        </motion.div>
      )}

      {/* VI. INTERFAZ DE EXPANSIÓN SOBERANA */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col">
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
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Unificación de Motor: Al consumir 'MapCore', el widget del Dashboard hereda 
 *    automáticamente el blindaje contra el error de 'mapbox-dem removal'.
 * 2. Smokescreen Táctico: La UI de carga oculta la compilación de polígonos 3D, 
 *    permitiendo que el Voyager entre en un mundo ya renderizado y centrado.
 * 3. Eficiencia de Datos: El widget no permite clics en marcadores para evitar 
 *    que el usuario sobrecargue el Hilo Principal del Dashboard con tarjetas UI 
 *    complejas; se le invita a la vista '/map' para una inmersión completa.
 */