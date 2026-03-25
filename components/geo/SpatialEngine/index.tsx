// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 5.2 (NicePod Spatial Hub - High-Fidelity & Zero-Latency Edition)
// Misión: Orquestar el motor WebGL eliminando la redundancia de carga y el bloqueo táctil.
// [ESTABILIZACIÓN]: Integración de Hot-Swap V20.0, Passthrough de eventos y Revelado por Datos.

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
  
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V20.0)
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
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  /**
   * [HOT-SWAP]: Si la sesión ya está triangulada, la cámara nace asentada.
   * Esto elimina la cortina negra (Smokescreen) instantáneamente del render inicial.
   */
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  // Ancla para el Radar de Búsqueda (Bóveda NKV) - Actualizado solo en moveEnd
  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

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
   * 5. PROTOCOLO DE RESCATE (Fail-Safe)
   * Si el motor WebGL tarda en emitir el onIdle, forzamos el revelado tras 6s.
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
   * 6. GESTIÓN DE CÁMARA INTELIGENTE
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom = ZOOM_LEVELS.STREET) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom = ZOOM_LEVELS.STREET) => {
    mapRef.current?.jumpTo({
      center: [lng, lat],
      zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0
    });
  }, [mode]);

  /**
   * 7. PROTOCOLO DE MATERIALIZACIÓN (T0 Materialization)
   * Reacciona a la primera ubicación disponible (IP, Caché o GPS).
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded || hasInitialJumpPerformed.current) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      // CASO A: Inicio en frío. Ejecutamos el vuelo cinemático.
      nicepodLog("🎯 [Orchestrator] Voyager localizado. Iniciando aproximación.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated(); // Sellamos la sesión global
    } else {
      // CASO B: Hot-Swap. Teletransportación instantánea.
      nicepodLog("🚀 [Orchestrator] Malla persistente detectada. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      // Forzamos el asentamiento de cámara si no ha ocurrido por onIdle aún
      setIsCameraSettled(true); 
    }

    hasInitialJumpPerformed.current = true;
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 8. MANEJADORES DE EVENTOS SOBERANOS
   */

  // Revelado por Datos: La GPU confirma que terminó de renderizar los tiles y edificios.
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada. Cortina disuelta.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    // Sincronizamos la Bóveda NKV solo al detener la cámara.
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

  // Data Mapper: PointOfInterest DB -> UI Card Props
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
      
      {/* 
          I. CORTINA DE CARGA SOBERANA (SMOKESCREEN) 
          [MANDATO V2.7]: 'pointer-events-none' al finalizar para liberar el mapa.
      */}
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10"
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
                {engineStatus === 'IDLE' ? "Esperando Gesto de Autorización..." : 
                 !userLocation ? "Capturando Telemetría de Red..." : "Estabilizando Malla 3D..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          II. EL MOTOR DE RENDERIZADO (CORE)
          Interactivo desde T0 para garantizar una UX líquida.
      */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.2):
 * 1. Hot-Swap Visual: El mapa detecta la triangulación previa del Voyager para 
 *    eliminar la cortina de carga, logrando una transición instantánea entre páginas.
 * 2. Liberación de Gestos: Se aplicó 'pointer-events-auto' de forma granular a 
 *    las capas interactivas (MapCore, SearchBar, Card), garantizando que el mapa 
 *    siempre responda al tacto del usuario tras el revelado.
 * 3. Revelado Basado en GPU: La cortina negra ya no depende de un cronómetro, sino 
 *    del evento 'onIdle' que confirma que los polígonos 3D están renderizados.
 * 4. Zero-Any Safe Build: Implementación total de Inferencia de Tipos para 
 *    cumplir con el contrato estricto de Mapbox sin fallos de compilación.
 */