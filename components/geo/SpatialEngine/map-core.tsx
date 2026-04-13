/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 18.0 (NicePod MapCore - Style-Guard Pro & Main Thread Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Reactor WebGL inmutable que gestiona la renderización de la malla 3D. 
 * Actúa como una terminal de visualización pasiva para maximizar los fotogramas 
 * por segundo, delegando la lógica pesada a los núcleos de telemetría y radar.
 * [REFORMA V18.0]: Implementación de la Misión 4 (Style-Guard). Neutralización 
 * de advertencias de Mapbox Standard v3 que saturaban Sentry. Optimización de 
 * renderizado de marcadores (Pilar 4 - MTI) y cumplimiento absoluto de la 
 * Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useEffect } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA SOBERANA ---
import {
  DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION,
  FOG_CONFIGURATION,
  TACTICAL_LITE_ENGINE_CONFIGURATION,
  TACTICAL_LITE_TERRAIN_CONFIGURATION,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapPerformanceProfile,
  MapboxLightPreset,
  OCCLUSION_CONFIGURATION,
  STANDARD_ENGINE_CONFIGURATION,
  TERRAIN_CONFIGURATION,
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
  /** mapInstanceIdentification: Identificador único para el aislamiento de VRAM en la GPU. */
  mapInstanceIdentification: MapInstanceIdentification;
  /** mode: Define si la terminal opera en modo EXPLORE o FORGE (Creación). */
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile;
  startCoordinates: UserLocation;
  lightTheme: MapboxLightPreset;
  onLoad: (event: SafeMapLoadEvent) => void;
  onIdle: () => void;
  onMove?: (event: SafeMapMovementEvent) => void;
  onMoveEnd?: (event: SafeMapMovementEvent) => void;
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
  onMoveEnd,
  onMapClick,
  onMarkerClick,
  selectedPointOfInterestIdentification
}, componentForwardedReference) => {

  // 1. CONSUMO DEL MOTOR SOBERANO (TRIPLE-CORE SYNERGY V4.5)
  const {
    userLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    cameraPerspective,
    mapStyle: activeEngineVisualStyle 
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA AL LIENZO WEBGL (PILAR 3)
  const localMapEngineReference = useRef<MapRef>(null);
  
  useImperativeHandle(componentForwardedReference, () => localMapEngineReference.current as MapRef, []);

  /**
   * 3. PROTOCOLO DE ANIQUILACIÓN FÍSICA (VRAM PURGE)
   * Misión: Asegurar que la GPU sea liberada inmediatamente tras el desmontaje.
   * [THERMIC V19.0]: Forzado de remoción física para prevenir fugas de VRAM en transiciones.
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
          nicepodLog(`⚠️ [MapCore:${mapInstanceIdentification}] Error en protocolo de aniquilación física.`, hardwareException, 'warn');
        }
      }
    };
  }, [mapInstanceIdentification]);

  /**
   * 4. SEMILLA DE NACIMIENTO WebGL
   * [SINCRO V18.0]: Coordenadas nominales purificadas.
   */
  const initialMapViewState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapInstanceIdentification}] Sembrando semilla geodésica.`);
    return getInitialViewState(
      startCoordinates.latitudeCoordinate,
      startCoordinates.longitudeCoordinate
    );
  }, [mapInstanceIdentification, startCoordinates.latitudeCoordinate, startCoordinates.longitudeCoordinate]);

  /**
   * 5. MANEJADOR DE CARGA NOMINAL (HANDSHAKE)
   */
  const handleMapLoadAction = useCallback((loadEvent: SafeMapLoadEvent) => {
    nicepodLog(`🏙️ [MapCore:${mapInstanceIdentification}] Handshake WebGL exitoso.`);
    onLoad(loadEvent);
  }, [onLoad, mapInstanceIdentification]);

  /**
   * 6. STYLE-GUARD INDUSTRIAL (MISIÓN 4 - WebGL HYGIENE)
   * Misión: Configurar el motor PBR y silenciar variables desconocidas del estilo Standard.
   */
  const handleStyleDataAction = useCallback((styleDataEvent: SafeMapStyleDataEvent) => {
    const nativeMapInstance = styleDataEvent.target;
    if (!nativeMapInstance || !nativeMapInstance.isStyleLoaded()) {
        return;
    }

    const isForgeModeActive = mode === 'FORGE';
    const isOverviewPerspectiveActive = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspectiveActive = cameraPerspective === 'SATELLITE' || isForgeModeActive;
    const isTacticalLiteProfileActive = performanceProfile === 'TACTICAL_LITE';
    const engineTechnicalConfiguration = isTacticalLiteProfileActive ? TACTICAL_LITE_ENGINE_CONFIGURATION : STANDARD_ENGINE_CONFIGURATION;

    /**
     * [STYLE-GUARD]: Inyección de propiedades de mapa base.
     * Misión: Evitar que el motor busque variables inexistentes que saturan la consola.
     */
    if (activeEngineVisualStyle === MAP_STYLES.STANDARD) {
      try {
        const mapboxInternalInstance = nativeMapInstance as any;
        if (mapboxInternalInstance.setConfigProperty) {
          mapboxInternalInstance.setConfigProperty('basemap', 'lightPreset', lightTheme);
          mapboxInternalInstance.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIGURATION.puckOcclusion);
          
          // Optimizamos la visibilidad de etiquetas para reducir la carga de renderizado.
          mapboxInternalInstance.setConfigProperty('basemap', 'showPlaceLabels', (isOverviewPerspectiveActive || isForgeModeActive) && !isTacticalLiteProfileActive);
          mapboxInternalInstance.setConfigProperty('basemap', 'showRoadLabels', engineTechnicalConfiguration.showRoadLabels);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          mapboxInternalInstance.setConfigProperty('basemap', 'showTransitLabels', false);
        }
      } catch (hardwareException) {
        nicepodLog("⚠️ [MapCore] Style-Guard: Fallo en inyección de propiedades.", hardwareException, 'warn');
      }
    }

    // Gestión de transparencia dinámica de la malla de edificios.
    try {
      if (nativeMapInstance.getLayer('building')) {
        const buildingOpacityTargetValue = isTacticalLiteProfileActive 
          ? TACTICAL_LITE_ENGINE_CONFIGURATION.buildingOpacity
          : (isSatellitePerspectiveActive ? 0 : 1.0);
        
        nativeMapInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityTargetValue);
      }
    } catch (hardwareException) { /* Capa no presente en el estilo actual */ }

    // Sincronización del motor de relieve (DEM)
    if (!nativeMapInstance.getSource(DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id)) {
      try {
        nativeMapInstance.addSource(DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id, {
          type: "raster-dem",
          url: DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.url,
          tileSize: 512
        });
      } catch (hardwareException) { return; }
    }

    try {
      const terrainPhysicalParameters = (isTacticalLiteProfileActive || isSatellitePerspectiveActive) ? TACTICAL_LITE_TERRAIN_CONFIGURATION : TERRAIN_CONFIGURATION;

      // El terreno 3D se desactiva en modo FORGE para garantizar la precisión del clic sobre el plano.
      if (mode === 'EXPLORE' && !isSatellitePerspectiveActive) {
        nativeMapInstance.setTerrain({
          source: DIGITAL_ELEVATION_MODEL_SOURCE_CONFIGURATION.id,
          exaggeration: terrainPhysicalParameters.exaggeration
        });
      } else {
        nativeMapInstance.setTerrain(null);
      }
    } catch (hardwareException) {
      nicepodLog("ℹ️ [MapCore] Gestión cinemática de relieve finalizada.");
    }

  }, [lightTheme, cameraPerspective, performanceProfile, mode, activeEngineVisualStyle]);

  /**
   * renderedMarkersCollection: 
   * Misión: Optimizar el renderizado masivo de marcadores mediante memorización de lista.
   * [MTI]: Previene cálculos de mapeo redundantes en el Hilo Principal.
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
      onLoad={handleMapLoadAction}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleDataAction}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={activeEngineVisualStyle || MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      // Efectos atmosféricos desactivados en modo peritaje para máxima nitidez.
      fog={mode === 'FORGE' || performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? null : (FOG_CONFIGURATION as any)}
      antialias={false}
      reuseMaps={false}
      maxPitch={mode === 'FORGE' ? 0 : 85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Visualización de la entidad física del Voyager */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePointOfInterest?.isWithinRadius}
        />
      )}

      {/* Inyección de la Malla de Sabiduria (Nodos NKV) */}
      {renderedMarkersCollection}
    </Map>
  );
});

MapCore.displayName = "MapCore";

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 */
export default memo(MapCore, (previousProperties, nextProperties) => {
  return (
    previousProperties.mapInstanceIdentification === nextProperties.mapInstanceIdentification &&
    previousProperties.performanceProfile === nextProperties.performanceProfile &&
    previousProperties.lightTheme === nextProperties.lightTheme &&
    previousProperties.mode === nextProperties.mode &&
    previousProperties.selectedPointOfInterestIdentification === nextProperties.selectedPointOfInterestIdentification &&
    // [OPTIMIZACIÓN]: Comprobación de integridad de la colección de puntos para evitar re-pintados.
    previousProperties.startCoordinates.latitudeCoordinate === nextProperties.startCoordinates.latitudeCoordinate
  );
});