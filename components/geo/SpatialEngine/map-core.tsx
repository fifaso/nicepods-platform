/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.7 (NicePod MapCore - Absolute Immutability & Interaction Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL inmutable que otorga soberanía total a los gestos del usuario.
 * [REFORMA V8.7]: Bloqueo de re-renders por coordenadas para liberar Zoom y Pan.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.4 ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapboxLightPreset,
  OCCLUSION_CONFIG,
  STANDARD_ENGINE_CONFIG,
  TERRAIN_CONFIG,
  getInitialViewState
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { PointOfInterest, UserLocation, MapInstanceId } from "@/types/geo-sovereignty";
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
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO (V5.4)
   * Se calcula una sola vez para evitar que re-renders muevan la cámara.
   */
  const initialMapState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapId}] Sembrando semilla de renderizado.`);
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]); // Solo re-calcula si el ID del mapa cambia físicamente

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA
   * [GUARDIA]: Operaciones imperativas para no disparar ciclos de React.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';
      
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // Sincronía Contextual de Etiquetas
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🕯️ [MapCore:${mapId}] PBR Sync completado.`);
    }
  }, [theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';

      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);

      nicepodLog(`🏙️ [MapCore:${mapId}] Pintor WebGL listo para interacción soberana.`);
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    try {
      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: TERRAIN_CONFIG.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) {
      nicepodLog(`⚠️ [MapCore:${mapId}] Suspensión asíncrona de terreno.`);
    }
  }, [mode, mapId]);

  return (
    <Map
      id={mapId}
      ref={localMapRef}
      initialViewState={initialMapState} // Uncontrolled: Mapbox gestiona su propia posición
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Sincronizada con useGeoEngine */}
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
 * El comparador de integridad es ahora el filtro definitivo contra el jittering.
 * BLOQUEO: Ignoramos 'startCoords' tras el montaje para liberar Zoom y Pan.
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId &&
    prev.theme === next.theme &&
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
    // NOTA: Ignorar startCoords deliberadamente permite que Mapbox sea inmutable.
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.7):
 * 1. Interaction Liberation: Al ignorar los cambios de startCoords en el memo, 
 *    el componente <Map> nunca se reinicia, permitiendo que los gestos de 
 *    zoom y pan nativos de Mapbox funcionen sin interferencias de React.
 * 2. Visual Stasis: Erradica los movimientos laterales (jitter) al evitar que
 *    el mapa intente re-centrarse en cada frame de telemetría de red.
 * 3. Atomic Identity: El mapId vincula la instancia físicamente al lienzo, 
 *    asegurando que cada página sea un reino soberano.
 * 4. PBR Constancy: Los cambios de tema se inyectan imperativamente en el 
 *    useEffect, manteniendo la fluidez de 60FPS sin re-renderizar el mapa.
 */