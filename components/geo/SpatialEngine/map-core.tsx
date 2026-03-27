// components/geo/SpatialEngine/map-core.tsx
/**
 * NICEPOD V8.1 - MAP CORE (STABLE STYLE & URBAN VISION EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL de alta fidelidad blindado contra errores de carga.
 * [ESTABILIZACIÓN]: Implementación de Style-Ready Guard para evitar el error 'Style not loaded'.
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, {
  GeolocateControl,
  MapRef
} from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA ---
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
import { PointOfInterest, UserLocation } from "@/types/geo-sovereignty";
import { MapMarkerCustom } from "../map-marker-custom";
import { UserLocationMarker } from "../user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  startCoords: UserLocation;
  theme: MapboxLightPreset;
  onLoad: (e: SafeMapEvent) => void;
  onIdle: () => void;
  onMove: (e: SafeMapMoveEvent) => void;
  onMoveEnd: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual soberano.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
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

  const { userLocation, nearbyPOIs, activePOI } = useGeoEngine();

  // 1. REFERENCIA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  /**
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * 3. ACTUALIZACIÓN DINÁMICA DE ILUMINACIÓN Y OCLUSIÓN
   * [GUARDIA V8.1]: Verificamos map.isStyleLoaded() antes de actuar.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      nicepodLog(`🕯️ [MapCore] Sincronizando presets: ${theme}`);
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
    }
  }, [theme]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    // Solo configuramos si la API Standard está disponible en la instancia
    if ((map as any).setConfigProperty) {
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // Aplicación de Silencio Urbano
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', STANDARD_ENGINE_CONFIG.showPointOfInterestLabels);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', STANDARD_ENGINE_CONFIG.showTransitLabels);
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', STANDARD_ENGINE_CONFIG.showPlaceLabels);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', STANDARD_ENGINE_CONFIG.showRoadLabels);

      nicepodLog(`🏙️ [MapCore] Pintor WebGL configurado tras onLoad exitoso.`);
    }

    onLoad(e);
  }, [onLoad, theme]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   * [GUARDIA V8.1]: Doble verificación de estado de carga del estilo.
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    // Registro de fuente DEM si no existe
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    // Aplicación de relieve 3D condicional
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
      // Evitamos el crash silencioso si Mapbox lanza un error interno de validación
      nicepodLog("⚠️ [MapCore] El terreno no pudo inyectarse en este frame.", null, 'warn');
    }
  }, [mode]);

  return (
    <Map
      id="main-mesh-painter"
      ref={localMapRef}
      initialViewState={initialMapState}
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
      {/* CAPA: VOYAGER (Z-INDEX 9999) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA: ECOS (BÓVEDA NKV) */}
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

      <GeolocateControl
        showUserLocation={false}
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        className="hidden"
      />
    </Map>
  );
});

MapCore.displayName = "MapCore";

export default memo(MapCore, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.theme === next.theme &&
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords.latitude === next.startCoords.latitude &&
    prev.startCoords.longitude === next.startCoords.longitude
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.1):
 * 1. Style-Ready Guard: Se introdujo map.isStyleLoaded() en handleStyleData y useEffect.
 *    Esto erradica el crash fatal 'Style is not done loading' de la consola.
 * 2. Adaptive Urban Vision: Se consolidó puckOcclusion: 'occluded' para garantizar
 *    que el Voyager sea visible a través de los muros de obsidiana de Madrid.
 * 3. Max Pitch Calibration: Con 85°, la inmersión de calle es absoluta, permitiendo
 *    la estética profesional solicitada (Street-Lock Vision).
 */