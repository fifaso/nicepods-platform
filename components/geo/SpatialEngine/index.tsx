// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 5.9 (NicePod Spatial Hub - Bi-Phasic Precision & Auto-Materialization Edition)
// Misión: Orquestar el motor WebGL garantizando el nacimiento en IP y el refinamiento a GPS.
// [ESTABILIZACIÓN]: Implementación de GPS-Lock Trigger, Hot-Swap T0 y Perspectiva GO 80°.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Power } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CÁMARA V4.0 ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  STREET_VIEW_CONFIG,
  ZOOM_LEVELS
} from "../map-constants";

import { POIPreviewCard } from "../poi-preview-card";
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
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual de NicePod.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V22.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isGPSLock,       // Flag de autoridad satelital (<50m)
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

  // [HOT-SWAP T0]: Si la sesión ya está triangulada, la cámara nace asentada.
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  // Coordenadas para el Radar de Búsqueda (Bóveda NKV)
  const [searchCenter, setSearchCenter] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  // MEMORIA DE ACCIÓN (Evita bucles de cámara)
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
   * 5. PROTOCOLO DE IGNICIÓN (Hardware Handshake)
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE') {
      nicepodLog("📡 [Orchestrator] Despertando hardware sensorial.");
      initSensors();
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 6. PROTOCOLO DE RESCATE (Fail-Safe)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [Orchestrator] Fail-Safe: Revelando malla por timeout.");
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 7. GESTIÓN DE CÁMARA INMERSIVA (Pokémon GO Style)
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? STREET_VIEW_CONFIG.pitch : 0,
      bearing: STREET_VIEW_CONFIG.bearing,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.jumpTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? STREET_VIEW_CONFIG.pitch : 0,
      bearing: STREET_VIEW_CONFIG.bearing
    });
  }, [mode]);

  /**
   * 8. PROTOCOLO DE MATERIALIZACIÓN AUTOMÁTICA (Bi-Phasic Fix)
   * Misión: De la ciudad (IP) a la calle (GPS) sin intervención humana.
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    // FASE 1: Primer Fix (IP, Caché o GPS Inicial)
    if (!hasInitialJumpPerformed.current) {
      if (!isTriangulated) {
        nicepodLog("🎯 [Orchestrator] Primer Fix detectado. Iniciando aproximación aérea.");
        flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
        setTriangulated();
      } else {
        nicepodLog("🚀 [Orchestrator] Malla persistente. Hot-Swap instantáneo.");
        jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
        setIsCameraSettled(true);
      }
      hasInitialJumpPerformed.current = true;
      return;
    }

    // FASE 2: Refinamiento GPS Lock (Precisión < 50m)
    // Cuando el hardware certifica la posición exacta, realizamos el ajuste final.
    if (isGPSLock && !hasRefinedToGPS.current) {
      nicepodLog("🔒 [Orchestrator] GPS Lock alcanzado. Refinando posición exacta.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      hasRefinedToGPS.current = true;
    }

  }, [userLocation, isMapLoaded, isTriangulated, isGPSLock, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 9. MANEJADORES DE EVENTOS SOBERANOS
   */

  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D estabilizada al 100%.");
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
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
              />
              <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
            </div>

            <div className="flex flex-col items-center gap-6 text-center px-12">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                  Madrid Resonance
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {!userLocation ? "Capturando Telemetría de Red..." :
                    !isGPSLock ? "Fijando Coordenadas Satelitales..." : "Estabilizando Malla 3D..."}
                </p>
              </div>

              {engineStatus === 'IDLE' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => initSensors()}
                  className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  <Power size={14} />
                  Iniciar Sincronía
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          II. EL MOTOR DE RENDERIZADO (CORE)
          [MANDATO]: El montaje condicional garantiza que el mapa nazca en la coordenada real.
      */}
      {isContainerReady && userLocation && (
        <div className="w-full h-full pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode={mode}
            startCoords={userLocation}
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
        </div>
      )}

      {/* --- III. INTERFAZ TÁCTICA SUPERPUESTA --- */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000 pointer-events-auto">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            latitude={searchCenter.latitude}
            longitude={searchCenter.longitude}
          />
        </div>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <div className="pointer-events-auto contents">
            <POIPreviewCard
              poi={mappedSelectedPOI}
              distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
              isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius}
              onClose={() => setSelectedPOIId(null)}
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.9):
 * 1. Protocolo de Refinamiento Automático (IP to GPS): El orquestador ahora detecta 
 *    el paso de una ubicación estimada (IP) a una real (GPS Lock), ejecutando 
 *    un vuelo cinemático final para asegurar la precisión milimétrica del Voyager.
 * 2. Montaje Condicional T0: Se mantiene el bloqueo de renderizado hasta tener 
 *    ubicación inicial, garantizando que MapCore nazca en el lugar correcto.
 * 3. Sincronía Pokémon GO: Se unificaron los parámetros de cámara (Pitch 80, Zoom 17.5)
 *    en todos los saltos automáticos para una inmersión visual coherente.
 * 4. Liberación de Gestos: El uso de 'pointer-events-auto' en capas críticas 
 *    asegura que el mapa nunca se sienta 'bloqueado'.
 */