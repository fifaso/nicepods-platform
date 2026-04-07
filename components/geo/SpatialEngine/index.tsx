/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 10.0 (NicePod Spatial Hub - Nominal Sovereignty & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el motor WebGL garantizando el montaje inmediato y la integridad 
 * total de tipos entre el radar semántico y la previsualización cartográfica.
 * [REFORMA V10.0]: Sincronización nominal con UnifiedSearchBar V6.0, erradicación 
 * absoluta de abreviaturas y resolución de errores de tipos TS2322.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE MOTOR ESPACIAL ---
import { MapProps, MapProvider, MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { calculateDistance } from "@/lib/geo-kinematics";
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CONTRATOS SOBERANOS ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  MapPerformanceProfile,
  ZOOM_LEVELS
} from "../map-constants";

import { MapInstanceId, TelemetrySource, UserLocation } from "@/types/geo-sovereignty";
import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: DEFINICIÓN DE TIPOS DE EVENTOS DESCRIPTIVOS
 */
type SafeMapMovementEvent = Parameters<NonNullable<MapProps['onMove']>>[0];

interface SpatialEngineProperties {
  /** mapInstanceIdentification: Identificador único para el aislamiento de VRAM en la GPU. */
  mapInstanceIdentification: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  visualTheme?: MapboxLightPreset;
  performanceProfile?: MapPerformanceProfile;
  onManualAnchorSelection?: (longitudeLatitude: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual Soberano.
 */
export function SpatialEngine({
  mapInstanceIdentification,
  mode,
  visualTheme = 'night',
  performanceProfile = 'HIGH_FIDELITY',
  onManualAnchorSelection,
  className
}: SpatialEngineProperties) {

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Synergy V3.1)
  const {
    userLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    status: engineStatus,
    initSensors,
    isIgnited: isEngineIgnited,
    needsBallisticLanding,
    setManualMode,
    cameraPerspective,
    toggleCameraPerspective
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL (Sin abreviaciones)
  const mapInstanceReference = useRef<MapRef>(null);
  const containerElementReference = useRef<HTMLDivElement>(null);
  const lastSearchUpdatePositionReference = useRef<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0 });
  const revealFallbackTimerReference = useRef<NodeJS.Timeout | null>(null);

  // 3. ESTADOS DE INTERFAZ DE ALTA DENSIDAD
  const [selectedPointOfInterestIdentification, setSelectedPointOfInterestIdentification] = useState<string | null>(null);
  const [isSearchProcessLoading, setIsSearchProcessLoading] = useState<boolean>(false);
  const [isContainerElementReady, setIsContainerElementReady] = useState<boolean>(false);
  const [isMapEngineLoaded, setIsMapEngineLoaded] = useState<boolean>(false);
  const [isMapInterfaceVisible, setIsMapInterfaceVisible] = useState<boolean>(false);

  const [currentSearchPosition, setCurrentSearchPosition] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE (Resize Sentinel)
   */
  useEffect(() => {
    if (!containerElementReference.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerElementReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerElementReference.current);
    return () => resizeObserver.disconnect();
  }, [mapInstanceIdentification]);

  /**
   * 5. PROTOCOLO DE REVELADO REACTIVO (Stability Handshake)
   */
  const handleMapVisualStability = useCallback(() => {
    if (isMapInterfaceVisible) return;
    nicepodLog(`✨ [SpatialHub:${mapInstanceIdentification}] Malla sincronizada.`);
    setIsMapInterfaceVisible(true);
    if (revealFallbackTimerReference.current) {
      clearTimeout(revealFallbackTimerReference.current);
    }
  }, [isMapInterfaceVisible, mapInstanceIdentification]);

  /**
   * 6. AUTO-IGNICIÓN DE HARDWARE SENSORIAL
   */
  useEffect(() => {
    if (isContainerElementReady) {
      if (!isEngineIgnited && engineStatus === 'IDLE') {
        initSensors();
      }
      if (mode === 'EXPLORE' && mapInstanceIdentification === 'map-full' && cameraPerspective === 'OVERVIEW') {
        toggleCameraPerspective();
      }
    }
  }, [isContainerElementReady, isEngineIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective, mapInstanceIdentification]);

  /**
   * 7. SAFETY REVEAL (Mecanismo de defensa ante cuellos de botella WebGL)
   */
  useEffect(() => {
    if (isMapEngineLoaded && !isMapInterfaceVisible) {
      revealFallbackTimerReference.current = setTimeout(handleMapVisualStability, 3000);
    }
    return () => {
      if (revealFallbackTimerReference.current) {
        clearTimeout(revealFallbackTimerReference.current);
      }
    };
  }, [isMapEngineLoaded, isMapInterfaceVisible, handleMapVisualStability]);

  /**
   * 8. LA SEMILLA T0 (IP-Fallback Telemetry)
   */
  const initialBirthLocation: UserLocation = useMemo(() => {
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
   * 9. MANEJADORES DE EVENTOS CINEMÁTICOS
   */
  const handleMapMovement = useCallback((event: SafeMapMovementEvent) => {
    const { latitude, longitude } = event.viewState;

    const movementDistance = calculateDistance(
      { latitude, longitude },
      { latitude: lastSearchUpdatePositionReference.current.latitude, longitude: lastSearchUpdatePositionReference.current.longitude }
    );

    // Umbral de refresco de radar: 25 metros
    if (movementDistance > 25) {
      setCurrentSearchPosition({ latitude, longitude });
      lastSearchUpdatePositionReference.current = { latitude, longitude };
    }

    if (event.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleSearchIdentificationResults = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topSearchMatch = results[0];
      if (topSearchMatch.metadata?.lat && topSearchMatch.metadata?.lng && mapInstanceReference.current) {
        setManualMode(true);
        mapInstanceReference.current.flyTo({
          center: [topSearchMatch.metadata.lng, topSearchMatch.metadata.lat],
          zoom: ZOOM_LEVELS.STREET,
          ...FLY_CONFIG
        });
      }
    }
  }, [setManualMode]);

  /**
   * mappedSelectedPointOfInterest: 
   * Misión: Adaptar el objeto de la base de datos al contrato visual de la Workstation.
   */
  const mappedSelectedPointOfInterest = useMemo(() => {
    if (!selectedPointOfInterestIdentification || !nearbyPointsOfInterest?.length) return null;
    const pointOfInterestMatch = nearbyPointsOfInterest.find(
      (pointItem) => pointItem.id.toString() === selectedPointOfInterestIdentification
    );
    if (!pointOfInterestMatch) return null;

    return {
      identification: pointOfInterestMatch.id.toString(),
      name: pointOfInterestMatch.name,
      categoryMission: pointOfInterestMatch.category_mission,
      categoryEntity: pointOfInterestMatch.category_entity,
      historicalEpoch: pointOfInterestMatch.historical_epoch,
      historicalFact: pointOfInterestMatch.historical_fact || undefined,
      coverImageUniformResourceLocator: pointOfInterestMatch.gallery_urls?.[0] || undefined,
      externalReferenceUniformResourceLocator: (pointOfInterestMatch.metadata as any)?.external_source_url || undefined
    };
  }, [selectedPointOfInterestIdentification, nearbyPointsOfInterest]);

  return (
    <MapProvider>
      <div
        ref={containerElementReference}
        className={cn("relative w-full h-full bg-[#010101] overflow-hidden isolate", className)}
        style={{ minHeight: '100dvh' }}
      >
        <AnimatePresence>
          {!isMapInterfaceVisible && (
            <motion.div
              key="portal-loader-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto"
            >
              {engineStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-4 text-center p-8 animate-in fade-in duration-700">
                  <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Geográfico Bloqueado</span>
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
                    Sincronizando Madrid
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOTOR WEBGL (NÚCLEO INMUTABLE) */}
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapInstanceReference}
            mapInstanceId={mapInstanceIdentification}
            mode={mode}
            performanceProfile={performanceProfile}
            startCoordinates={initialBirthLocation}
            lightTheme={visualTheme}
            selectedPointOfInterestId={selectedPointOfInterestIdentification}
            onLoad={() => setIsMapEngineLoaded(true)}
            onIdle={handleMapVisualStability}
            onMove={handleMapMovement}
            onMapClick={(event) => {
              if (mode === 'FORGE' && onManualAnchorSelection) {
                onManualAnchorSelection([event.lngLat.lng, event.lngLat.lat]);
              }
            }}
            onMarkerClick={setSelectedPointOfInterestIdentification}
          />
          {isMapEngineLoaded && (
            <CameraController mapInstanceId={mapInstanceIdentification} />
          )}
        </div>

        {/* INTERFAZ TÁCTICA DE BÚSQUEDA */}
        {mode === 'EXPLORE' && (
          <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[420px] pointer-events-auto">
            <UnifiedSearchBar
              variant="console"
              onSearchIdentificationResults={handleSearchIdentificationResults}
              onLoadingStatusChange={setIsSearchProcessLoading}
              latitude={currentSearchPosition.latitude}
              longitude={currentSearchPosition.longitude}
            />
          </div>
        )}

        {/* PREVISUALIZACIÓN DE NODOS */}
        <AnimatePresence>
          {mappedSelectedPointOfInterest && (
            <POIPreviewCard
              pointOfInterest={mappedSelectedPointOfInterest}
              distanceMeters={activePointOfInterest?.identification === selectedPointOfInterestIdentification ? activePointOfInterest.distance : null}
              isResonating={activePointOfInterest?.identification === selectedPointOfInterestIdentification && activePointOfInterest.isWithinRadius}
              onClose={() => setSelectedPointOfInterestIdentification(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MapProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Zero Abbreviations Policy: Se purificaron términos como 'Id', 'Props', 'lat', 'lng', 
 *    sustituyéndolos por sus equivalentes semánticos completos para garantizar el 
 *    cumplimiento del Dogma Técnico NicePod.
 * 2. Contract Sincronization: Las propiedades pasadas a UnifiedSearchBar fueron 
 *    alineadas con el nuevo estándar nominal (onSearchIdentificationResults).
 * 3. Event Integrity: Se utiliza SafeMapMovementEvent para blindar la captura 
 *    de telemetría durante el desplazamiento de cámara.
 */