/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 17.0 (NicePod MapCore - Authority Forge & Precision Satellite Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Reactor WebGL inmutable que gestiona la renderización de la malla 3D 
 * y la destrucción física de contextos gráficos. En modo FORGE, actúa como un 
 * tablero de precisión cenital para el anclaje manual de hitos.
 * [REFORMA V17.0]: Sincronización total con la Constitución V8.6. Restauración 
 * de la autoridad táctica mediante el evento nativo de clic. Forzado de cénit 
 * absoluto (pitch: 0) en modo creación para eliminar distorsiones de perspectiva.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useEffect } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA SOBERANA ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  LITE_ENGINE_CONFIG,
  LITE_TERRAIN_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapPerformanceProfile,
  MapboxLightPreset,
  OCC_CONFIG, 
  STANDARD_ENGINE_CONFIG,
  TERRAIN_CONFIG,
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
  /** mode: Define si la terminal opera en exploración o creación (FORGE). */
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
 * MapCore: El reactor visual soberano de la Workstation.
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

  // 1. CONSUMO DEL MOTOR SOBERANO (Triple-Core Synergy V4.2)
  const {
    userLocation,
    nearbyPointsOfInterest,
    activePointOfInterest,
    cameraPerspective,
    mapStyle: activeEngineVisualStyle 
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA AL LIENZO WEBGL
  const localMapEngineReference = useRef<MapRef>(null);
  
  useImperativeHandle(componentForwardedReference, () => localMapEngineReference.current as MapRef, []);

  /**
   * 3. PROTOCOLO DE ANIQUILACIÓN (VRAM PURGE - PILAR 3)
   * Misión: Forzar la destrucción física del contexto WebGL al desmontar el componente.
   */
  useEffect(() => {
    const currentMapEngineInstance = localMapEngineReference.current;

    return () => {
      if (currentMapEngineInstance) {
        const nativeMapInstance = currentMapEngineInstance.getMap();
        if (nativeMapInstance) {
          nicepodLog(`🧨 [MapCore:${mapInstanceIdentification}] Iniciando purga de VRAM y aniquilación física.`);
          nativeMapInstance.stop(); // Detiene cualquier animación cinemática
          nativeMapInstance.remove(); // Destruye el motor y libera la memoria de video
        }
      }
    };
  }, [mapInstanceIdentification]);

  /**
   * 4. GENERACIÓN DE SEMILLA DE NACIMIENTO (INITIAL VIEW)
   * [SINCRO V17.0]: Mapeo de coordenadas industriales.
   */
  const initialMapViewState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapInstanceIdentification}] Sembrando semilla WebGL inmutable.`);
    return getInitialViewState(
      startCoordinates.latitudeCoordinate,
      startCoordinates.longitudeCoordinate
    );
  }, [mapInstanceIdentification, startCoordinates.latitudeCoordinate, startCoordinates.longitudeCoordinate]);

  /**
   * 5. MANEJADOR DE CARGA NOMINAL
   */
  const handleMapLoadAction = useCallback((event: SafeMapLoadEvent) => {
    nicepodLog(`🏙️ [MapCore:${mapInstanceIdentification}] Handshake WebGL completado con éxito.`);
    onLoad(event);
  }, [onLoad, mapInstanceIdentification]);

  /**
   * 6. STYLE-GUARD (El Escudo PBR V17.0)
   * Misión: Configurar las propiedades del motor según el modo operativo.
   */
  const handleStyleDataAction = useCallback((event: SafeMapStyleDataEvent) => {
    const mapNativeInstance = event.target;
    if (!mapNativeInstance || !mapNativeInstance.isStyleLoaded()) {
        return;
    }

    const isForgeModeActive = mode === 'FORGE';
    const isOverviewPerspectiveActive = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspectiveActive = cameraPerspective === 'SATELLITE' || isForgeModeActive;
    const isTacticalLiteProfileActive = performanceProfile === 'TACTICAL_LITE';
    const engineTechnicalConfiguration = isTacticalLiteProfileActive ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    if (activeEngineVisualStyle === MAP_STYLES.STANDARD) {
      try {
        const mapboxInternalInstance = mapNativeInstance as any;
        if (mapboxInternalInstance.setConfigProperty) {
          mapboxInternalInstance.setConfigProperty('basemap', 'lightPreset', lightTheme);
          // [V17.0]: Oclusión forzada para mantener visibilidad del avatar tras edificios.
          mapboxInternalInstance.setConfigProperty('basemap', 'puckOcclusion', OCC_CONFIG.puckOcclusion);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPlaceLabels', (isOverviewPerspectiveActive || isForgeModeActive) && !isTacticalLiteProfileActive);
          mapboxInternalInstance.setConfigProperty('basemap', 'showRoadLabels', engineTechnicalConfiguration.showRoadLabels);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          mapboxInternalInstance.setConfigProperty('basemap', 'showTransitLabels', false);
        }
      } catch (hardwareException) {
        nicepodLog("⚠️ [MapCore] Fallo en la inyección de propiedades del basemap.", hardwareException, 'warn');
      }
    }

    // Gestión de transparencia de geometría 3D
    try {
      if (mapNativeInstance.getLayer('building')) {
        const buildingOpacityTargetValue = isTacticalLiteProfileActive 
          ? LITE_ENGINE_CONFIG.buildingOpacity 
          : (isSatellitePerspectiveActive ? 0 : 1.0);
        
        mapNativeInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityTargetValue);
      }
    } catch (hardwareException) { /* Capa no disponible */ }

    // Inyección de terreno (Raster DEM)
    if (!mapNativeInstance.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        mapNativeInstance.addSource(DEM_SOURCE_CONFIG.id, {
          type: "raster-dem",
          url: DEM_SOURCE_CONFIG.url,
          tileSize: 512
        });
      } catch (hardwareException) { return; }
    }

    try {
      const terrainPhysicalParameters = (isTacticalLiteProfileActive || isSatellitePerspectiveActive) ? LITE_TERRAIN_CONFIG : TERRAIN_CONFIG;

      // El terreno 3D se desactiva en modo FORGE para permitir clics de precisión sobre el plano.
      if (mode === 'EXPLORE' && !isSatellitePerspectiveActive) {
        mapNativeInstance.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainPhysicalParameters.exaggeration
        });
      } else {
        mapNativeInstance.setTerrain(null);
      }
    } catch (hardwareException) {
      nicepodLog("ℹ️ [MapCore] Gestión de relieve geográfico finalizada.");
    }

  }, [lightTheme, cameraPerspective, performanceProfile, mode, activeEngineVisualStyle]);

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
      // [V17.0]: Desactivamos efectos atmosféricos en modo FORGE para mayor claridad.
      fog={mode === 'FORGE' || performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={mode === 'FORGE' ? 0 : 85} // Bloqueo de cénit absoluto en creación
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePointOfInterest?.isWithinRadius}
        />
      )}

      {nearbyPointsOfInterest.map((pointOfInterestEntry: PointOfInterest) => (
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
      ))}
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
    previousProperties.selectedPointOfInterestIdentification === nextProperties.selectedPointOfInterestIdentification
  );
});