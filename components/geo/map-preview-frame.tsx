/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 22.0 (NicePod GO-Preview - Absolute Performance & Contract Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos.
 * [REFORMA V22.0]: Erradicación de 'Layout Thrashing' mediante la eliminación de 
 * ResizeObserver, implementación de carga asíncrona para proteger el Main Thread 
 * y sincronización de frontera para el Build Shield de Vercel.
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
 * MapPreviewFrame: El widget de visualización cenital del Dashboard central.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerElementReference = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade V4.0)
  const {
    userLocation,
    status: engineOperationalStatus,
    isTriangulated: isGeographicallyTriangulated,
    setManualMode
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL LOCAL (Sin abreviaciones)
  const [isContainerEnvironmentReady, setIsContainerEnvironmentReady] = useState<boolean>(false);
  const [isMapEngineLoaded, setIsMapEngineLoaded] = useState<boolean>(false);
  const [isMapInterfaceVisible, setIsMapInterfaceVisible] = useState<boolean>(false);
  
  const revealActionPerformedReference = useRef<boolean>(false);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Shielded Mount)
   * Misión: Evitar el 'Forced Reflow' detectado en el peritaje de consola.
   * Delegamos la activación del contenedor al ciclo de vida asíncrono de React.
   */
  useEffect(() => {
    const stabilizationTimeout = setTimeout(() => {
      setIsContainerEnvironmentReady(true);
    }, 500); 

    return () => clearTimeout(stabilizationTimeout);
  }, []);

  /**
   * 4. EL REVELADO SOBERANO (Cinematografía de Interfaz)
   * Misión: Disolver el velo de carga una vez que la GPU ha terminado el renderizado.
   */
  const handleSovereignMapReveal = useCallback(() => {
    if (revealActionPerformedReference.current) return;
    
    revealActionPerformedReference.current = true;
    setIsMapInterfaceVisible(true);
    
    nicepodLog("✨ [MapPreview] Malla Dashboard sincronizada con el motor WebGL.");
  }, []);

  // Identificador de instancia para la gobernanza de memoria GPU
  const mapInstanceIdentification = "map-dashboard";

  return (
    /**
     * MapProvider local: Aislamiento total del contexto WebGL para evitar 
     * colisiones de cámara con la vista de mapa principal.
     */
    <MapProvider>
      <motion.div
        ref={containerElementReference}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#010101] transition-all duration-700",
          "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group isolate"
        )}
      >
        <AnimatePresence>
          {/* VELO DE PROTECCIÓN VISUAL (LOADING OVERLAY) */}
          {!isMapInterfaceVisible && (
            <motion.div 
              key="loading_overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-8 pointer-events-auto"
            >
              {engineOperationalStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-4 text-center p-8">
                  <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Geográfico Bloqueado</span>
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
                      {!isGeographicallyTriangulated ? "Mapeando Contexto..." : "Fijando Coordenadas..."}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            VII. MOTOR WEBGL AISLADO (TACTICAL_LITE PROFILE)
            [FIX TS2322]: Se utilizan los nombres de propiedad 'mapInstanceId' y 
            'selectedPointOfInterestId' para cumplir con la interfaz actual de MapCore.
        */}
        {isContainerEnvironmentReady && userLocation && (
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-auto transition-opacity duration-[1500ms]",
            isMapInterfaceVisible ? "opacity-100" : "opacity-0"
          )}>
            <MapCore
              mapInstanceId={mapInstanceIdentification} 
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE"
              startCoordinates={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              lightTheme={ACTIVE_MAP_THEME}
              selectedPointOfInterestId={null} 
              onLoad={() => setIsMapEngineLoaded(true)}
              onIdle={handleSovereignMapReveal}
              onMove={() => setManualMode(true)}
              onMapClick={() => {}}
              onMarkerClick={() => {}}
            />
            
            {/* SOBERANÍA DE PERSPECTIVA DASHBOARD */}
            {isMapEngineLoaded && (
              <CameraController 
                mapInstanceId={mapInstanceIdentification} 
                forcedPerspective="OVERVIEW" 
              />
            )}
          </div>
        )}

        {/* GRADIENTE DE PROFUNDIDAD ATMOSFÉRICA */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10 pointer-events-none opacity-80" />

        {/* INTERFAZ TÁCTICA DE COMANDO */}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Build Shield Compliance: Se revirtieron los nombres de las propiedades en la 
 *    llamada a MapCore y CameraController para alinearse con sus interfaces actuales 
 *    y eliminar el error TS2322 en Vercel.
 * 2. Zero Abbreviations Policy: Purificación absoluta de la lógica interna del 
 *    componente (isContainerEnvironmentReady, handleSovereignMapReveal).
 * 3. Anti-Reflow Pattern: La eliminación del ResizeObserver reduce el bloqueo 
 *    del hilo principal durante el montaje en dispositivos móviles.
 */