/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 16.0 (NicePod Spatial Hub - Nominal Fix & Utility Hardening Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el motor WebGL garantizando la sintonía entre los flujos 
 * de datos, la visibilidad reactiva y la integridad total de tipos. 
 * [REFORMA V16.0]: Resolución definitiva de errores TS2552 (Typo en onIdle) 
 * y TS2304 (Falta de importación de 'cn'). Sintonización absoluta de la 
 * Zero Abbreviations Policy (ZAP) en toda la lógica de orquestación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE MOTOR ESPACIAL ---
import { MapProps, MapProvider, MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.9 ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchRadarResult } from "@/hooks/use-search-radar";
import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
// [SINCRO V16.0]: Inyección de utilidades industriales para resolver TS2304.
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CONTRATOS SOBERANOS ---
import {
  FLY_CONFIGURATION,
  MADRID_SOL_COORDINATES,
  MapboxLightPreset,
  MapPerformanceProfile,
  ZOOM_LEVELS
} from "../map-constants";

import {
  MapInstanceIdentification,
  PointOfInterest,
  TelemetrySource,
  UserLocation
} from "@/types/geo-sovereignty";
import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: DEFINICIÓN DE TIPOS DE EVENTOS NOMINALES
 */
type SafeMapMovementEvent = Parameters<NonNullable<MapProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapProps['onClick']>>[0];

/**
 * INTERFAZ: GeographicPositionContract
 */
interface GeographicPositionContract {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
}

/**
 * INTERFAZ: SpatialEngineProperties
 */
interface SpatialEngineProperties {
  /** mapInstanceIdentification: Identificador único para el aislamiento de VRAM. */
  mapInstanceIdentification: MapInstanceIdentification;
  /** mode: EXPLORE (Descubrimiento) o FORGE (Creación). */
  mode: 'EXPLORE' | 'FORGE';
  /** visualTheme: 'day' para satelital, 'night' para terminal oscura. */
  visualTheme?: MapboxLightPreset;
  performanceProfile?: MapPerformanceProfile;
  /** onManualAnchorSelectionAction: Callback vital para el anclaje táctico del Step 1. */
  onManualAnchorSelectionAction?: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual de NicePod V4.9.
 */
export function SpatialEngine({
  mapInstanceIdentification,
  mode,
  visualTheme,
  performanceProfile = 'HIGH_FIDELITY',
  onManualAnchorSelectionAction,
  className
}: SpatialEngineProperties) {

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade Synergy V4.9)
  const {
    userLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    status: engineOperationalStatus,
    initSensors: initializeHardwareSensorsAction,
    isIgnited: isEngineIgnited,
    needsBallisticLanding,
    setManualMode,
    cameraPerspective,
    toggleCameraPerspective: toggleVisualPerspectiveAction
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL TÁCTICO (Zero Abbreviations Policy)
  const mapInstanceEngineReference = useRef<MapRef>(null);
  const containerElementReference = useRef<HTMLDivElement>(null);
  const lastSearchUpdatePositionReference = useRef<GeographicPositionContract>({
    latitudeCoordinate: 0,
    longitudeCoordinate: 0
  });
  const revealFallbackTimerReference = useRef<NodeJS.Timeout | null>(null);

  // 3. ESTADOS DE INTERFAZ DE ALTA DENSIDAD
  const [selectedPointOfInterestIdentification, setSelectedPointOfInterestIdentification] = useState<string | null>(null);
  const [isSearchProcessLoading, setIsSearchProcessLoading] = useState<boolean>(false);
  const [isContainerEnvironmentReady, setIsContainerEnvironmentReady] = useState<boolean>(false);
  const [isMapEngineLoaded, setIsMapEngineLoaded] = useState<boolean>(false);
  const [isMapInterfaceVisible, setIsMapInterfaceVisible] = useState<boolean>(false);
  const [showAuthorityPulseFeedback, setShowAuthorityPulseFeedback] = useState<boolean>(false);

  const [currentSearchGeographicPosition, setCurrentSearchGeographicPosition] = useState<GeographicPositionContract>({
    latitudeCoordinate: MADRID_SOL_COORDINATES.latitude,
    longitudeCoordinate: MADRID_SOL_COORDINATES.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE
   */
  useEffect(() => {
    if (!containerElementReference.current) return;

    const resizeObserverInstance = new ResizeObserver((entriesCollection) => {
      for (const entryItem of entriesCollection) {
        if (entryItem.contentRect.width > 0 && entryItem.contentRect.height > 0) {
          setIsContainerEnvironmentReady(true);
          resizeObserverInstance.disconnect();
        }
      }
    });

    resizeObserverInstance.observe(containerElementReference.current);
    return () => resizeObserverInstance.disconnect();
  }, []);

  /**
   * 5. PROTOCOLO DE REVELADO REACTIVO
   */
  const handleMapVisualStabilityAction = useCallback(() => {
    if (isMapInterfaceVisible) return;
    nicepodLog(`✨ [SpatialHub:${mapInstanceIdentification}] Malla sincronizada.`);
    setIsMapInterfaceVisible(true);
    if (revealFallbackTimerReference.current) {
      clearTimeout(revealFallbackTimerReference.current);
    }
  }, [isMapInterfaceVisible, mapInstanceIdentification]);

  /**
   * 6. AUTO-IGNICIÓN Y PERSPECTIVA DE EXPLORACIÓN
   */
  useEffect(() => {
    if (isContainerEnvironmentReady) {
      if (!isEngineIgnited && engineOperationalStatus === 'IDLE') {
        initializeHardwareSensorsAction();
      }
      if (mode === 'EXPLORE' && mapInstanceIdentification === 'map-full' && cameraPerspective === 'OVERVIEW') {
        toggleVisualPerspectiveAction();
      }
    }
  }, [isContainerEnvironmentReady, isEngineIgnited, engineOperationalStatus, initializeHardwareSensorsAction, mode, cameraPerspective, toggleVisualPerspectiveAction, mapInstanceIdentification]);

  /**
   * 7. LA SEMILLA T0 (IP-Fallback Telemetry)
   */
  const initialBirthLocation: UserLocation = useMemo(() => {
    if (userLocation) return userLocation;

    return {
      latitudeCoordinate: MADRID_SOL_COORDINATES.latitude,
      longitudeCoordinate: MADRID_SOL_COORDINATES.longitude,
      accuracyMeters: 9999,
      headingDegrees: null,
      speedMetersPerSecond: null,
      timestamp: Date.now(),
      geographicSource: 'internet-protocol-fallback' as TelemetrySource
    };
  }, [userLocation]);

  /**
   * 8. GOBERNANZA DE ESTILO DE MAPA (FORGE SAT ENFORCEMENT)
   */
  const effectiveVisualTheme = mode === 'FORGE' ? 'day' : (visualTheme || 'night');

  /**
   * 9. ADUANA DE BÚSQUEDA (NOMINAL TRANSMUTATION)
   */
  const transmuteSearchToIndustrialCoordinates = useCallback((searchResultEntry: SearchRadarResult): GeographicPositionContract | null => {
    if (searchResultEntry.intellectualMetadata?.latitudeCoordinate && searchResultEntry.intellectualMetadata?.longitudeCoordinate) {
      return {
        latitudeCoordinate: Number(searchResultEntry.intellectualMetadata.latitudeCoordinate),
        longitudeCoordinate: Number(searchResultEntry.intellectualMetadata.longitudeCoordinate)
      };
    }
    return null;
  }, []);

  /**
   * 10. MANEJADORES DE EVENTOS CINEMÁTICOS
   */
  const handleMapMovementAction = useCallback((movementEvent: SafeMapMovementEvent) => {
    const { latitude: currentLatitudeCoordinate, longitude: currentLongitudeCoordinate } = movementEvent.viewState;

    const movementDistanceMagnitude = calculateDistanceBetweenPoints(
      { latitude: currentLatitudeCoordinate, longitude: currentLongitudeCoordinate },
      {
        latitude: lastSearchUpdatePositionReference.current.latitudeCoordinate,
        longitude: lastSearchUpdatePositionReference.current.longitudeCoordinate
      }
    );

    if (movementDistanceMagnitude > 25) {
      setCurrentSearchGeographicPosition({
        latitudeCoordinate: currentLatitudeCoordinate,
        longitudeCoordinate: currentLongitudeCoordinate
      });
      lastSearchUpdatePositionReference.current = {
        latitudeCoordinate: currentLatitudeCoordinate,
        longitudeCoordinate: currentLongitudeCoordinate
      };
    }

    const isHumanInteractionActive = "originalEvent" in movementEvent && !!movementEvent.originalEvent;

    if (isHumanInteractionActive && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleSearchIdentificationResultsAction = useCallback((resultsCollection: SearchRadarResult[] | null) => {
    if (resultsCollection && resultsCollection.length > 0 && mapInstanceEngineReference.current) {
      const topSearchMatchEntry = resultsCollection[0];
      const industrialCoordinates = transmuteSearchToIndustrialCoordinates(topSearchMatchEntry);

      if (industrialCoordinates) {
        setManualMode(true);
        mapInstanceEngineReference.current.flyTo({
          center: [industrialCoordinates.longitudeCoordinate, industrialCoordinates.latitudeCoordinate],
          zoom: ZOOM_LEVELS.STREET,
          ...FLY_CONFIGURATION
        });
      }
    }
  }, [setManualMode, transmuteSearchToIndustrialCoordinates]);

  /**
   * mappedSelectedPointOfInterest: 
   * Misión: Adaptar el objeto de la Bóveda al contrato visual de previsualización.
   */
  const mappedSelectedPointOfInterest = useMemo(() => {
    if (!selectedPointOfInterestIdentification || !nearbyPointsOfInterest?.length) {
      return null;
    }

    const pointOfInterestMatch = nearbyPointsOfInterest.find(
      (pointOfInterestEntry: PointOfInterest) => pointOfInterestEntry.identification.toString() === selectedPointOfInterestIdentification
    );

    if (!pointOfInterestMatch) return null;

    return {
      identification: pointOfInterestMatch.identification.toString(),
      name: pointOfInterestMatch.name,
      categoryMission: pointOfInterestMatch.categoryMission,
      categoryEntity: pointOfInterestMatch.categoryEntity,
      historicalEpoch: pointOfInterestMatch.historicalEpoch,
      historicalFact: pointOfInterestMatch.historicalFact || undefined,
      coverImageUniformResourceLocator: pointOfInterestMatch.galleryUniformResourceLocatorsCollection?.[0] || undefined,
      externalReferenceUniformResourceLocator: pointOfInterestMatch.metadata?.externalSourceUniformResourceLocator || undefined
    };
  }, [selectedPointOfInterestIdentification, nearbyPointsOfInterest]);

  return (
    <MapProvider>
      <div
        ref={containerElementReference}
        className={cn(
          "relative w-full h-full bg-[#010101] overflow-hidden isolate",
          "flex items-center justify-center",
          className
        )}
        style={{ minHeight: '100%' }}
      >
        {/* I. CARGADOR SÍNCRONO */}
        <AnimatePresence>
          {!isMapInterfaceVisible && (
            <motion.div
              key="portal-loader-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto"
            >
              {engineOperationalStatus === 'PERMISSION_DENIED' ? (
                <div className="flex flex-col items-center gap-6 text-center p-8 animate-in fade-in duration-700">
                  <ShieldAlert className="h-16 w-16 text-red-500 mb-2" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Geográfico Bloqueado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-10">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                    />
                    <Compass className="h-20 w-20 text-primary animate-spin-slow relative z-10" />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white animate-pulse italic font-serif">
                    Sincronizando Madrid
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* II. FEEDBACK DE AUTORIDAD (PULSO TÁCTICO) */}
        <AnimatePresence>
          {showAuthorityPulseFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              onAnimationComplete={() => setShowAuthorityPulseFeedback(false)}
              className="absolute inset-0 z-[150] pointer-events-none flex items-center justify-center bg-primary/5 backdrop-blur-[2px]"
            >
              <div className="flex flex-col items-center gap-4">
                <Target size={48} className="text-primary animate-ping" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">Punto de Anclaje Fijado</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* III. MOTOR WebGL (REACTOR VISUAL SOBERANO) */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <MapCore
            ref={mapInstanceEngineReference}
            mapInstanceIdentification={mapInstanceIdentification}
            mode={mode}
            performanceProfile={performanceProfile}
            startCoordinates={initialBirthLocation}
            lightTheme={effectiveVisualTheme as MapboxLightPreset}
            selectedPointOfInterestIdentification={selectedPointOfInterestIdentification}
            onLoad={() => setIsMapEngineLoaded(true)}
            // [FIX V16.0]: Corregido typo nominal para resolver TS2552.
            onIdle={handleMapVisualStabilityAction}
            onMove={handleMapMovementAction}
            onMapClick={(geographicEvent: SafeMapClickEvent) => {
              if (mode === 'FORGE' && onManualAnchorSelectionAction) {
                onManualAnchorSelectionAction(geographicEvent.lngLat.lng, geographicEvent.lngLat.lat);
                setShowAuthorityPulseFeedback(true);
              }
            }}
            onMarkerClick={setSelectedPointOfInterestIdentification}
          />
          {isMapEngineLoaded && (
            <CameraController mapInstanceIdentification={mapInstanceIdentification} />
          )}
        </div>

        {/* IV. INTERFAZ TÁCTICA DE BÚSQUEDA */}
        {mode === 'EXPLORE' && (
          <div className="absolute top-8 left-6 right-6 z-[100] md:top-10 md:left-10 md:w-[450px] pointer-events-auto">
            <UnifiedSearchBar
              variantType="console"
              onSearchIdentificationResults={handleSearchIdentificationResultsAction}
              onLoadingStatusChange={setIsSearchProcessLoading}
              latitudeCoordinate={currentSearchGeographicPosition.latitudeCoordinate}
              longitudeCoordinate={currentSearchGeographicPosition.longitudeCoordinate}
            />
          </div>
        )}

        {/* V. PREVISUALIZACIÓN DE NODOS (POIs) */}
        <AnimatePresence>
          {mappedSelectedPointOfInterest && (
            <POIPreviewCard
              pointOfInterest={mappedSelectedPointOfInterest}
              distanceMeters={activePointOfInterest?.identification === selectedPointOfInterestIdentification ? activePointOfInterest.distanceMeters : null}
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
 * NOTA TÉCNICA DEL ARCHITECT (V16.0):
 * 1. Build Shield Compliance: Se integró la importación de 'cn' y se corrigió el 
 *    error tipográfico 'handleMapMapVisualStabilityAction' en la propiedad onIdle.
 * 2. Event Integrity: Se implementó la verificación de propiedad segura para detectar 
 *    gestos humanos en eventos de movimiento WebGL.
 * 3. ZAP Enforcement: Purificación nominal completa. No se permiten nombres como 
 *    'results', 'ev', 'pos' o 'ctx'. El código es autodescriptivo.
 */