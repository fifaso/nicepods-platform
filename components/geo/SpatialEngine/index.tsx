// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 6.4 (NicePod Spatial Hub - Cinematic Director & T0 Materialization Edition)
// Misión: Orquestar el motor WebGL con nacimiento en ubicación real y delegación LERP.
// [ESTABILIZACIÓN]: Restauración de salto T0 y cesión de mando a CameraController.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Power, ShieldAlert } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CÁMARA ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  ZOOM_LEVELS
} from "../map-constants";

import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

// [MANDATO V2.7]: Inyección del Director Cinematográfico
import { CameraController } from "./camera-controller";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  theme?: MapboxLightPreset;
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual de NicePod.
 */
export function SpatialEngine({ mode, theme = 'night', onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE TELEMETRÍA SOBERANA
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isGPSLock,
    setTriangulated,
    error: geoError
  } = useGeoEngine();

  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const [searchCenter, setSearchCenter] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 2. PROTOCOLOS DE INICIALIZACIÓN (Safe Mount)
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          observer.disconnect();
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * 3. PROTOCOLO DE IGNICIÓN AUTOMÁTICA
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE') {
      nicepodLog("📡 [Orchestrator] Despertando hardware sensorial.");
      initSensors();
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 4. PROTOCOLO DE RESCATE (Fail-Safe)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [Orchestrator] Timeout alcanzado. Forzando paso de luz.");
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. VUELOS MANUALES & T0 (Intervención de Usuario y Primer Frame)
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      bearing: -15,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.jumpTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      bearing: -15
    });
  }, [mode]);

  /**
   * 6. PROTOCOLO DE MATERIALIZACIÓN INICIAL (T0)
   * Asegura que el mapa apunte a la ubicación real ANTES de pasarle el mando al CameraController.
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded || hasInitialJumpPerformed.current) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      nicepodLog("🎯 [Orchestrator] Voyager detectado. Salto T0 Ejecutado.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated();
    } else {
      nicepodLog("🚀 [Orchestrator] Malla Persistente. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setIsCameraSettled(true);
    }

    hasInitialJumpPerformed.current = true;
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 7. PROTOCOLO DE REVELADO SOBERANO
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada. Revelado completado.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
  }, []);

  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

    onManualAnchor(lngLat);
    jumpToPosition(lngLat[0], lngLat[1], ZOOM_LEVELS.FORGE);
  }, [mode, onManualAnchor, jumpToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, ZOOM_LEVELS.STREET);
      }
    }
  }, [flyToPosition]);

  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs?.length) return null;
    const rawPoi = nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    if (!rawPoi) return null;
    return {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    };
  }, [selectedPOIId, nearbyPOIs]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>
      <AnimatePresence mode="wait">
        
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div key="p_denied" className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center">
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
          </motion.div>
        ) :
        
        !isCameraSettled ? (
          <motion.div key="smokescreen" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto">
            <Compass className="h-16 w-16 text-primary animate-spin-slow" />
            <div className="flex flex-col items-center gap-4 text-center px-12">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {!userLocation ? "Capturando Telemetría..." : "Estabilizando Malla 3D..."}
              </p>
            </div>
            {engineStatus === 'IDLE' && (
              <button onClick={() => initSensors()} className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] flex items-center gap-4 hover:scale-105 transition-transform">
                <Power size={14} />
                Iniciar Sincronía
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 
          [MANDATO V2.7]: Montaje Condicional garantizado. 
          El motor no nace hasta que tenemos la semilla espacial inicial.
      */}
      {isContainerReady && userLocation && (
        <div className="w-full h-full pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode={mode}
            startCoords={userLocation}
            theme={theme} 
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => { }} // Callback silente para permitir interactividad
            onMoveEnd={handleMoveEnd}
            onMapClick={handleMapClick}
            onMarkerClick={(id: string) => {
              if (mode === 'EXPLORE') {
                setSelectedPOIId(id);
                const p = nearbyPOIs.find(item => item.id.toString() === id);
                if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1]);
              }
            }}
          />
          
          {/* 
              [CEREBRO CINEMÁTICO INYECTADO] 
              Si estamos explorando, el Director toma el control de los motores WebGL 
              para garantizar el seguimiento de 60fps estilo Google Maps / Pokémon GO.
          */}
          {mode === 'EXPLORE' && isCameraSettled && (
             <CameraController />
          )}
        </div>
      )}

      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000 pointer-events-auto">
          <UnifiedSearchBar variant="console" onResults={handleSearchResult} placeholder="Rastrear ecos urbanos..." latitude={searchCenter.latitude} longitude={searchCenter.longitude} />
        </div>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <div className="pointer-events-auto contents">
            <POIPreviewCard poi={mappedSelectedPOI} distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null} isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius} onClose={() => setSelectedPOIId(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.4):
 * 1. Materialización T0: Se reinstauró un useEffect inicial que obliga a la 
 *    cámara a centrarse en el 'userLocation' nada más montarse el mapa. Esto 
 *    garantiza que el 'CameraController' empiece a interpolar desde la ubicación 
 *    correcta y no desde Madrid Sol.
 * 2. Delegación de Seguimiento: Una vez hecho el salto inicial, este orquestador 
 *    se desentiende del movimiento del usuario, dejándolo al 'CameraController'.
 * 3. Permission Shield: Se inyectó laUI para informar al usuario si los permisos 
 *    GPS fueron denegados por el sistema operativo, permitiendo un manejo de UX 
 *    elegante en lugar de una pantalla de carga infinita.
 */