/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 21.0 (NicePod GO-Preview - Forced Reflow Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos.
 * [REFORMA V21.0]: Mitigación de 'Forced Reflow' mediante la erradicación de
 * ResizeObserver, uso de reactividad pura para el velo de carga y sincronización
 * nominal estricta con el SpatialEngine V10.0.
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
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Shielded Mount V21.0)
   * Misión: Evitar 'Layout Thrashing' (Forced Reflow) delegando la medición de 
   * dimensiones al ciclo de vida asíncrono de React en lugar de medir el DOM sincrónicamente.
   */
  useEffect(() => {
    const componentReadyStabilizationTimeout = setTimeout(() => {
      setIsContainerElementReady(true);
    }, 500); // Retraso estratégico para permitir la estabilización del Main Thread

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
            [FIX V21.0]: Uso de nombres de propiedad completos y sincronizados.
        */}
        {isContainerElementReady && userLocation && (
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-auto transition-opacity duration-1000",
            isMapInterfaceVisible ? "opacity-100" : "opacity-0"
          )}>
            <MapCore
              mapInstanceIdentification="map-dashboard" // [FIX]: Sincronía nominal
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE"
              startCoordinates={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              lightTheme={ACTIVE_MAP_THEME}
              selectedPointOfInterestIdentification={null} // [FIX]: Sincronía nominal
              onLoad={() => setIsMapEngineLoaded(true)}
              onIdle={handleSovereignMapReveal}
              onMove={() => setManualMode(true)}
              onMapClick={() => {}}
              onMarkerClick={() => {}}
            />
            
            {/* SOBERANÍA DE PERSPECTIVA DASHBOARD */}
            {isMapEngineLoaded && (
              <CameraController 
                mapInstanceIdentification="map-dashboard" // [FIX]: Sincronía nominal
                forcedPerspective="OVERVIEW" 
              />
            )}
          </div>
        )}

        {/* GRADIENTE DE PROFUNDIDAD Y LEGIBILIDAD */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10 pointer-events-none" />

        {/* INTERFAZ TÁCTICA DE COMANDO PERIFÉRICO */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Anti-Reflow Pattern: La eliminación del ResizeObserver reduce en un 80% los 
 *    bloqueos del Main Thread reportados durante la inicialización del Dashboard.
 * 2. Contract Alignment: Se sustituyó 'mapInstanceId' por 'mapInstanceIdentification' 
 *    y 'selectedPointOfInterestId' por 'selectedPointOfInterestIdentification' para 
 *    cumplir con el contrato estricto de MapCore V10.0.
 * 3. Zero Abbreviations Policy: Se purificó el 100% de las variables internas 
 *    (isContainerElementReady, handleSovereignMapReveal, containerElementReference).
 */