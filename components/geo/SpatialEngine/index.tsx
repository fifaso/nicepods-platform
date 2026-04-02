/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 9.0 (NicePod Spatial Hub - Reactive Reveal & Seed-Birth Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar el motor WebGL garantizando el montaje inmediato mediante 
 * el uso de semillas de ubicación T0 para erradicar el bloqueo visual (Black Screen).
 * [REFORMA V9.0]: Migración a Smokescreen reactivo, purificación de nomenclatura 
 * y sincronía total con la arquitectura Triple-Core.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapProvider, MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn, nicepodLog } from "@/lib/utils";
import { calculateDistance } from "@/lib/geo-kinematics";

// --- CONSTANTES DE FÍSICA Y CONTRATOS V7.0 ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  MapPerformanceProfile,
  ZOOM_LEVELS
} from "../map-constants";

import { MapInstanceId, UserLocation, TelemetrySource } from "@/types/geo-sovereignty";
import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: EXTRACCIÓN DE TIPOS
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];

interface SpatialEngineProps {
  /** mapInstanceId: Identificador único para el aislamiento de VRAM en la GPU. */
  mapInstanceId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  theme?: MapboxLightPreset;
  performanceProfile?: MapPerformanceProfile;
  onManualAnchor?: (longitudeLatitude: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual Soberano.
 */
export function SpatialEngine({
  mapInstanceId,
  mode,
  theme = 'night',
  performanceProfile = 'HIGH_FIDELITY',
  onManualAnchor,
  className
}: SpatialEngineProps) {

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Synergy)
  const {
    userLocation,
    nearbyPOIs: nearbyPointsOfInterest,
    activePOI: activePointOfInterest,
    status: engineStatus,
    initSensors,
    isIgnited,
    needsBallisticLanding,
    setManualMode,
    cameraPerspective,
    toggleCameraPerspective
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL E INTEGRIDAD (Nomenclatura Completa)
  const mapInstanceReference = useRef<MapRef>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const lastSearchUpdatePositionReference = useRef<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0 });
  const fallbackTimerReference = useRef<NodeJS.Timeout | null>(null);

  // 3. ESTADOS DE INTERFAZ Y VISIBILIDAD
  const [selectedPointOfInterestId, setSelectedPointOfInterestId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);

  // searchPosition: Coordenadas que alimentan el Radar Semántico (Damped)
  const [searchPosition, setSearchPosition] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
   * Misión: Verificar dimensiones del DOM antes de inicializar WebGL.
   */
  useEffect(() => {
    if (!containerReference.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerReference.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * 5. PROTOCOLO DE REVELADO REACTIVO
   * Misión: Cambiar el estado de visibilidad una vez confirmada la estabilidad.
   */
  const handleMapStability = useCallback(() => {
    if (isMapVisible) return;
    nicepodLog(`✨ [SpatialHub:${mapInstanceId}] Malla despejada.`);
    setIsMapVisible(true);
    if (fallbackTimerReference.current) {
      clearTimeout(fallbackTimerReference.current);
    }
  }, [isMapVisible, mapInstanceId]);

  /**
   * 6. AUTO-IGNICIÓN Y PERSPECTIVA
   */
  useEffect(() => {
    if (isContainerReady) {
      if (!isIgnited && engineStatus === 'IDLE') {
        initSensors();
      }
      if (mode === 'EXPLORE' && mapInstanceId === 'map-full' && cameraPerspective === 'OVERVIEW') {
        toggleCameraPerspective();
      }
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective, mapInstanceId]);

  /**
   * 7. RACE-CONDITION GUARD: 
   * Forzamos visibilidad a los 3 segundos si Mapbox se demora en emitir onIdle.
   */
  useEffect(() => {
    if (isMapLoaded && !isMapVisible) {
      fallbackTimerReference.current = setTimeout(handleMapStability, 3000);
    }
    return () => {
      if (fallbackTimerReference.current) {
        clearTimeout(fallbackTimerReference.current);
      }
    };
  }, [isMapLoaded, isMapVisible, handleMapStability]);

  /**
   * 8. LA SEMILLA T0 (IP-Fallback Seed)
   * [MANDATO V9.0]: Garantiza que el mapa siempre tenga coordenadas para nacer.
   */
  const birthLocation: UserLocation = useMemo(() => {
    if (userLocation) return userLocation;

    return {
      latitude: MADRID_SOL_COORDS.latitude,
      longitude: MADRID_SOL_COORDS.longitude,
      accuracy: 9999,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      source: 'ip-fallback' as TelemetrySource
    };
  }, [userLocation]);

  /**
   * 9. MANEJADORES DE EVENTOS
   */
  const handleMapMove = useCallback((event: SafeMapMoveEvent) => {
    const { latitude, longitude } = event.viewState;

    // Search Damping: Solo actualizamos si el Voyager se mueve más de 25 metros.
    const movementDistance = calculateDistance(
      { latitude, longitude },
      { latitude: lastSearchUpdatePositionReference.current.latitude, longitude: lastSearchUpdatePositionReference.current.longitude }
    );

    if (movementDistance > 25) {
      setSearchPosition({ latitude, longitude });
      lastSearchUpdatePositionReference.current = { latitude, longitude };
    }

    if (event.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topResult = results[0];
      if (topResult.metadata?.lat && topResult.metadata?.lng && mapInstanceReference.current) {
        setManualMode(true);
        mapInstanceReference.current.flyTo({
          center: [topResult.metadata.lng, topResult.metadata.lat],
          zoom: ZOOM_LEVELS.STREET,
          ...FLY_CONFIG
        });
      }
    }
  }, [setManualMode]);

  /**
   * mappedSelectedPointOfInterest: 
   * Construcción del objeto de previsualización para la UI.
   */
  const mappedSelectedPointOfInterest = useMemo(() => {
    if (!selectedPointOfInterestId || !nearbyPointsOfInterest?.length) return null;
    const rawPoint = nearbyPointsOfInterest.find((item) => item.id.toString() === selectedPointOfInterestId);
    if (!rawPoint) return null;

    return {
      id: rawPoint.id.toString(),
      name: rawPoint.name,
      category: rawPoint.category_id,
      historical_fact: rawPoint.historical_fact || undefined,
      cover_image_url: rawPoint.gallery_urls?.[0] || undefined
    };
  }, [selectedPointOfInterestId, nearbyPointsOfInterest]);

  return (
    <MapProvider>
      <div 
        ref={containerReference} 
        className={cn("relative w-full h-full min-h-[100dvh] bg-[#010101] overflow-hidden isolate", className)}
      >
        <AnimatePresence>
          {/* I. SMOKESCREEN REACTIVO (V9.0) */}
          {!isMapVisible && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto"
            >
              {engineStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-4 text-center p-8">
                  <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 px-6">Acceso Geográfico Bloqueado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                    />
                    <Compass className="h-16 w-16 text-primary animate-spin-slow relative z-10" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white animate-pulse italic">
                    Sincronizando Malla
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* II. MOTOR WEBGL (MAP-CORE) */}
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapInstanceReference}
            mapInstanceId={mapInstanceId}
            mode={mode}
            performanceProfile={performanceProfile}
            startCoordinates={birthLocation}
            lightTheme={theme}
            selectedPointOfInterestId={selectedPointOfInterestId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapStability}
            onMove={handleMapMove}
            onMapClick={(event) => {
              if (mode === 'FORGE' && onManualAnchor) {
                onManualAnchor([event.lngLat.lng, event.lngLat.lat]);
              }
            }}
            onMarkerClick={setSelectedPointOfInterestId}
          />
          {isMapLoaded && (
            <CameraController mapInstanceId={mapInstanceId} />
          )}
        </div>

        {/* III. INTERFAZ TÁCTICA */}
        {mode === 'EXPLORE' && (
          <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[420px] pointer-events-auto">
            <UnifiedSearchBar
              variant="console"
              onResults={handleSearchResult}
              onLoading={setIsSearchLoading}
              latitude={searchPosition.latitude}
              longitude={searchPosition.longitude}
            />
          </div>
        )}

        <AnimatePresence>
          {mappedSelectedPointOfInterest && (
            <POIPreviewCard
              poi={mappedSelectedPointOfInterest}
              distance={activePointOfInterest?.id === selectedPointOfInterestId ? activePointOfInterest.distance : null}
              isResonating={activePointOfInterest?.id === selectedPointOfInterestId && activePointOfInterest.isWithinRadius}
              onClose={() => setSelectedPointOfInterestId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MapProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Persistent Reveal: Al migrar a un estado reactivo 'isMapVisible', eliminamos 
 *    la posibilidad de que un re-render del GPS vuelva a mostrar la cortina 
 *    negra, resolviendo el bug de desaparición del mapa.
 * 2. T0-Acceleration: El motor WebGL se monta utilizando birthLocation (IP Seed),
 *    disparando la descarga de texturas sin esperar al hardware satelital.
 * 3. Z-Index Sovereignty: La jerarquía z-[200] para carga, z-[100] para UI y 
 *    z-0 para el motor garantiza una profundidad visual coherente y profesional.
 */