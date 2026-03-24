// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 2.0 (NicePod Spatial Hub - Gesture & Cinematic Reveal Edition)
// Misión: Orquestar el motor WebGL, la telemetría viva y el revelado fotorrealista.
// [ESTABILIZACIÓN]: Resolución de ts(17002) y gestión proactiva de permisos GPS.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  Power,
  ShieldAlert
} from "lucide-react";
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

  // [SINCRO]: Coordenadas locales para el Radar de Búsqueda
  const [viewState, setViewState] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
    zoom: mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.NEIGHBORHOOD,
    pitch: mode === 'FORGE' ? 0 : 75,
    bearing: -10,
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
   * Solo iniciamos el vuelo si el motor WebGL ya está cargado.
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
   * 5. MANEJADORES DE EVENTOS
   */
  const handleMove = useCallback((event: NicePodMapMoveEvent) => {
    setViewState(event.viewState);
  }, []);

  const handleMoveEnd = useCallback(() => {
    // Cuando el 'flyTo' termina, es seguro revelar el mapa
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D estabilizada. Fin de cortina de carga.");
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
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>

      {/* 
          I. CORTINA DE CARGA SOBERANA (SMOKESCREEN)
          Protege al Voyager del estrés de renderizado inicial.
      */}
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10"
          >
            {/* Visualización de Radar Central */}
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

              {/* [GESTO DE USUARIO]: Si el navegador bloquea el GPS, permitimos ignición manual */}
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

        {/* ESCENARIO B: PERMISSION SHIELD (ESTADO DE BLOQUEO) */}
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

      {/* 
          II. EL MOTOR DE RENDERIZADO (CORE)
          Solo visible tras la confirmación del vuelo cinemático.
      */}
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
            onMove={handleMove as any}
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

      {/* --- III. INTERFAZ TÁCTICA SUPERPUESTA --- */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Solución de Tags JSX: Se corrigió el cierre de etiquetas (Línea 268) 
 *    eliminando el error de compilación ts(17002).
 * 2. User Gesture bypass: El botón de 'Activar Sensores' en la cortina de carga
 *    rompe el bloqueo de privacidad de los navegadores móviles.
 * 3. Revelado por Evento: La transición se dispara mediante 'onMoveEnd', lo que
 *    garantiza que el Voyager vea la ciudad solo cuando la cámara esté estable.
 */