/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 11.0 (NicePod MapCore - Style Sovereignty & PBR Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Renderizado WebGL inmutable que sincroniza el lienzo (tiles) con la 
 * perspectiva de la cámara para erradicar el parpadeo satelital.
 * [REFORMA V11.0]: Consumo dinámico de mapStyle y blindaje de inyección PBR 
 * para estilos no-estándar (Satelital).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
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
 * [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mapId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile;
  startCoords: UserLocation;
  theme: MapboxLightPreset;
  onLoad: (e: SafeMapEvent) => void;
  onIdle: () => void;
  onMove?: (e: SafeMapMoveEvent) => void;
  onMoveEnd?: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual soberano de NicePod.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mapId,
  mode,
  performanceProfile = 'HIGH_FIDELITY',
  startCoords,
  theme,
  onLoad,
  onIdle,
  onMove,
  onMoveEnd,
  onMapClick,
  onMarkerClick,
  selectedPOIId
}, ref) => {

  // 1. CONSUMO DEL MOTOR SOBERANO (V44.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    cameraPerspective,
    mapStyle: engineStyle // <--- [V11.0]: Estilo dictado por la Fachada
  } = useGeoEngine();

  // 2. REFERENCIA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  /**
   * 3. GENERACIÓN DE SEMILLA DE NACIMIENTO
   */
  const initialMapState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapId}] Sembrando semilla WebGL inmutable.`);
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  /**
   * 4. HANDSHAKE INICIAL
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    nicepodLog(`City-Mesh [${mapId}] Online.`);
    onLoad(e);
  }, [onLoad, mapId]);

  /**
   * 5. STYLE-GUARD (El Escudo PBR V11.0)
   * Misión: Inyectar oclusión y temas SOLO si el estilo soporta configuración PBR.
   * Resuelve el conflicto al cambiar a modo SATELLITE.
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    const isOverview = cameraPerspective === 'OVERVIEW';
    const isSatellite = cameraPerspective === 'SATELLITE';
    const isLite = performanceProfile === 'TACTICAL_LITE';
    const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    /**
     * A. GOBERNANZA PBR (Solo para Mapbox Standard)
     */
    if (engineStyle === MAP_STYLES.STANDARD && (map as any).setConfigProperty) {
      try {
        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);
      } catch (err) {
        // Fallback silencioso si el slot 'basemap' no está listo
      }
    }

    /**
     * B. GOBERNANZA DE RENDIMIENTO (Opacidad de Mallas)
     * Desactivamos opacidad en Satélite para ver la textura pura.
     */
    try {
      if (map.getLayer('building')) {
        const opacity = isLite ? LITE_ENGINE_CONFIG.buildingOpacity : (isSatellite ? 0 : 1.0);
        map.setPaintProperty('building', 'fill-extrusion-opacity', opacity);
      }
    } catch (e) { }

    /**
     * C. TERRENO Y RELIEVE (Física Ambiental)
     */
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        map.addSource(DEM_SOURCE_CONFIG.id, {
          type: "raster-dem",
          url: DEM_SOURCE_CONFIG.url,
          tileSize: 512
        });
      } catch (e) { return; }
    }

    try {
      // En modo satélite o lite, el relieve se suaviza para evitar distorsiones
      const terrainParams = (isLite || isSatellite) ? LITE_TERRAIN_CONFIG : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainParams.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) { }

  }, [theme, cameraPerspective, performanceProfile, mode, engineStyle]);

  return (
    <Map
      id={mapId}
      ref={localMapRef}
      initialViewState={initialMapState}
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      // [V11.0]: Vinculación atómica con el estilo del motor. Erradica el parpadeo.
      mapStyle={engineStyle || MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={performanceProfile === 'TACTICAL_LITE' || cameraPerspective === 'SATELLITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={85}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Identidad física del usuario */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA ECOS: Nodos de la Bóveda NKV */}
      {nearbyPOIs.map((poi: PointOfInterest) => (
        <MapMarkerCustom
          key={poi.id}
          id={poi.id.toString()}
          latitude={poi.geo_location.coordinates[1]}
          longitude={poi.geo_location.coordinates[0]}
          category_id={poi.category_id}
          name={poi.name}
          isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
          isSelected={selectedPOIId === poi.id.toString()}
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
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId &&
    prev.performanceProfile === next.performanceProfile &&
    prev.theme === next.theme &&
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Snap-Back Eradication: Al consumir 'mapStyle' directamente de la Fachada, 
 *    el componente garantiza que las texturas satelitales y la cámara cenital
 *    se activen en el mismo frame de la GPU, eliminando el parpadeo de la Imagen 6.
 * 2. PBR Guard: Se inyectó una validación de estilo en 'handleStyleData' para evitar 
 *    el crash de configuración cuando se utilizan lienzos que no soportan PBR nativo.
 * 3. Satellite Opacity: En modo fotorrealista, la opacidad de los edificios 
 *    se reduce a 0 para no obstruir la textura de la ortofoto, mejorando el peritaje.
 */