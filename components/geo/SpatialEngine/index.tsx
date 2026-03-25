// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 4.0 (NicePod Spatial Hub - Type Extraction & Zero-Thrashing Edition)
// Misión: Orquestar el motor WebGL eliminando la fatiga de estado de React.
// [ESTABILIZACIÓN]: Resolución de ts(2709) y ts(2304) mediante Inferencia de Props (ComponentProps).

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  Power,
  ShieldAlert
} from "lucide-react";
import type { ComponentProps } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// 1. IMPORTACIÓN SOBERANA DESDE EL ENTRY POINT CORRECTO
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import {
  FLY_CONFIG,
  INITIAL_VIEW_STATE,
  ZOOM_LEVELS
} from "../map-constants";

// --- UNIDADES OPERATIVAS ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * En lugar de importar tipos propensos a colisiones de Namespace (ts(2709)),
 * extraemos matemáticamente el tipo exacto que el componente <Map> espera.
 * ---------------------------------------------------------------------------
 */
type MapProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapProps['onClick']>>[0];

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine (Orquestador):
 * El cerebro táctico que gestiona la cámara, la búsqueda y el revelado visual.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. REFERENCIAS DE CONTROL Y HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const geoEngine = useGeoEngine();
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors
  } = geoEngine;

  // 2. MÁQUINA DE ESTADOS (SMOKESCREEN PROTOCOL)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  // [SINCRO DE DEBOUNCE]: Coordenadas locales para el Radar de Búsqueda
  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 3. PROTOCOLOS DE INICIALIZACIÓN (Safe Mount)
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
   * [SISTEMA]: Auto-Ignición de Sensores
   */
  useEffect(() => {
    if (isContainerReady) {
      initSensors();
    }
  }, [isContainerReady, initSensors]);

  /**
   * 4. PROTOCOLOS DE VUELO CINEMÁTICO
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = ZOOM_LEVELS.STREET, targetPitch = 80) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        pitch: mode === 'EXPLORE' ? targetPitch : 0,
        ...FLY_CONFIG
      });
    }
  }, [mode]);

  /**
   * [MISIÓN: AUTO-LOCALIZACIÓN EN LAS SOMBRAS]
   */
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [Orchestrator] Posición confirmada. Iniciando vuelo táctico.");
      const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom, 80);
      hasInitialJumpPerformed.current = true;
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  /**
   * 5. MANEJADORES DE EVENTOS SOBERANOS
   */

  // Zero-Thrashing Protocol: El mapa se mueve sin disparar el reconciliador de React.
  const handleMove = useCallback((event: SafeMapMoveEvent) => {
    // Operación silente para mantener 60 FPS
  }, []);

  // Actualización táctica solo al detener la cámara.
  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });

    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D estabilizada. Fin de cortina de carga.");
    }
  }, [isCameraSettled]);

  // Build Shield Activo mediante SafeMapClickEvent extraído directamente del componente.
  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    onManualAnchor(lngLat);
    flyToPosition(lngLat[0], lngLat[1], ZOOM_LEVELS.FORGE, 0);
  }, [mode, onManualAnchor, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, ZOOM_LEVELS.STREET, 75);
      }
    }
  }, [flyToPosition]);

  // Data Mapper para el Dossier de Hallazgo
  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs || nearbyPOIs.length === 0) return null;
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
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
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

            <div className="flex flex-col items-center gap-6 text-center px-12">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                  Sincronización Órbital
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {engineStatus === 'IDLE' ? "Esperando Autorización de Sensores..." :
                    !isMapLoaded ? "Cargando Malla WebGL..." :
                      !userLocation ? "Buscando Coordenadas Satelitales..." :
                        "Estabilizando Horizonte 3D..."}
                </p>
              </div>

              {engineStatus === 'IDLE' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => initSensors()}
                  className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary),0.4)] flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  <Power size={14} />
                  Activar Sensores
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="p-shield"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-[#020202] flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-8">
              <ShieldAlert className="h-16 w-16 text-red-500 relative z-10" />
              <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            <p className="text-xs text-zinc-500 mt-6 max-w-[280px] leading-relaxed uppercase font-bold tracking-widest">
              La Malla de Madrid requiere acceso al hardware GPS. Habilite los permisos en la configuración de su dispositivo para continuar.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full"
        >
          <MapCore
            ref={mapRef}
            mode={mode}
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
            onMapClick={handleMapClick}
            onMarkerClick={(id: string) => {
              if (mode === 'EXPLORE') {
                setSelectedPOIId(id);
                const p = nearbyPOIs.find(item => item.id.toString() === id);
                if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], ZOOM_LEVELS.STREET, 75);
              }
            }}
          />
        </motion.div>
      )}

      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
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
          <POIPreviewCard
            poi={mappedSelectedPOI}
            distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
            isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Type Extraction Strategy: Se eliminaron las importaciones problemáticas de tipos 
 *    nativos de Mapbox para evitar el error ts(2709) y ts(2304). Los tipos se extraen 
 *    dinámicamente usando 'Parameters<NonNullable<ComponentProps<typeof Map>["evento"]>>[0]'.
 *    Esto garantiza compilación exitosa 100% independiente de la jerarquía de Namespaces interna.
 */