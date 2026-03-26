// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 7.3 (NicePod MapCore - Dynamic Lighting & Theme Reactive Edition)
// Misión: Renderizado de alta fidelidad reactivo al cambio de tema (Día/Noche).
// [ESTABILIZACIÓN]: Inyección de prop 'theme' y useEffect para actualización PBR inmediata.

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
  theme: MapboxLightPreset; // <--- [FIX]: Propiedad ahora obligatoria en el contrato
  onLoad: (e: SafeMapEvent) => void;
  onIdle: () => void;
  onMove: (e: SafeMapMoveEvent) => void;
  onMoveEnd: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual de NicePod.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mode,
  startCoords,
  theme, // Consumimos el tema dinámico
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
   * 3. ACTUALIZACIÓN DINÁMICA DE ILUMINACIÓN (PBR EFFECT)
   * [MANDATO V2.7]: Este efecto escucha cambios en el prop 'theme'
   * y ordena al motor Standard cambiar la luz sin re-renderizar el mapa.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();
    /** @ts-ignore - Mapbox Standard API */
    if (map && map.setConfigProperty) {
      nicepodLog(`🕯️ [MapCore] Cambiando preset lumínico a: ${theme}`);
      map.setConfigProperty('basemap', 'lightPreset', theme);
    }
  }, [theme]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    /** @ts-ignore - Mapbox Standard API */
    if (map.setConfigProperty) {
      // Aplicamos el tema inicial y el protocolo de silencio urbano
      map.setConfigProperty('basemap', 'lightPreset', theme);
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', STANDARD_ENGINE_CONFIG.showPointOfInterestLabels);
      map.setConfigProperty('basemap', 'showTransitLabels', STANDARD_ENGINE_CONFIG.showTransitLabels);
      map.setConfigProperty('basemap', 'showPlaceLabels', STANDARD_ENGINE_CONFIG.showPlaceLabels);
      map.setConfigProperty('basemap', 'showRoadLabels', STANDARD_ENGINE_CONFIG.showRoadLabels);

      nicepodLog(`🏙️ [MapCore] Pintor WebGL iniciado en modo ${theme}.`);
    }

    onLoad(e);
  }, [onLoad, theme]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    if (mode === 'EXPLORE') {
      map.setTerrain({
        source: DEM_SOURCE_CONFIG.id,
        exaggeration: TERRAIN_CONFIG.exaggeration
      });
    } else {
      map.setTerrain(null);
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
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

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
    prev.theme === next.theme && // Ahora comparamos el tema para re-renderizar si es necesario
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords.latitude === next.startCoords.latitude &&
    prev.startCoords.longitude === next.startCoords.longitude
  );
});