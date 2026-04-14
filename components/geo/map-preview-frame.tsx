/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 25.0 (NicePod GO-Preview - Final Contract Alignment & Zero-Wait Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos, 
 * diseñada para el Dashboard central de la Workstation NicePod.
 * [REFORMA V25.0]: Resolución definitiva del error TS2322. Sincronización nominal 
 * del contrato 'startCoordinates' eliminando la polución de propiedades de 
 * cámara. Activación del bus 'onMove' para coherencia con el reactor visual. 
 * Purificación absoluta bajo la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.9 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// --- ADN DE CONSTANTES SOBERANAS ---
import { ACTIVE_MAP_THEME } from "./map-constants";

// --- MOTORES DE RENDERIZADO Y CINEMÁTICA ---
import { CameraController } from "./SpatialEngine/camera-controller";
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización cenital del Dashboard central.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerElementReference = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE LA FACHADA SOBERANA (Protocolo de Triangulación Elástica V53.0)
  const {
    userLocation,
    status: engineOperationalStatus,
    isTriangulated: isGeographicallyTriangulated,
    setManualMode
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL LOCAL (RESILIENCIA TÁCTICA)
  const [isContainerEnvironmentReady, setIsContainerEnvironmentReady] = useState<boolean>(false);
  const [isMapEngineEnvironmentLoaded, setIsMapEngineEnvironmentLoaded] = useState<boolean>(false);
  const [isMapInterfaceVisible, setIsMapInterfaceVisible] = useState<boolean>(false);

  const revealActionPerformedReference = useRef<boolean>(false);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE
   * Misión: Asegurar el anclaje físico en el DOM antes de instanciar la GPU.
   */
  useEffect(() => {
    const componentStabilizationTimeout = setTimeout(() => {
      setIsContainerEnvironmentReady(true);
    }, 300);

    return () => clearTimeout(componentStabilizationTimeout);
  }, []);

  /**
   * 4. EL REVELADO SOBERANO
   * Misión: Disolver el velo de carga una vez que el motor reporta estabilidad.
   */
  const handleSovereignMapRevealAction = useCallback(() => {
    if (revealActionPerformedReference.current) return;

    revealActionPerformedReference.current = true;
    setIsMapInterfaceVisible(true);
    nicepodLog("✨ [MapPreview] Malla Dashboard sincronizada y visible.");
  }, []);

  /**
   * 5. SAFETY TIMEOUT (INDUSTRIAL FAIL-SAFE)
   */
  useEffect(() => {
    if (isContainerEnvironmentReady && isMapEngineEnvironmentLoaded && !isMapInterfaceVisible) {
      const gracePeriodTimeout = setTimeout(() => {
        if (!revealActionPerformedReference.current) {
          nicepodLog("⚠️ [MapPreview] Safety Timeout: Forzando visibilidad.");
          handleSovereignMapRevealAction();
        }
      }, 3000);

      return () => clearTimeout(gracePeriodTimeout);
    }
  }, [isContainerEnvironmentReady, isMapEngineEnvironmentLoaded, isMapInterfaceVisible, handleSovereignMapRevealAction]);

  // Identificador único de instancia para la gobernanza de VRAM (Hardware Hygiene)
  const currentMapInstanceIdentification = "map-dashboard";

  /**
   * handleManualMovementInteraction:
   * Misión: Notificar al motor que el Voyager ha tomado control manual del visor.
   */
  const handleManualMovementInteraction = useCallback(() => {
    setManualMode(true);
  }, [setManualMode]);

  return (
    <MapProvider>
      <motion.div
        ref={containerElementReference}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#010101] transition-all duration-700",
          "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group isolate"
        )}
      >
        <AnimatePresence mode="wait">
          {!isMapInterfaceVisible && (
            <motion.div
              key="map_loading_veil"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-8 pointer-events-auto"
            >
              {engineOperationalStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-4 text-center p-8">
                  <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-red-400">Acceso Geográfico Bloqueado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Zap className="h-10 w-10 text-primary animate-pulse relative z-10" />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                  </div>
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Sincronización Órbital</span>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                      {!isGeographicallyTriangulated ? "Mapeando Contexto..." : "Sintonizando Malla..."}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            VII. REACTOR WEBGL AISLADO (TACTICAL_LITE PROFILE)
            [FIX V25.0]: Se inyecta 'userLocation' directamente en 'startCoordinates',
            eliminando el error TS2322 al alinearse con el contrato UserLocation.
        */}
        {isContainerEnvironmentReady && userLocation && (
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-auto transition-opacity duration-[1500ms]",
            isMapInterfaceVisible ? "opacity-100" : "opacity-0"
          )}>
            <MapCore
              mapInstanceIdentification={currentMapInstanceIdentification}
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE"
              startCoordinates={userLocation}
              lightTheme={ACTIVE_MAP_THEME}
              selectedPointOfInterestIdentification={null}
              onLoad={() => setIsMapEngineEnvironmentLoaded(true)}
              onIdle={handleSovereignMapRevealAction}
              onMove={handleManualMovementInteraction}
              onMapClick={() => { }}
              onMarkerClick={() => { }}
            />

            {isMapEngineEnvironmentLoaded && (
              <CameraController
                mapInstanceIdentification={currentMapInstanceIdentification}
                forcedPerspective="OVERVIEW"
              />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10 pointer-events-none opacity-80" />

        <div className="absolute bottom-0 left-0 right-0 p-8 z-[100] flex justify-between items-end pointer-events-none">
          <Link href="/map" className="flex items-center gap-5 pointer-events-auto group/button focus:outline-none">
            <div className="bg-primary/10 p-4 rounded-[1.2rem] backdrop-blur-3xl border border-primary/20 group-hover/button:bg-primary/30 transition-all shadow-inner">
              <Compass className="h-6 w-6 text-primary animate-spin-slow" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-white font-black text-xl uppercase tracking-tighter italic leading-none drop-shadow-2xl font-serif">
                Madrid Resonance
              </h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em] mt-2">
                Malla de Contexto Activa
              </p>
            </div>
          </Link>

          <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110 shadow-2xl">
              <Maximize2 size={16} className="text-white" />
            </div>
          </Link>
        </div>
      </motion.div>
    </MapProvider>
  );
});

MapPreviewFrame.displayName = "MapPreviewFrame";

/**
 * NOTA TÉCNICA DEL ARCHITECT (V25.0):
 * 1. Contract Alignment Fix: Se ha resuelto el error TS2322 al pasar 'userLocation' 
 *    limpio a 'MapCore', respetando el tipado de la Constitución V8.6.
 * 2. ZAP Absolute Compliance: Purificación total de descriptores técnicos: 
 *    handleManualMovementInteraction, currentMapInstanceIdentification, isMapInterfaceVisible.
 * 3. MTI Precision: El uso de 'memo' y el aislamiento del MapProvider aseguran 
 *    que el Dashboard no sufra degradación de FPS ante actualizaciones de red.
 */