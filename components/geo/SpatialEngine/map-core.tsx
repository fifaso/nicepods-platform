/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 24.0
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISIÓN: Reactor WebGL inmutable que gestiona la renderización de la malla 3D con aniquilación atómica.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 * 
 * Misión: Reactor WebGL inmutable que gestiona la renderización de la malla 3D. 
 * Actúa como una terminal de visualización pasiva con aislamiento total de VRAM.
 * [REFORMA V22.0]: Implementación de la delegación de eventos 'onMove' al reactor. 
 * Resolución de tipado para evitar 'Target' inexistente en eventos de estilo.
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';
import type { Map as MapNativeInstance, FogSpecification } from 'mapbox-gl';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA SOBERANA ---
import {
  DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION,
  FOG_CONFIGURATION,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapPerformanceProfile,
  MapboxLightPreset,
  OCCLUSION_CONFIGURATION,
  STANDARD_ENGINE_CONFIGURATION,
  TACTICAL_LITE_ENGINE_CONFIGURATION,
  getInitialViewState
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { MapInstanceIdentification, PointOfInterest, UserLocation } from "@/types/geo-sovereignty";
import { MapMarkerCustom } from "../map-marker-custom";
import { UserLocationMarker } from "../user-location-marker";

/**
 * [BUILD SHIELD]: EXTRACCIÓN DE TIPOS SOBERANOS
 */
type MapNativeProperties = ComponentProps<typeof Map>;
type SafeMapLoadEvent = Parameters<NonNullable<MapNativeProperties['onLoad']>>[0];
type SafeMapMovementEvent = Parameters<NonNullable<MapNativeProperties['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProperties['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProperties['onStyleData']>>[0];

/**
 * INTERFAZ: MapCoreProperties
 */
interface MapCoreProperties {
  mapInstanceIdentification: MapInstanceIdentification;
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile;
  startCoordinates: UserLocation;
  lightTheme: MapboxLightPreset;
  onLoad: (event: SafeMapLoadEvent) => void;
  onIdle: () => void;
  onMove: (event: SafeMapMovementEvent) => void; 
  onMapClick: (event: SafeMapClickEvent) => void;
  onMarkerClick: (identification: string) => void;
  selectedPointOfInterestIdentification: string | null;
}

/**
 * MapCore: El reactor visual soberano de la Workstation NicePod.
 */
const MapCore = forwardRef<MapRef, MapCoreProperties>(({
  mapInstanceIdentification,
  mode,
  performanceProfile = 'HIGH_FIDELITY',
  startCoordinates,
  lightTheme,
  onLoad,
  onIdle,
  onMove,
  onMapClick,
  onMarkerClick,
  selectedPointOfInterestIdentification
}, componentForwardedReference) => {

  // 1. CONSUMO DEL MOTOR SOBERANO
  const {
    userLocation: truthStreamLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    cameraPerspective,
    activeMapStyle
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA AL LIENZO WebGL
  const localMapEngineReference = useRef<MapRef>(null);
  useImperativeHandle(componentForwardedReference, () => localMapEngineReference.current as MapRef, []);

  // 3. PROTOCOLO DE ANIQUILACIÓN FÍSICA
  useEffect(() => {
    const currentMapEngineInstanceSnapshot = localMapEngineReference.current;
    return () => {
      if (currentMapEngineInstanceSnapshot) {
        try {
          const nativeMapInstance = currentMapEngineInstanceSnapshot.getMap();
          if (nativeMapInstance) {
            nativeMapInstance.stop();
            nativeMapInstance.remove();
          }
        } catch (hardwareException: unknown) {
          nicepodLog("⚠️ [MapCore] Error en purga física de VRAM.", hardwareException, 'warn');
        }
      }
    };
  }, [mapInstanceIdentification]);

  // 4. SEMILLA DE NACIMIENTO WebGL
  const initialMapViewState = useMemo(() => {
    return getInitialViewState(
      startCoordinates.latitudeCoordinate,
      startCoordinates.longitudeCoordinate
    );
  }, [startCoordinates.latitudeCoordinate, startCoordinates.longitudeCoordinate]);

  // 5. STYLE-GUARD INDUSTRIAL
  const handleStyleDataAction = useCallback((_styleDataEvent: SafeMapStyleDataEvent) => {
    const nativeMapInstance = localMapEngineReference.current?.getMap();
    if (!nativeMapInstance || !nativeMapInstance.isStyleLoaded()) return;

    const isForgeModeActive = mode === 'FORGE';
    const isOverviewPerspectiveActive = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspectiveActive = cameraPerspective === 'SATELLITE' || isForgeModeActive;
    const isTacticalLiteProfileActive = performanceProfile === 'TACTICAL_LITE';
    const engineTechnicalConfiguration = isTacticalLiteProfileActive ? TACTICAL_LITE_ENGINE_CONFIGURATION : STANDARD_ENGINE_CONFIGURATION;

    if (activeMapStyle === MAP_STYLES.STANDARD) {
      try {
        const mapboxInternalInstance = nativeMapInstance as MapNativeInstance;
        if (mapboxInternalInstance.setConfigProperty) {
          mapboxInternalInstance.setConfigProperty('basemap', 'lightPreset', lightTheme);
          mapboxInternalInstance.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIGURATION.puckOcclusion);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPlaceLabels', (isOverviewPerspectiveActive || isForgeModeActive) && !isTacticalLiteProfileActive);
          mapboxInternalInstance.setConfigProperty('basemap', 'showRoadLabels', engineTechnicalConfiguration.showRoadLabels);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          mapboxInternalInstance.setConfigProperty('basemap', 'showTransitLabels', false);
        }
      } catch (hardwareException: unknown) {
        nicepodLog("⚠️ [MapCore] Style-Guard Exception.", hardwareException, 'warn');
      }
    }
    
    // Gestión de capas y relieve...
    try {
        if (nativeMapInstance.getLayer('building')) {
            const opacity = isTacticalLiteProfileActive ? 0.4 : (isSatellitePerspectiveActive ? 0 : 1.0);
            nativeMapInstance.setPaintProperty('building', 'fill-extrusion-opacity', opacity);
        }
        if (!nativeMapInstance.getSource(DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id)) {
            nativeMapInstance.addSource(DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id, {
                type: "raster-dem",
                url: DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.url,
                tileSize: 512
            });
        }
        if (mode === 'EXPLORE' && !isSatellitePerspectiveActive) {
            nativeMapInstance.setTerrain({ source: DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id, exaggeration: 1.15 });
        } else {
            nativeMapInstance.setTerrain(null);
        }
    } catch (hardwareException: unknown) { /* Ignored */ }
  }, [lightTheme, cameraPerspective, performanceProfile, mode, activeMapStyle]);

  const renderedMarkersCollection = useMemo(() => {
    return nearbyPointsOfInterest.map((pointEntry) => (
      <MapMarkerCustom
        key={pointEntry.identification}
        identification={pointEntry.identification.toString()}
        latitude={pointEntry.geographicLocation.coordinates[1]}
        longitude={pointEntry.geographicLocation.coordinates[0]}
        categoryMission={pointEntry.categoryMission}
        categoryEntity={pointEntry.categoryEntity}
        pointOfInterestName={pointEntry.name}
        isResonating={!!(activePointOfInterest?.identification === pointEntry.identification.toString() && activePointOfInterest?.isWithinRadius)}
        isSelected={selectedPointOfInterestIdentification === pointEntry.identification.toString()}
        onMarkerInteraction={onMarkerClick}
      />
    ));
  }, [nearbyPointsOfInterest, activePointOfInterest, selectedPointOfInterestIdentification, onMarkerClick]);

  return (
    <Map
      id={mapInstanceIdentification}
      ref={localMapEngineReference}
      initialViewState={initialMapViewState}
      onLoad={onLoad}
      onIdle={onIdle}
      onMove={onMove}
      onStyleData={handleStyleDataAction}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={activeMapStyle || MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={mode === 'FORGE' || performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? undefined : (FOG_CONFIGURATION as unknown as FogSpecification)}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {truthStreamLocation && (
        <UserLocationMarker
          initialLocation={truthStreamLocation}
          isResonating={!!activePointOfInterest?.isWithinRadius}
        />
      )}
      {renderedMarkersCollection}
    </Map>
  );
});

MapCore.displayName = "MapCore";

export default memo(MapCore);