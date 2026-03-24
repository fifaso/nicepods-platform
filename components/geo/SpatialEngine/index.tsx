// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 1.1 (NicePod Spatial Hub - Orchestrator Edition)
// Misión: Orquestar el motor WebGL, la telemetría viva y el revelado cinemático.
// [ESTABILIZACIÓN]: Resolución de ts(2304) mediante sincronía de viewState para el Radar.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { MapRef } from "react-map-gl/mapbox";

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
 * I. [BUILD SHIELD]: CONTRATOS DE EVENTOS
 * ---------------------------------------------------------------------------
 */
interface NicePodMapMoveEvent {
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

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

  // [FIX SINCRO]: Estado de cámara local para alimentar al Radar y HUD
  const [viewState, setViewState] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
    zoom: mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.NEIGHBORHOOD,
    pitch: mode === 'FORGE' ? 0 : 75,
    bearing: -10,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 3. PROTOCOLOS DE INICIALIZACIÓN
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

  useEffect(() => {
    initSensors();
  }, [initSensors]);

  /**
   * 4. PROTOCOLOS DE VUELO (CÁMARA TÁCTICA)
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
   * [MISIÓN: AUTO-LOCALIZACIÓN CINEMÁTICA]
   */
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [Orchestrator] Salto inicial hacia Voyager.");

      const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.NEIGHBORHOOD;
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom, 80);

      hasInitialJumpPerformed.current = true;
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  /**
   * 5. MANEJADORES DE EVENTOS SOBERANOS
   */
  const handleMove = useCallback((event: NicePodMapMoveEvent) => {
    // Actualizamos las coordenadas locales para que el Radar sepa dónde estamos
    setViewState(event.viewState);
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Posición estabilizada. Revelando.");
    }
  }, [isCameraSettled]);

  const handleMapClick = useCallback((event: any) => {
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
    <div ref={containerRef} className={cn("w-full h-full relative bg-black", className)}>

      {/* --- I. CORTINA DE CARGA (SMOKESCREEN) --- */}
      <AnimatePresence>
        {!isCameraSettled && engineStatus !== 'PERMISSION_DENIED' && (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-5"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="flex flex-col items-center gap-2 text-center px-12">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic leading-none">
                Sincronizando Órbita
              </span>
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse">
                {!isMapLoaded ? "Inicializando Motor WebGL..." :
                  !userLocation ? "Buscando Coordenadas..." :
                    "Calibrando Malla Fotorrealista..."}
              </span>
            </div>
          </motion.div>
        )}

        {/* PERMISSION SHIELD */}
        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="p-shield"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[150] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">GPS Inaccesible</span>
            <p className="text-xs text-zinc-500 mt-4 max-w-[200px] leading-relaxed">
              Habilite el acceso a la ubicación en su navegador para entrar en la Malla.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- II. EL MOTOR DE RENDERIZADO (CORE) --- */}
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
            onMoveEnd={handleMoveEnd}
            onMapClick={handleMapClick}
            onMarkerClick={(id) => {
              if (mode === 'EXPLORE') {
                setSelectedPOIId(id);
                const p = nearbyPOIs.find(item => item.id.toString() === id);
                if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], ZOOM_LEVELS.STREET, 75);
              }
            }}
          />
        </motion.div>
      )}

      {/* --- III. INTERFAZ TÁCTICA (HUD & RADAR) --- */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            // [RESOLUCIÓN TS2304]: Ahora viewState está disponible para el Radar
            latitude={viewState.latitude}
            longitude={viewState.longitude}
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