// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 6.6 (NicePod Spatial Hub - Bi-Phasic Materialization & Precision Edition)
// Misión: Orquestar el motor WebGL con refinamiento automático de IP a GPS real.
// [ESTABILIZACIÓN]: Implementación de GPS-Lock Trigger y sincronía con CameraController.

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

// --- CONSTANTES DE FÍSICA Y CÁMARA V5.0 ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  ZOOM_LEVELS
} from "../map-constants";

import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

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

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V27.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isGPSLock,       // Flag de autoridad satelital (<80m)
    setTriangulated,
    error: geoError
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS (SMOKESCREEN & REVELADO)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // El mapa nace asentado si la sesión ya era persistente (Hot-Swap)
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const [searchCenter, setSearchCenter] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  // MEMORIA DE VUELOS (Evita bucles de cámara)
  const hasInitialJumpPerformed = useRef<boolean>(false);
  const hasRefinedToGPS = useRef<boolean>(false);

  /**
   * 4. PROTOCOLOS DE SEGURIDAD MATEMÁTICA (Safe Mount)
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
   * 5. PROTOCOLO DE IGNICIÓN AUTOMÁTICA
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE') {
      nicepodLog("📡 [Orchestrator] Despertando hardware sensorial.");
      initSensors();
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 6. GESTIÓN DE CÁMARA CINEMÁTICA
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
   * 7. PROTOCOLO DE MATERIALIZACIÓN PROGRESIVA (T0 -> GPS Refinement)
   * Misión: Asegurar que el usuario llegue a su destino real sin intervención.
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    // FASE A: Primer Anclaje (Generalmente IP-Fallback o Caché)
    if (!hasInitialJumpPerformed.current) {
      if (!isTriangulated) {
        nicepodLog("🎯 [Orchestrator] Primer Fix detectado. Iniciando aproximación aérea.");
        flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
        setTriangulated();
      } else {
        nicepodLog("🚀 [Orchestrator] Hot-Swap activo. Ubicación persistente.");
        jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
        setIsCameraSettled(true);
      }
      hasInitialJumpPerformed.current = true;
      return;
    }

    // FASE B: Refinamiento GPS Lock (Corrección final de precisión)
    // Cuando el hardware finalmente entrega precisión certificada (<80m), realizamos el ajuste final.
    if (isGPSLock && !hasRefinedToGPS.current) {
      nicepodLog("🔒 [Orchestrator] GPS Lock alcanzado. Refinando posición exacta.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      hasRefinedToGPS.current = true;
    }

  }, [userLocation, isMapLoaded, isTriangulated, isGPSLock, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 8. MANEJADORES DE EVENTOS SOBERANOS
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

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
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

      {/* I. CORTINA DE CARGA SOBERANA (SMOKESCREEN) */}
      <AnimatePresence mode="wait">

        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div key="p_denied" className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center">
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
          </motion.div>
        ) :

          !isCameraSettled ? (
            <motion.div key="smokescreen" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto">
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
              </div>
              <div className="flex flex-col items-center gap-4 text-center px-12">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {!userLocation ? "Capturando Telemetría de Red..." :
                    !isGPSLock ? "Fijando Coordenadas Satelitales..." : "Estabilizando Malla 3D..."}
                </p>
              </div>
              {engineStatus === 'IDLE' && (
                <button onClick={() => initSensors()} className="mt-8 px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] flex items-center gap-4 hover:scale-105 transition-transform">
                  <Power size={14} />
                  Iniciar Sincronía
                </button>
              )}
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* II. MOTOR DE RENDERIZADO (CORE) */}
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
            onMove={() => { }}
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

          {/* [DIRECTOR CINEMÁTICO]: Solo toma el mando cuando el mapa es estable */}
          {mode === 'EXPLORE' && isCameraSettled && (
            <CameraController />
          )}
        </div>
      )}

      {/* --- III. INTERFAZ TÁCTICA SUPERPUESTA --- */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000 pointer-events-auto">
          <UnifiedSearchBar variant="console" onResults={handleSearchResult} onLoading={setIsSearchLoading} placeholder="Rastrear ecos urbanos..." latitude={searchCenter.latitude} longitude={searchCenter.longitude} />
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.6):
 * 1. Protocolo de Refinamiento Automático: El orquestador ahora utiliza 'isGPSLock' 
 *    para realizar el ajuste final de precisión. El Voyager aparece primero en su área 
 *    (IP) y luego se desliza suavemente hacia su posición exacta (GPS satelital).
 * 2. Montaje Condicional T0: Se mantiene el bloqueo de renderizado hasta tener 
 *    ubicación inicial, garantizando que MapCore nazca en el lugar correcto.
 * 3. Hot-Swap Visual: El mapa detecta la triangulación previa de la sesión para 
 *    eliminar el tiempo de espera de la cortina de carga.
 * 4. Sincronía Táctica: El Smokescreen informa dinámicamente sobre la calidad de 
 *    la señal (Red vs Satélite), eliminando la incertidumbre del usuario.
 */