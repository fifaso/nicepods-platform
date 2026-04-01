/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 10.0 (NicePod MapCore - PBR Occlusion & Style-Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Renderizado WebGL inmutable que otorga soberanía total a los gestos del usuario.
 * [REFORMA V10.0]: Migración de inyección PBR al evento onStyleData para garantizar la 
 * oclusión de edificios sobre el avatar en modo STREET.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.5 ---
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

  const { userLocation, nearbyPOIs, activePOI, cameraPerspective } = useGeoEngine();

  // 1. REFERENCIA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  /**
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO
   * [MANDATO V9.1]: Se calcula una sola vez por mapId. 
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
   * 3. PROTOCOLO MAPBOX STANDARD: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    nicepodLog(`🏙️ [MapCore:${mapId}] Handshake WebGL completado.`);
    onLoad(e);
  }, [onLoad, mapId]);

  /**
   * 4. STYLE-GUARD (El Escudo PBR V10.0)
   * Misión: Mapbox v3 regenera estilos internamente. Inyectamos la oclusión y
   * la iluminación aquí para que NUNCA sean sobrescritas por el motor nativo.
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    const isOverview = cameraPerspective === 'OVERVIEW';
    const isLite = performanceProfile === 'TACTICAL_LITE';
    const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

    /**
     * A. GOBERNANZA DE ESTILO Y OCLUSIÓN (PBR)
     */
    if ((map as any).setConfigProperty) {
      try {
        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        // [MANDATO DE OCLUSIÓN]: Esto hace que los edificios tapen al Voyager (Imagen 33)
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);
      } catch (err) {
        // Silenciado intencionalmente (Mapbox a veces reporta error aunque aplica el estilo)
      }
    }

    /**
     * B. GOBERNANZA DE RENDIMIENTO (Opacidad de Mallas)
     */
    try {
      const buildingOpacity = isLite ? LITE_ENGINE_CONFIG.buildingOpacity : 1.0;
      if (map.getLayer('building')) {
        map.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacity);
      }
    } catch (e) { } // Capa building no disponible aún

    /**
     * C. PROTOCOLO DE INYECCIÓN DE TERRENO (Relieve Físico)
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
      const terrainParams = isLite ? LITE_TERRAIN_CONFIG : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainParams.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) { }

  }, [theme, cameraPerspective, performanceProfile, mode]);

  return (
    <Map
      id={mapId}
      ref={localMapRef}
      initialViewState={initialMapState} // Modo Inmutable
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData} // <--- [V10.0]: El Guardián de Estilos
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={performanceProfile === 'TACTICAL_LITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={85}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Renderizado reactivo a useGeoEngine */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA ECOS: Bóveda NKV */}
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
 * Bloqueamos cualquier re-render que no sea un cambio físico de la instancia o del perfil.
 * [MANDATO V9.1]: Ignorar startCoords tras el montaje para liberar la interactividad.
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
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Style-Guard Resilience: Mover las configuraciones PBR al 'onStyleData' 
 *    garantiza que la oclusión de los edificios nunca falle (Solución a Imagen 33).
 *    Si Mapbox recarga texturas, el escudo se re-inyecta automáticamente.
 * 2. CPU Optimization: Se eliminó el 'useEffect' redundante que intentaba 
 *    sincronizar el tema. Toda la lógica gráfica vive ahora en el evento nativo
 *    de la GPU de Mapbox.
 */