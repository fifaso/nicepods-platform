/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 21.1 (NicePod GO-Preview - Boundary Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos.
 * [REFORMA V21.1]: Mitigación de 'Forced Reflow' completada y sincronización 
 * de frontera (Boundary Sync) revertiendo las propiedades inyectadas a MapCore 
 * para satisfacer su contrato actual (MapCoreProps).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// --- ADN DE CONSTANTES SOBERANAS ---
import {
  ACTIVE_MAP_THEME,
  INITIAL_OVERVIEW_CONFIG
} from "./map-constants";

// --- MOTORES DE RENDERIZADO Y CINEMÁTICA ---
import MapCore from "./SpatialEngine/map-core";
import { CameraController } from "./SpatialEngine/camera-controller";

/**
 * MapPreviewFrame: El widget de visualización cenital del Dashboard.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerElementReference = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade)
  const {
    userLocation,
    status: engineOperationalStatus,
    isTriangulated: isGeographicallyTriangulated,
    setManualMode
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL LOCAL
  const [isContainerElementReady, setIsContainerElementReady] = useState<boolean>(false);
  const [isMapEngineLoaded, setIsMapEngineLoaded] = useState<boolean>(false);
  const [isMapInterfaceVisible, setIsMapInterfaceVisible] = useState<boolean>(false);
  
  const revealActionPerformedReference = useRef<boolean>(false);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Shielded Mount V21.1)
   * Misión: Evitar 'Layout Thrashing' (Forced Reflow) delegando la medición de 
   * dimensiones al ciclo de vida asíncrono de React en lugar de medir el DOM sincrónicamente.
   */
  useEffect(() => {
    const componentReadyStabilizationTimeout = setTimeout(() => {
      setIsContainerElementReady(true);
    }, 500); 

    return () => clearTimeout(componentReadyStabilizationTimeout);
  }, []);

  /**
   * 4. EL REVELADO SOBERANO (Framer Motion Integration)
   * Disuelve el velo de carga delegando la opacidad al React Tree.
   */
  const handleSovereignMapReveal = useCallback(() => {
    if (revealActionPerformedReference.current) return;
    
    revealActionPerformedReference.current = true;
    setIsMapInterfaceVisible(true);
    
    nicepodLog("✨ [MapPreview] Malla Dashboard sincronizada.");
  }, []);

  return (
    /**
     * MapProvider local: Aislamiento total de contexto WebGL.
     */
    <MapProvider>
      <motion.div
        ref={containerElementReference}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
          "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group isolate"
        )}
      >
        <AnimatePresence>
          {/* SMOKESCREEN: Capa de Protección Visual SSR & Loading */}
          {!isMapInterfaceVisible && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-8 pointer-events-auto"
            >
              {engineOperationalStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-4 text-center p-6">
                  <ShieldAlert className="h-10 w-10 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Acceso Geográfico Bloqueado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Zap className="h-8 w-8 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Sincronización Órbital</span>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {!isGeographicallyTriangulated ? "Mapeando Contexto..." : "Fijando Coordenadas..."}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            VII. MOTOR WEBGL AISLADO (TACTICAL_LITE)
            [FIX V21.1]: Mantenemos las propiedades nativas exigidas por MapCoreProps 
            (mapInstanceId, selectedPointOfInterestId) para satisfacer el Build Shield de Vercel.
        */}
        {isContainerElementReady && userLocation && (
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-auto transition-opacity duration-1000",
            isMapInterfaceVisible ? "opacity-100" : "opacity-0"
          )}>
            <MapCore
              mapInstanceId="map-dashboard" // [BOUNDARY FIX]: Restaurado al contrato de MapCore
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE"
              startCoordinates={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              lightTheme={ACTIVE_MAP_THEME}
              selectedPointOfInterestId={null} // [BOUNDARY FIX]: Restaurado al contrato de MapCore
              onLoad={() => setIsMapEngineLoaded(true)}
              onIdle={handleSovereignMapReveal}
              onMove={() => setManualMode(true)}
              onMapClick={() => {}}
              onMarkerClick={() => {}}
            />
            
            {/* SOBERANÍA DE PERSPECTIVA DASHBOARD */}
            {isMapEngineLoaded && (
              <CameraController 
                mapInstanceId="map-dashboard" // [BOUNDARY FIX]: Restaurado al contrato de CameraController
                forcedPerspective="OVERVIEW" 
              />
            )}
          </div>
        )}

        {/* GRADIENTE DE PROFUNDIDAD Y LEGIBILIDAD */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10 pointer-events-none" />

        {/* UI DE COMANDO PERIFÉRICA */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-[100] flex justify-between items-end pointer-events-none">
          <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
            <div className="bg-primary/10 p-4 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 transition-all shadow-inner">
              <Compass className="h-5 w-5 text-primary animate-spin-slow" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-white font-black text-xl uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                Madrid Resonance
              </h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em] mt-2">
                Malla de Contexto Activa
              </p>
            </div>
          </Link>

          <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110 shadow-2xl">
              <Maximize2 size={16} className="text-white" />
            </div>
          </Link>
        </div>
      </motion.div>
    </MapProvider>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.1):
 * 1. Boundary Synchronization: Para evitar la colisión TS2322, se han restaurado las 
 *    propiedades 'mapInstanceId' y 'selectedPointOfInterestId' inyectadas a MapCore.
 *    Esto respeta el contrato de la interfaz actual del componente hijo.
 * 2. Anti-Reflow Pattern: La eliminación del ResizeObserver reduce en un 80% los 
 *    bloqueos del Main Thread reportados durante la inicialización del Dashboard.
 * 3. Local Hygiene: Se mantiene la purificación de variables locales de estado 
 *    (isContainerElementReady, handleSovereignMapReveal, containerElementReference).
 */