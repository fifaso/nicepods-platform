// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 5.3 (NicePod Spatial Hub - High-Fidelity & Type-Resilient Edition)
// Misión: Orquestar el motor WebGL eliminando la redundancia de carga y el bloqueo táctil.
// [ESTABILIZACIÓN]: Resolución de error ts(2345) mediante tipado explícito de zoom.

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
import { FLY_CONFIG, INITIAL_VIEW_STATE, ZOOM_LEVELS } from "../map-constants";
import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * Extraemos dinámicamente los contratos de eventos directamente del componente Map.
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
 * SpatialEngine: El Cerebro Táctico de la Malla de Madrid.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {
  
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V21.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS (REVELADO & PERSISTENCIA)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  // [HOT-SWAP]: Si la sesión ya está triangulada, la cámara nace asentada.
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  // Ancla para el Radar de Búsqueda (Bóveda NKV)
  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 4. PROTOCOLOS DE INICIALIZACIÓN (Safe Mount)
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
          nicepodLog("⚠️ [Orchestrator] Fail-Safe activado. Forzando paso de luz.");
          setIsCameraSettled(true);
        }
      }, 6000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 7. GESTIÓN DE CÁMARA INMERSIVA
   * [FIX V2.7]: Tipamos 'zoom: number' para evitar el error de literal ts(2345).
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    mapRef.current?.jumpTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0
    });
  }, [mode]);

  /**
   * 8. PROTOCOLO DE MATERIALIZACIÓN (T0 Materialization)
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded || hasInitialJumpPerformed.current) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      // CASO A: Inicio en frío.
      nicepodLog("🎯 [Orchestrator] Voyager localizado. Iniciando aproximación.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated();
    } else {
      // CASO B: Hot-Swap instantáneo.
      nicepodLog("🚀 [Orchestrator] Malla persistente detectada. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setIsCameraSettled(true); 
    }

    hasInitialJumpPerformed.current = true;
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 9. MANEJADORES DE EVENTOS SOBERANOS
   */

  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada. Cortina disuelta.");
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

            <div className="flex flex-col items-center gap-4 text-center px-12">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                Madrid Resonance
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {engineStatus === 'IDLE' ? "Esperando Autorización..." : 
                 !userLocation ? "Capturando Telemetría de Red..." : "Estabilizando Malla 3D..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* II. EL MOTOR DE RENDERIZADO (CORE) */}
      {isContainerReady && (
        <div className="w-full h-full pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode={mode}
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => {}}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.3):
 * 1. Solución ts(2345): Se tiparon explícitamente los parámetros 'zoom: number' en 
 *    flyToPosition y jumpToPosition, permitiendo el uso de literales de ZOOM_LEVELS 
 *    sin conflictos de tipos durante el build de Vercel.
 * 2. Hot-Swap Visual: El mapa detecta la triangulación previa del Voyager para 
 *    eliminar la cortina de carga, logrando una transición instantánea entre páginas.
 * 3. Liberación de Gestos: Se aplica 'pointer-events-auto' de forma granular para 
 *    garantizar que el mapa siempre responda al tacto tras el revelado.
 */