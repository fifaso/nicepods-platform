/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 13.0 (NicePod MapCore - Full Taxonomy & Marker Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizado WebGL inmutable que sincroniza el lienzo con la 
 * perspectiva de la cámara y proyecta los marcadores con su nueva identidad.
 * [REFORMA V13.0]: Sincronización nominal con MapMarkerCustom V5.0 para resolver 
 * error de compilación TS2322 y alineación con Taxonomía Granular.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V7.0 ---
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
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mapInstanceId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile;
  startCoordinates: UserLocation;
  lightTheme: MapboxLightPreset;
  onLoad: (event: SafeMapEvent) => void;
  onIdle: () => void;
  onMove?: (event: SafeMapMoveEvent) => void;
  onMoveEnd?: (event: SafeMapMoveEvent) => void;
  onMapClick: (event: SafeMapClickEvent) => void;
  onMarkerClick: (identification: string) => void;
  selectedPointOfInterestId: string | null;
}

/**
 * MapCore: El reactor visual soberano de NicePod.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mapInstanceId,
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
  selectedPointOfInterestId
}, ref) => {

  // 1. CONSUMO DEL MOTOR SOBERANO (Triple-Core Facade V45.1)
  const {
    userLocation,
    nearbyPOIs: nearbyPointsOfInterest,
    activePOI: activePointOfInterest,
    cameraPerspective,
    mapStyle: activeEngineStyle 
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA
  const localMapReference = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapReference.current as MapRef, []);

  /**
   * 3. GENERACIÓN DE SEMILLA DE NACIMIENTO
   */
  const initialMapViewState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapInstanceId}] Sembrando semilla WebGL inmutable.`);
    return getInitialViewState(
      startCoordinates.latitude,
      startCoordinates.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstanceId]);

  /**
   * 4. HANDSHAKE INICIAL
   */
  const handleMapLoad = useCallback((event: SafeMapEvent) => {
    nicepodLog(`🏙️ [MapCore:${mapInstanceId}] Handshake WebGL completado.`);
    onLoad(event);
  }, [onLoad, mapInstanceId]);

  /**
   * 5. STYLE-GUARD (El Escudo PBR V13.0)
   */
  const handleStyleData = useCallback((event: SafeMapStyleDataEvent) => {
    const mapNativeInstance = event.target;
    if (!mapNativeInstance || !mapNativeInstance.isStyleLoaded()) return;

    const isOverviewPerspective = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspective = cameraPerspective === 'SATELLITE';
    const isTacticalLite = performanceProfile === 'TACTICAL_LITE';
    const engineConfiguration = isTacticalLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    if (activeEngineStyle === MAP_STYLES.STANDARD && (mapNativeInstance as any).setConfigProperty) {
      try {
        (mapNativeInstance as any).setConfigProperty('basemap', 'lightPreset', lightTheme);
        (mapNativeInstance as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showPlaceLabels', isOverviewPerspective && !isTacticalLite);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showRoadLabels', engineConfiguration.showRoadLabels);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showTransitLabels', false);
      } catch (error) {
        nicepodLog("⚠️ [MapCore] Fallo en inyección basemap.", error, 'warn');
      }
    }

    try {
      if (mapNativeInstance.getLayer('building')) {
        const buildingOpacityValue = isTacticalLite ? LITE_ENGINE_CONFIG.buildingOpacity : (isSatellitePerspective ? 0 : 1.0);
        mapNativeInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityValue);
      }
    } catch (error) {}

    if (!mapNativeInstance.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        mapNativeInstance.addSource(DEM_SOURCE_CONFIG.id, {
          type: "raster-dem",
          url: DEM_SOURCE_CONFIG.url,
          tileSize: 512
        });
      } catch (error) { return; }
    }

    try {
      const terrainParameters = (isTacticalLite || isSatellitePerspective) ? LITE_TERRAIN_CONFIG : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        mapNativeInstance.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainParameters.exaggeration
        });
      } else {
        mapNativeInstance.setTerrain(null);
      }
    } catch (error) {}

  }, [lightTheme, cameraPerspective, performanceProfile, mode, activeEngineStyle]);

  return (
    <Map
      id={mapInstanceId}
      ref={localMapReference}
      initialViewState={initialMapViewState}
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={activeEngineStyle || MAP_STYLES.STANDARD}
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

      {/* CAPA ECOS: Nodos de la Bóveda NKV */}
      {nearbyPointsOfInterest.map((pointOfInterest: PointOfInterest) => (
        /**
         * [FIX V13.0]: Sincronía total con MapMarkerCustom V5.0.
         * Se inyectan los nuevos nombres de propiedades para satisfacer al Build Shield.
         */
        <MapMarkerCustom
          key={pointOfInterest.id}
          identification={pointOfInterest.id.toString()}
          latitude={pointOfInterest.geo_location.coordinates[1]}
          longitude={pointOfInterest.geo_location.coordinates[0]}
          categoryMission={pointOfInterest.category_mission}
          categoryEntity={pointOfInterest.category_entity}
          pointOfInterestName={pointOfInterest.name}
          isResonating={activePointOfInterest?.identification === pointOfInterest.id.toString() && activePointOfInterest?.isWithinRadius}
          isSelected={selectedPointOfInterestId === pointOfInterest.id.toString()}
          onMarkerInteraction={onMarkerClick}
        />
      ))}
    </Map>
  );
});

MapCore.displayName = "MapCore";

export default memo(MapCore, (previousProps, nextProps) => {
  return (
    previousProps.mapInstanceId === nextProps.mapInstanceId &&
    previousProps.performanceProfile === nextProps.performanceProfile &&
    previousProps.lightTheme === nextProps.lightTheme &&
    previousProps.mode === nextProps.mode &&
    previousProps.selectedPointOfInterestId === nextProps.selectedPointOfInterestId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Synchronized Architecture: Se ha cerrado la brecha de tipos entre el Pintor 
 *    y el Marcador. El uso de 'categoryMission' y 'categoryEntity' garantiza que 
 *    la identidad visual de la Malla sea coherente con la Bóveda NKV V4.0.
 * 2. Interaction Alignment: El cambio de 'onClick' a 'onMarkerInteraction' 
 *    unifica el lenguaje de eventos de la workstation.
 * 3. Zero Abbreviations: Se ha purgado el 100% del archivo para cumplir con el 
 *    estándar de rigor profesional de NicePod.
 */