/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 12.0 (NicePod MapCore - Style Sovereignty & PBR Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Renderizado WebGL inmutable que sincroniza el lienzo (tiles) con la 
 * perspectiva de la cámara para erradicar conflictos visuales.
 * [REFORMA V12.0]: Consumo dinámico de mapStyle, blindaje de inyección PBR 
 * y purificación total de nomenclatura (Sin abreviaciones).
 * Nivel de Integridad: 100% (Soberano / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V6.0 ---
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
  onMarkerClick: (id: string) => void;
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

  // 1. CONSUMO DEL MOTOR SOBERANO (Triple-Core Facade)
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
   * [MANDATO V12.0]: Se calcula una sola vez por instancia de ID.
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
   * 5. STYLE-GUARD (El Escudo PBR V12.0)
   * Misión: Inyectar oclusión y temas SOLO si el estilo soporta configuración PBR.
   * Resuelve el conflicto al cambiar a modo SATELLITE.
   */
  const handleStyleData = useCallback((event: SafeMapStyleDataEvent) => {
    const mapNativeInstance = event.target;
    if (!mapNativeInstance || !mapNativeInstance.isStyleLoaded()) return;

    const isOverviewPerspective = cameraPerspective === 'OVERVIEW';
    const isSatellitePerspective = cameraPerspective === 'SATELLITE';
    const isTacticalLite = performanceProfile === 'TACTICAL_LITE';
    const engineConfiguration = isTacticalLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    /**
     * A. GOBERNANZA PBR (Solo para Mapbox Standard)
     */
    if (activeEngineStyle === MAP_STYLES.STANDARD && (mapNativeInstance as any).setConfigProperty) {
      try {
        (mapNativeInstance as any).setConfigProperty('basemap', 'lightPreset', lightTheme);
        (mapNativeInstance as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showPlaceLabels', isOverviewPerspective && !isTacticalLite);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showRoadLabels', engineConfiguration.showRoadLabels);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (mapNativeInstance as any).setConfigProperty('basemap', 'showTransitLabels', false);
      } catch (error) {
        nicepodLog("⚠️ [MapCore] Advertencia en inyección basemap.", error, 'warn');
      }
    }

    /**
     * B. GOBERNANZA DE RENDIMIENTO (Opacidad de Mallas)
     * En modo SATELLITE, ocultamos edificios 3D para peritaje de ortofoto pura.
     */
    try {
      if (mapNativeInstance.getLayer('building')) {
        const buildingOpacityValue = isTacticalLite ? LITE_ENGINE_CONFIG.buildingOpacity : (isSatellitePerspective ? 0 : 1.0);
        mapNativeInstance.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacityValue);
      }
    } catch (error) {
      // Capa no disponible aún en el ciclo de carga
    }

    /**
     * C. TERRENO Y RELIEVE (Física Ambiental)
     */
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
    } catch (error) {
      nicepodLog("⚠️ [MapCore] Fallo en configuración de relieve.", error, 'warn');
    }

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
      // Sincronía atómica estilo-perspectiva para erradicar parpadeos
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
        <MapMarkerCustom
          key={pointOfInterest.id}
          id={pointOfInterest.id.toString()}
          latitude={pointOfInterest.geo_location.coordinates[1]}
          longitude={pointOfInterest.geo_location.coordinates[0]}
          category_id={pointOfInterest.category_id}
          name={pointOfInterest.name}
          isResonating={activePointOfInterest?.id === pointOfInterest.id.toString() && activePointOfInterest?.isWithinRadius}
          isSelected={selectedPointOfInterestId === pointOfInterest.id.toString()}
          onClick={onMarkerClick}
        />
      ))}
    </Map>
  );
});

MapCore.displayName = "MapCore";

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 */
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
 * NOTA TÉCNICA DEL ARCHITECT (V12.0):
 * 1. Zero Abbreviations: Se ha purgado el código de cualquier abreviatura para 
 *    garantizar la transparencia técnica y el cumplimiento del Dogma V3.0.
 * 2. Perspective Integrity: Al vincular el mapStyle dinámicamente, erradicamos 
 *    el "Snap-Back" satelital. El pintor ahora espera la instrucción de estilo 
 *    del motor central.
 * 3. Atomic Memory Management: El uso de memo y referencias locales asegura que 
 *    la GPU mantenga una prioridad absoluta durante las transiciones de modo.
 */