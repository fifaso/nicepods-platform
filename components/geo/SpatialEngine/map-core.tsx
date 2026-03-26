// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 4.9 (NicePod MapCore - Dynamic Seed & GO-Tracking Edition)
// Misión: Renderizado WebGL fotorrealista con nacimiento en ubicación real.
// [ESTABILIZACIÓN]: Implementación de startCoords para evitar el anclaje forzado en Sol.

"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { ComponentProps } from "react";
import Map, {
  GeolocateControl,
  Layer,
  MapRef
} from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA ---
import {
  BUILDING_LAYER_STYLE,
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
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
  /** startCoords: Ubicación inicial de nacimiento (IP o GPS). */
  startCoords: UserLocation | null;
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
 * Gestiona el nacimiento dinámico y el seguimiento inmersivo.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mode,
  startCoords,
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

  // 2. MEMORIA DE INTERACCIÓN
  const isInteracting = useRef<boolean>(false);

  /**
   * 3. GENERACIÓN DE SEMILLA DE NACIMIENTO
   * [MANDATO]: Este objeto solo se calcula una vez al montar el componente.
   * Si startCoords existe (IP o Caché), el mapa nace allí, no en Sol.
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords?.latitude,
      startCoords?.longitude
    );
  }, [startCoords]);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;
    const style = map.getStyle();
    
    if (style && style.layers) {
      style.layers.forEach((layer: { id: string }) => {
        if (layer.id.includes('poi-label') || layer.id.includes('transit-label')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
      nicepodLog("🏙️ [MapCore] Silencio Urbano aplicado al nacimiento.");
    }
    
    onLoad(e);
  }, [onLoad]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO 3D]
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

  /**
   * [SEGUIMIENTO INMERSIVO POKÉMON GO]
   * Rotación imperativa por brújula (Bearing Tracking).
   */
  useEffect(() => {
    if (mode === 'EXPLORE' && userLocation?.heading !== null && !isInteracting.current) {
      const map = localMapRef.current?.getMap();
      if (map) {
        map.easeTo({
          bearing: userLocation?.heading || 0,
          pitch: 80, 
          duration: 1200, 
          easing: (t: number) => t * (2 - t) 
        });
      }
    }
  }, [userLocation?.heading, mode]);

  return (
    <Map
      ref={localMapRef}
      /**
       * [DECISIÓN CRÍTICA]: Inyección de Semilla Dinámica.
       * Mapbox utiliza este objeto solo al instanciar el mapa.
       */
      initialViewState={initialMapState}
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={(e) => {
        isInteracting.current = true;
        onMove(e);
      }}
      onMoveEnd={(e) => {
        isInteracting.current = false;
        onMoveEnd(e);
      }}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.PHOTOREALISTIC}
      
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* I. EL VOYAGER (Materialización con Z-Index superior) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* II. LA MALLA DE ECOS (Marcadores NKV) */}
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

      {/* III. CAPA ARQUITECTÓNICA (Obsidiana) */}
      {mode === 'EXPLORE' && (
        <Layer {...BUILDING_LAYER_STYLE} />
      )}

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
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords?.latitude === next.startCoords?.latitude &&
    prev.startCoords?.longitude === next.startCoords?.longitude
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.9):
 * 1. Solución de Semilla (Fixing Sol): El componente ahora recibe 'startCoords' y 
 *    utiliza la función 'getInitialViewState' para nacer en la ubicación correcta.
 * 2. Autonomía de Cámara: Al usar 'initialViewState' en lugar de props controladas, 
 *    el motor WebGL permite el movimiento táctil inmediato sin bloqueos de React.
 * 3. Inmersión Refinada: Se mantiene el pitch a 80° y el seguimiento de brújula 
 *    imperativo para la experiencia 'Pokémon GO' completa.
 * 4. Higiene de Vercel: Tipado explícito y eliminación de 'any' en iteradores.
 */