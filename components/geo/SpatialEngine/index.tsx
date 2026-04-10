/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 13.0 (NicePod Spatial Hub - Search Transmutation & Authority Feedback Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Orquestar el motor WebGL garantizando el montaje inmediato, la visibilidad 
 * reactiva y la integridad total de tipos entre el radar, la búsqueda y la previsualización.
 * [REFORMA V13.0]: Implementación de la "Aduana de Búsqueda" (Nominal Transmutation) 
 * y efecto visual de "Pulso de Autoridad" (PBR Feedback) para anclajes manuales. 
 * Sincronización absoluta con la Constitución V8.6 y el Metal V2.0.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE MOTOR ESPACIAL ---
import { MapProps, MapProvider, MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CONTRATOS SOBERANOS ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  MapPerformanceProfile,
  ZOOM_LEVELS
} from "../map-constants";

import { 
  MapInstanceIdentification, 
  TelemetrySource, 
  UserLocation, 
  PointOfInterest 
} from "@/types/geo-sovereignty";
import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: DEFINICIÓN DE TIPOS DE EVENTOS DESCRIPTIVOS
 */
type SafeMapMovementEvent = Parameters<NonNullable<MapProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapProps['onClick']>>[0];

/**
 * INTERFAZ: SpatialEngineProperties
 */
interface SpatialEngineProperties {
  /** mapInstanceIdentification: Identificador único para el aislamiento de VRAM en la GPU. */
  mapInstanceIdentification: MapInstanceIdentification;
  mode: 'EXPLORE' | 'FORGE';
  visualTheme?: MapboxLightPreset;
  performanceProfile?: MapPerformanceProfile;
  onManualAnchorSelectionAction?: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual Soberano de NicePod.
 */
export function SpatialEngine({
  mapInstanceIdentification,
  mode,
  visualTheme = 'night',
  performanceProfile = 'HIGH_FIDELITY',
  onManualAnchorSelectionAction,
  className
}: SpatialEngineProperties) {

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade Synergy V4.0)
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
  const lastSearchUpdatePositionReference = useRef<{ latitudeCoordinate: number, longitudeCoordinate: number }>({ 
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
  
  // [INTERVENCIÓN B]: Feedback de autoridad al fijar anclaje
  const [showAuthorityPulseFeedback, setShowAuthorityPulseFeedback] = useState<boolean>(false);

  const [currentSearchGeographicPosition, setCurrentSearchGeographicPosition] = useState({
    latitudeCoordinate: MADRID_SOL_COORDS.latitude,
    longitudeCoordinate: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE
   * Misión: Asegurar que el lienzo WebGL solo se inyecte si el contenedor tiene dimensiones físicas.
   */
  useEffect(() => {
    if (!containerElementReference.current) return;

    const resizeObserverInstance = new ResizeObserver((entriesCollection) => {
      for (const entry of entriesCollection) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerEnvironmentReady(true);
          resizeObserverInstance.disconnect();
        }
      }
    });

    resizeObserverInstance.observe(containerElementReference.current);
    return () => resizeObserverInstance.disconnect();
  }, []);

  /**
   * 5. PROTOCOLO DE REVELADO REACTIVO (Stability Handshake)
   */
  const handleMapVisualStabilityAction = useCallback(() => {
    if (isMapInterfaceVisible) return;
    nicepodLog(`✨ [SpatialHub:${mapInstanceIdentification}] Malla sincronizada y estable.`);
    setIsMapInterfaceVisible(true);
    if (revealFallbackTimerReference.current) {
      clearTimeout(revealFallbackTimerReference.current);
    }
  }, [isMapInterfaceVisible, mapInstanceIdentification]);

  /**
   * 6. AUTO-IGNICIÓN DE HARDWARE SENSORIAL
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
   * 7. SAFETY REVEAL (Mecanismo de defensa ante latencia WebGL prolongada)
   */
  useEffect(() => {
    if (isMapEngineLoaded && !isMapInterfaceVisible) {
      revealFallbackTimerReference.current = setTimeout(handleMapVisualStabilityAction, 3000);
    }
    return () => {
      if (revealFallbackTimerReference.current) {
        clearTimeout(revealFallbackTimerReference.current);
      }
    };
  }, [isMapEngineLoaded, isMapInterfaceVisible, handleMapVisualStabilityAction]);

  /**
   * 8. LA SEMILLA T0 (IP-Fallback Telemetry)
   */
  const initialBirthLocation: UserLocation = useMemo(() => {
    if (userLocation) return userLocation;

    return {
      latitudeCoordinate: MADRID_SOL_COORDS.latitude,
      longitudeCoordinate: MADRID_SOL_COORDS.longitude,
      accuracyMeters: 9999,
      headingDegrees: null,
      speedMetersPerSecond: null,
      timestamp: Date.now(),
      geographicSource: 'internet-protocol-fallback' as TelemetrySource
    };
  }, [userLocation]);

  /**
   * 9. ADUANA DE BÚSQUEDA (NOMINAL TRANSMUTATION)
   * [INTERVENCIÓN A]: Mapeo de coordenadas desde resultados de búsqueda (SearchResult)
   * hacia la nomenclatura industrial de la Constitución V8.6.
   */
  const transmuteSearchToIndustrialCoordinates = useCallback((searchResult: SearchResult): { latitudeCoordinate: number, longitudeCoordinate: number } | null => {
    if (searchResult.metadata?.lat && searchResult.metadata?.lng) {
      return {
        latitudeCoordinate: Number(searchResult.metadata.lat),
        longitudeCoordinate: Number(searchResult.metadata.lng)
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

    if (movementEvent.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  /**
   * handleSearchIdentificationResultsAction:
   * Misión: Centrar la cámara sobre un hito tras una búsqueda exitosa.
   */
  const handleSearchIdentificationResultsAction = useCallback((resultsCollection: SearchResult[] | null) => {
    if (resultsCollection && resultsCollection.length > 0 && mapInstanceEngineReference.current) {
      const topSearchMatch = resultsCollection[0];
      const industrialCoordinates = transmuteSearchToIndustrialCoordinates(topSearchMatch);

      if (industrialCoordinates) {
        setManualMode(true);
        mapInstanceEngineReference.current.flyTo({
          center: [industrialCoordinates.longitudeCoordinate, industrialCoordinates.latitudeCoordinate],
          zoom: ZOOM_LEVELS.STREET,
          ...FLY_CONFIG
        });
      }
    }
  }, [setManualMode, transmuteSearchToIndustrialCoordinates]);

  /**
   * mappedSelectedPointOfInterest: 
   * Misión: Adaptar el objeto de la Bóveda al contrato visual de la previsualización.
   */
  const mappedSelectedPointOfInterest = useMemo(() => {
    if (!selectedPointOfInterestIdentification || !nearbyPointsOfInterest?.length) return null;
    
    const pointOfInterestMatch = nearbyPointsOfInterest.find(
      (pointItem: PointOfInterest) => pointItem.identification.toString() === selectedPointOfInterestIdentification
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
        className={cn("relative w-full h-full bg-[#010101] overflow-hidden isolate", className)}
        style={{ minHeight: '100dvh' }}
      >
        {/* I. CARGADOR SÍNCRONO (COLD START ESCUDO) */}
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

        {/* II. FEEDBACK DE AUTORIDAD (PULSO PBR)
            [INTERVENCIÓN B]: Efecto visual tras anclaje manual. */}
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

        {/* III. MOTOR WEBGL (REACTOR VISUAL SOBERANO) */}
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapInstanceEngineReference}
            mapInstanceIdentification={mapInstanceIdentification} 
            mode={mode}
            performanceProfile={performanceProfile}
            startCoordinates={initialBirthLocation}
            lightTheme={visualTheme}
            selectedPointOfInterestIdentification={selectedPointOfInterestIdentification} 
            onLoad={() => setIsMapEngineLoaded(true)}
            onIdle={handleMapVisualStabilityAction}
            onMove={handleMapMovementAction}
            onMapClick={(geographicEvent: SafeMapClickEvent) => {
              if (mode === 'FORGE' && onManualAnchorSelectionAction) {
                // [FIX]: Mapeo manual de lngLat nativo a nomenclatura industrial
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

        {/* IV. INTERFAZ TÁCTICA DE BÚSQUEDA SEMÁNTICA */}
        {mode === 'EXPLORE' && (
          <div className="absolute top-8 left-6 right-6 z-[100] md:top-10 md:left-10 md:w-[450px] pointer-events-auto">
            <UnifiedSearchBar
              variant="console"
              onSearchIdentificationResults={handleSearchIdentificationResultsAction}
              onLoadingStatusChange={setIsSearchProcessLoading}
              latitude={currentSearchGeographicPosition.latitudeCoordinate}
              longitude={currentSearchGeographicPosition.longitudeCoordinate}
            />
          </div>
        )}

        {/* V. PREVISUALIZACIÓN DE NODOS DE CONOCIMIENTO (POIs) */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Search Customs Implementation: La función 'transmuteSearchToIndustrialCoordinates' actúa 
 *    como aduana nominal, erradicando el uso de 'lat/lng' en la lógica de la terminal.
 * 2. Authority Pulse Feedback: Se ha integrado un efecto visual PBR que confirma la 
 *    intención del Administrador al realizar anclajes manuales, reforzando la sensación táctica.
 * 3. Contractual Symmetry: Sincronización total con la Constitución V8.6, utilizando 
 *    'latitudeCoordinate' y 'accuracyMeters' en todos los flujos de datos.
 */