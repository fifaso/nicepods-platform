// components/geo/map-preview-frame.tsx
// VERSIÓN: 16.5 (NicePod GO-Preview - High-Fidelity & Auto-Materialization Edition)
// Misión: Ventana táctica fotorrealista sincronizada con la soberanía de triangulación global.
// [ESTABILIZACIÓN]: Implementación de Montaje Condicional T0 y Perspectiva GO Automática.

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

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V22.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isGPSLock,
    setTriangulated
  } = useGeoEngine();

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  /**
   * [HOT-SWAP T0]: 
   * Si el sistema ya está triangulado (vía Geo-IP o caché), 
   * la cámara nace asentada para el Dashboard instantáneo.
   */
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const hasInitialJumpPerformed = useRef<boolean>(false);
  const autoIgnitionAttempted = useRef<boolean>(false);

  /**
   * 2. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Detecta dimensiones físicas antes de permitir el montaje del motor.
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
   * Despierta el hardware GPS sin intervención humana.
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE' && !autoIgnitionAttempted.current) {
      nicepodLog("📡 [MapPreview] Auto-Ignición: Solicitando enlace.");
      initSensors();
      autoIgnitionAttempted.current = true;
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 4. RED DE SEGURIDAD (RESCUE TIMER)
   * Si el motor WebGL no responde, forzamos el revelado tras 6 segundos.
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Revelado forzado por tiempo.");
          setIsCameraSettled(true);
        }
      }, 6000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. PROTOCOLO DE LOCALIZACIÓN AGRESIVA (POKÉMON GO STYLE)
   * Misión: Ajustar la cámara automáticamente en cuanto hay coordenadas.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Voyager materializado. Aplicando perspectiva GO.");

    const goView = {
      center: [userLocation.longitude, userLocation.latitude] as [number, number],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 80,
      bearing: -15,
    };

    if (!isTriangulated) {
      // Caso A: Inicio en frío. Vuelo cinemático.
      mapRef.current.flyTo({
        ...goView,
        ...FLY_CONFIG,
        duration: 2500,
      });
      setTriangulated();
    } else {
      // Caso B: Hot-Swap (Ubicación persistente). Salto instantáneo.
      mapRef.current.jumpTo(goView);
      setIsCameraSettled(true);
    }

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation, isTriangulated, setTriangulated]);

  /**
   * 6. EL REVELADO SOBERANO (Data-Driven onIdle)
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla visual sintonizada por IDLE.");
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

        {/* ESCENARIO: ACCESO GPS BLOQUEADO */}
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

        /* ESCENARIO: CORTINA DE CARGA (SMOKESCREEN) */
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
                  {!userLocation ? "Capturando Telemetría..." : "Estabilizando Malla 3D"}
                </p>
              </div>

              {/* Botón de ignición manual si la auto-ignición es bloqueada por el navegador */}
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
          [MANDATO V16.5]: Solo montamos cuando tenemos ubicación real o de IP.
          Esto garantiza que MapCore nazca en el lugar correcto sin saltos desde Sol.
      */}
      {isContainerReady && userLocation && (
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            startCoords={userLocation} 
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
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110 shadow-2xl">
            <Maximize2 size={14} className="text-white" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V16.5):
 * 1. Protocolo de Montaje Condicional: Se ha sincronizado el widget del Dashboard con 
 *    la lógica del orquestador principal. El motor Mapbox solo se instancia cuando 
 *    el GeoEngine entrega la ubicación, garantizando que el nacimiento ocurra en 
 *    la coordenada real (o IP) del usuario, aniquilando el error de Sol.
 * 2. Hot-Swap Nativo: El widget reconoce la persistencia de sesión global, 
 *    eliminando esperas innecesarias si el Voyager ya fue localizado.
 * 3. Perspectiva Pokémon GO: Se fuerza el ángulo de 80 grados desde el nacimiento 
 *    para mantener la consistencia inmersiva en toda la Workstation.
 * 4. Build Shield: Código íntegro, tipado y sin abreviaciones.
 */