/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 9.1 (NicePod Spatial Hub - Multidimensional Integrity & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el motor WebGL garantizando el montaje inmediato y la integridad 
 * total de los datos taxonómicos entre la Bóveda NKV y la previsualización.
 * [FIX V9.1]: Resolución de error TS2339 mediante la migración del mapeo de POIs 
 * a la nueva estructura de Misión, Entidad y Época Histórica.
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
 * [BUILD SHIELD]: EXTRACCIÓN DE TIPOS SOBERANOS
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

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core V3.0)
  const {
    userLocation,
    nearbyPOIs: nearbyPointsOfInterest,
    activePOI: activePointOfInterest,
    status: engineStatus,
    initSensors,
    isTriangulated,
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

  // 3. ESTADOS DE INTERFAZ Y REVELADO
  const [selectedPointOfInterestId, setSelectedPointOfInterestId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);

  const [searchPosition, setSearchPosition] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
   */
  useEffect(() => {
    if (!containerReference.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          nicepodLog(`📐 [SpatialHub:${mapInstanceId}] Chasis validado.`);
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerReference.current);
    return () => resizeObserver.disconnect();
  }, [mapInstanceId]);

  /**
   * 5. PROTOCOLO DE REVELADO REACTIVO
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
   * 7. RACE-CONDITION GUARD
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
   * [FIX V9.1]: Sincronía con la Taxonomía Multidimensional V4.0.
   * Se mapean 'category_mission' y 'category_entity' para satisfacer al POIPreviewCard.
   */
  const mappedSelectedPointOfInterest = useMemo(() => {
    if (!selectedPointOfInterestId || !nearbyPointsOfInterest?.length) return null;
    const rawPoint = nearbyPointsOfInterest.find((item) => item.id.toString() === selectedPointOfInterestId);
    if (!rawPoint) return null;

    return {
      identification: rawPoint.id.toString(),
      name: rawPoint.name,
      categoryMission: rawPoint.category_mission,
      categoryEntity: rawPoint.category_entity,
      historicalEpoch: rawPoint.historical_epoch,
      historicalFact: rawPoint.historical_fact || undefined,
      coverImageUniformResourceLocator: rawPoint.gallery_urls?.[0] || undefined,
      externalReferenceUniformResourceLocator: (rawPoint.metadata as any)?.external_source_url || undefined
    };
  }, [selectedPointOfInterestId, nearbyPointsOfInterest]);

  return (
    <MapProvider>
      <div 
        ref={containerReference} 
        className={cn("relative w-full h-full min-h-[100dvh] bg-[#010101] overflow-hidden isolate", className)}
      >
        <AnimatePresence>
          {/* I. SMOKESCREEN REACTIVO (V9.1) */}
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
              pointOfInterest={mappedSelectedPointOfInterest}
              distanceMeters={activePointOfInterest?.id === selectedPointOfInterestId ? activePointOfInterest.distance : null}
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
 * NOTA TÉCNICA DEL ARCHITECT (V9.1):
 * 1. Contract Alignment: Se corrigió el mapeo de datos de 'PointOfInterest' para 
 *    utilizar la nueva taxonomía bidimensional (CategoryMission/CategoryEntity), 
 *    eliminando el error de compilación TS2339 detectado por Vercel.
 * 2. Visual Synchronization: Se alinearon los nombres de propiedades pasadas a 
 *    POIPreviewCard con su versión V3.0 (identification, distanceMeters, etc.), 
 *    garantizando un despliegue exitoso.
 * 3. Atomic State Management: El uso de mappedSelectedPointOfInterest asegura que 
 *    la UI solo intente renderizar nodos validados de la Bóveda NKV.
 */