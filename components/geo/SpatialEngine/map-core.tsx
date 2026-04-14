/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 20.0 (NicePod MapCore - Protocol Alignment & Event Hardening Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Reactor WebGL inmutable que gestiona la renderización de la malla 3D. 
 * Actúa como una terminal de visualización pasiva con aislamiento total de VRAM.
 * [REFORMA V20.0]: Resolución definitiva del error TS2339 (StyleData target). 
 * Se implementa el acceso directo vía referencia para la configuración del motor.
 * Inyección de la propiedad 'onMove' para sincronización con el Hub. 
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

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
 * Misión: Definir el contrato de entrada para el reactor visual.
 */
interface MapCoreProperties {
  mapInstanceIdentification: MapInstanceIdentification;
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile;
  startCoordinates: UserLocation;
  lightTheme: MapboxLightPreset;
  onLoad: (event: SafeMapLoadEvent) => void;
  onIdle: () => void;
  onMove?: (event: SafeMapMovementEvent) => void; // [SINCRO V20.0]: Propiedad inyectada.
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

  // 1. CONSUMO DEL MOTOR SOBERANO (TRIPLE-CORE SYNERGY V4.9)
  const {
    userLocation: truthStreamLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    cameraPerspective,
    mapStyle: activeEngineVisualStyle
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA AL LIENZO WebGL (PILAR 3)
  const localMapEngineReference = useRef<MapRef>(null);
  useImperativeHandle(componentForwardedReference, () => localMapEngineReference.current as MapRef, []);

  /**
   * 3. PROTOCOLO DE ANIQUILACIÓN FÍSICA (VRAM PURGE)
   */
  useEffect(() => {
    return () => {
      const currentMapEngineInstance = localMapEngineReference.current;
      if (currentMapEngineInstance) {
        try {
          const nativeMapInstance = currentMapEngineInstance.getMap();
          if (nativeMapInstance) {
            nicepodLog(`🧨 [MapCore:${mapInstanceIdentification}] Ejecutando purga de VRAM.`);
            nativeMapInstance.stop();
            nativeMapInstance.remove();
          }
        } catch (hardwareException) {
          nicepodLog(`⚠️ [MapCore] Error en purga física.`, hardwareException, 'warn');
        }
      }
    };
  }, [mapInstanceIdentification]);

  /**
   * 4. SEMILLA DE NACIMIENTO WebGL
   */
  const initialMapViewState = useMemo(() => {
    return getInitialViewState(
      startCoordinates.latitudeCoordinate,
      startCoordinates.longitudeCoordinate
    );
  }, [startCoordinates.latitudeCoordinate, startCoordinates.longitudeCoordinate]);

  /**
   * 5. STYLE-GUARD INDUSTRIAL (WebGL HYGIENE)
   * [FIX V20.0]: Uso de localMapEngineReference para evitar el error TS2339 de 'target'.
   */
  const handleStyleDataAction = useCallback((_styleDataEvent: SafeMapStyleDataEvent) => {
    const nativeMapInstance = localMapEngineReference.current?.getMap();
    if (!nativeMapInstance || !nativeMapInstance.isStyleLoaded()) {
      return;
    }

    const isForgeModeActive = mode === 'FORGE';
    const isOverviewPerspectiveActive = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspectiveActive = cameraPerspective === 'SATELLITE' || isForgeModeActive;
    const isTacticalLiteProfileActive = performanceProfile === 'TACTICAL_LITE';
    const engineTechnicalConfiguration = isTacticalLiteProfileActive ? TACTICAL_LITE_ENGINE_CONFIGURATION : STANDARD_ENGINE_CONFIGURATION;

    if (activeEngineVisualStyle === MAP_STYLES.STANDARD) {
      try {
        const mapboxInternalInstance = nativeMapInstance as any;
        if (mapboxInternalInstance.setConfigProperty) {
          mapboxInternalInstance.setConfigProperty('basemap', 'lightPreset', lightTheme);
          mapboxInternalInstance.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIGURATION.puckOcclusion);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPlaceLabels', (isOverviewPerspectiveActive || isForgeModeActive) && !isTacticalLiteProfileActive);
          mapboxInternalInstance.setConfigProperty('basemap', 'showRoadLabels', engineTechnicalConfiguration.showRoadLabels);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          mapboxInternalInstance.setConfigProperty('basemap', 'showTransitLabels', false);
        }
      } catch (hardwareException) {
        nicepodLog("⚠️ [MapCore] Style-Guard Exception.", hardwareException, 'warn');
      }
    }

    // Gestión de capas de edificios y relieve (DEM)
    try {
      if (nativeMapInstance.getLayer('building')) {
        const buildingOpacityValue = isTacticalLiteProfileActive ? 0.4 : (isSatellitePerspectiveActive ? 0 : 1.0);
        nativeMapInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityValue);
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
    } catch (hardwareException) { /* Ignored */ }

  }, [lightTheme, cameraPerspective, performanceProfile, mode, activeEngineVisualStyle]);

  /**
   * renderedMarkersCollection: 
   * [MTI]: Memorización de marcadores de sabiduría.
   */
  const renderedMarkersCollection = useMemo(() => {
    return nearbyPointsOfInterest.map((pointOfInterestEntry: PointOfInterest) => (
      <MapMarkerCustom
        key={pointOfInterestEntry.identification}
        identification={pointOfInterestEntry.identification.toString()}
        latitude={pointOfInterestEntry.geographicLocation.coordinates[1]}
        longitude={pointOfInterestEntry.geographicLocation.coordinates[0]}
        categoryMission={pointOfInterestEntry.categoryMission}
        categoryEntity={pointOfInterestEntry.categoryEntity}
        pointOfInterestName={pointOfInterestEntry.name}
        isResonating={!!(activePointOfInterest?.identification === pointOfInterestEntry.identification.toString() && activePointOfInterest?.isWithinRadius)}
        isSelected={selectedPointOfInterestIdentification === pointOfInterestEntry.identification.toString()}
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
      onMove={onMove} // [SINCRO V20.0]: Conexión del bus de movimiento.
      onStyleData={handleStyleDataAction}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={activeEngineVisualStyle || MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={mode === 'FORGE' || performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? null : (FOG_CONFIGURATION as any)}
      antialias={false}
      reuseMaps={false}
      maxPitch={mode === 'FORGE' ? 0 : 85}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/**
       * [MTI PROTOCOL]: 
       * El marcador del Voyager opera de forma autónoma mediante el Kinetic Signal Bus.
       */}
      {truthStreamLocation && (
        <UserLocationMarker
          initialLocation={truthStreamLocation}
          isResonating={!!activePointOfInterest?.isWithinRadius}
        />
      )}

      {/* Inyección de la Malla de Sabiduria */}
      {renderedMarkersCollection}
    </Map>
  );
});

MapCore.displayName = "MapCore";

export default memo(MapCore, (previousProperties, nextProperties) => {
  return (
    previousProperties.mapInstanceIdentification === nextProperties.mapInstanceIdentification &&
    previousProperties.performanceProfile === nextProperties.performanceProfile &&
    previousProperties.lightTheme === nextProperties.lightTheme &&
    previousProperties.mode === nextProperties.mode &&
    previousProperties.selectedPointOfInterestIdentification === nextProperties.selectedPointOfInterestIdentification &&
    previousProperties.startCoordinates.latitudeCoordinate === nextProperties.startCoordinates.latitudeCoordinate
  );
});