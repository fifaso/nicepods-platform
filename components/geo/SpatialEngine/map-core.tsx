/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 15.1 (NicePod MapCore - VRAM Purge & Build Shield Stabilization)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizado WebGL inmutable que sincroniza el lienzo con la perspectiva 
 * de la cámara y gestiona la destrucción atómica de contextos gráficos.
 * [REFORMA V15.1]: Corrección de referencia circular en el comparador de memoria,
 * purificación nominal de iteradores y blindaje total de tipos.
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
  OCCLUSION_CONFIG,
  STANDARD_ENGINE_CONFIG,
  TERRAIN_CONFIG,
  getInitialViewState
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { MapInstanceId, PointOfInterest, UserLocation } from "@/types/geo-sovereignty";
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
  mapInstanceIdentification: MapInstanceId;
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

  // 1. CONSUMO DEL MOTOR SOBERANO (Triple-Core Synergy V4.0)
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
   * 3. PROTOCOLO DE ANIQUILACIÓN (VRAM PURGE)
   * Misión: Forzar la destrucción física del contexto WebGL al desmontar el componente.
   * Esto previene fugas de memoria en la GPU del dispositivo móvil.
   */
  useEffect(() => {
    return () => {
      if (localMapEngineReference.current) {
        const nativeMapInstance = localMapEngineReference.current.getMap();
        if (nativeMapInstance) {
          nicepodLog(`🧨 [MapCore:${mapInstanceIdentification}] Iniciando purga de VRAM y aniquilación de contexto WebGL.`);
          nativeMapInstance.stop(); // Detiene cualquier cinemática en curso
          nativeMapInstance.remove(); // Destruye físicamente el motor gráfico
        }
      }
    };
  }, [mapInstanceIdentification]);

  /**
   * 4. GENERACIÓN DE SEMILLA DE NACIMIENTO (INITIAL VIEW)
   */
  const initialMapViewState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapInstanceIdentification}] Sembrando semilla WebGL inmutable.`);
    return getInitialViewState(
      startCoordinates.latitude,
      startCoordinates.longitude
    );
  }, [mapInstanceIdentification, startCoordinates.latitude, startCoordinates.longitude]);

  /**
   * 5. MANEJADOR DE CARGA NOMINAL
   */
  const handleMapLoadAction = useCallback((event: SafeMapLoadEvent) => {
    nicepodLog(`🏙️ [MapCore:${mapInstanceIdentification}] Handshake WebGL completado.`);
    onLoad(event);
  }, [onLoad, mapInstanceIdentification]);

  /**
   * 6. STYLE-GUARD (El Escudo PBR V15.1)
   * Misión: Inyectar oclusión y temas periciales cada vez que el estilo se regenera.
   */
  const handleStyleDataAction = useCallback((event: SafeMapStyleDataEvent) => {
    const mapNativeInstance = event.target;
    if (!mapNativeInstance || !mapNativeInstance.isStyleLoaded()) {
        return;
    }

    const isOverviewPerspectiveActive = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspectiveActive = cameraPerspective === 'SATELLITE';
    const isTacticalLiteProfileActive = performanceProfile === 'TACTICAL_LITE';
    const engineTechnicalConfiguration = isTacticalLiteProfileActive ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    /**
     * A. GOBERNANZA DE ILUMINACIÓN (Basemap Config)
     */
    if (activeEngineVisualStyle === MAP_STYLES.STANDARD) {
      try {
        const mapboxInternalInstance = mapNativeInstance as any;
        if (mapboxInternalInstance.setConfigProperty) {
          mapboxInternalInstance.setConfigProperty('basemap', 'lightPreset', lightTheme);
          mapboxInternalInstance.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPlaceLabels', isOverviewPerspectiveActive && !isTacticalLiteProfileActive);
          mapboxInternalInstance.setConfigProperty('basemap', 'showRoadLabels', engineTechnicalConfiguration.showRoadLabels);
          mapboxInternalInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          mapboxInternalInstance.setConfigProperty('basemap', 'showTransitLabels', false);
        }
      } catch (exception) {
        nicepodLog("⚠️ [MapCore] Fallo en inyección basemap.", exception, 'warn');
      }
    }

    /**
     * B. GOBERNANZA TÉRMICA (Edificios 3D)
     */
    try {
      if (mapNativeInstance.getLayer('building')) {
        const buildingOpacityTargetValue = isTacticalLiteProfileActive 
          ? LITE_ENGINE_CONFIG.buildingOpacity 
          : (isSatellitePerspectiveActive ? 0 : 1.0);
        
        mapNativeInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityTargetValue);
      }
    } catch (exception) { /* Capa no disponible */ }

    /**
     * C. RELIEVE GEOGRÁFICO (Terrain Engine)
     */
    if (!mapNativeInstance.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        mapNativeInstance.addSource(DEM_SOURCE_CONFIG.id, {
          type: "raster-dem",
          url: DEM_SOURCE_CONFIG.url,
          tileSize: 512
        });
      } catch (exception) { return; }
    }

    try {
      const terrainPhysicalParameters = (isTacticalLiteProfileActive || isSatellitePerspectiveActive) ? LITE_TERRAIN_CONFIG : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        mapNativeInstance.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainPhysicalParameters.exaggeration
        });
      } else {
        mapNativeInstance.setTerrain(null);
      }
    } catch (exception) {
      nicepodLog("ℹ️ [MapCore] Gestión de relieve finalizada.");
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
      fog={performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={85}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Representación física del usuario */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePointOfInterest?.isWithinRadius}
        />
      )}

      {/* CAPA ECOS: Nodos de Sabiduría de la Bóveda NKV */}
      {nearbyPointsOfInterest.map((pointOfInterestEntry: PointOfInterest) => (
        <MapMarkerCustom
          key={pointOfInterestEntry.id}
          identification={pointOfInterestEntry.id.toString()}
          latitude={pointOfInterestEntry.geo_location.coordinates[1]}
          longitude={pointOfInterestEntry.geo_location.coordinates[0]}
          categoryMission={pointOfInterestEntry.category_mission}
          categoryEntity={pointOfInterestEntry.category_entity}
          pointOfInterestName={pointOfInterestEntry.name}
          isResonating={activePointOfInterest?.identification === pointOfInterestEntry.id.toString() && activePointOfInterest?.isWithinRadius}
          isSelected={selectedPointOfInterestIdentification === pointOfInterestEntry.id.toString()}
          onMarkerInteraction={onMarkerClick}
        />
      ))}
    </Map>
  );
});

MapCore.displayName = "MapCore";

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 * Bloqueamos ciclos de CPU innecesarios para proteger la tasa de 60 FPS.
 * [FIX V15.1]: Corrección de referencia de propiedad para estabilizar la comparación.
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