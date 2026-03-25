// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 4.0 (NicePod MapCore - Pokémon GO Tracking & Safe Inference Edition)
// Misión: Renderizado WebGL fotorrealista con seguimiento inmersivo y silencio urbano.
// [ESTABILIZACIÓN]: Erradicación de ts(2709) mediante Inferencia de Eventos.

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
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
  INITIAL_VIEW_STATE,
  MAPBOX_TOKEN,
  MAP_STYLES,
  TERRAIN_CONFIG
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";
import { MapMarkerCustom } from "../map-marker-custom";
import { UserLocationMarker } from "../user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * Extracción garantizada de interfaces directas del componente Map.
 * ---------------------------------------------------------------------------
 */
type MapProps = ComponentProps<typeof Map>;
type SafeMapLoadEvent = Parameters<NonNullable<MapProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapProps['onStyleData']>>[0];

interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  onLoad: (e: SafeMapLoadEvent) => void;
  onMove: (e: SafeMapMoveEvent) => void;
  onMoveEnd: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual de NicePod.
 * Utiliza un patrón imperativo para gestionar el terreno 3D y la cámara.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mode,
  onLoad,
  onMove,
  onMoveEnd,
  onMapClick,
  onMarkerClick,
  selectedPOIId
}, ref) => {

  const { userLocation, nearbyPOIs, activePOI } = useGeoEngine();

  // 1. REF INTERNA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  // 2. MEMORIA DE INTERACCIÓN HUMANA
  const isInteracting = useRef<boolean>(false);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   */
  const handleMapLoad = useCallback((e: SafeMapLoadEvent) => {
    // Cast seguro a unknown -> MapRef para acceder a funciones del motor sin usar "any" 
    // ni importar tipos problemáticos.
    const map = e.target as unknown as MapRef;
    const style = map.getStyle();

    if (style && style.layers) {
      style.layers.forEach((layer: { id: string }) => {
        if (layer.id === 'poi-label') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
      nicepodLog("🏙️ [MapCore] Silencio Urbano activado. Capas genéricas purgadas.");
    }

    onLoad(e);
  }, [onLoad]);

  /**
   * [PROTOCOLO DE INYECCIÓN IMPERATIVA (TERRENO)]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target as unknown as MapRef;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      nicepodLog("🏗️ [MapCore] Inyectando Fuente DEM Soberana.");
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
   * [CÁMARA DE SEGUIMIENTO INMERSIVO (POKÉMON GO TRACKING)]
   */
  useEffect(() => {
    if (mode === 'EXPLORE' && userLocation?.heading !== null && userLocation?.heading !== undefined) {
      if (isInteracting.current) return;

      const map = localMapRef.current?.getMap();
      if (map) {
        // Tipado explícito del parámetro 't' para evitar ts(7006)
        map.easeTo({
          bearing: userLocation.heading,
          pitch: 80,
          duration: 800,
          easing: (t: number) => t * (2 - t)
        });
      }
    }
  }, [userLocation?.heading, mode]);

  // Selección de estilo inmutable
  const currentMapStyle = useMemo(() =>
    mode === 'FORGE' ? MAP_STYLES.PHOTOREALISTIC : MAP_STYLES.PHOTOREALISTIC,
    [mode]);

  return (
    <Map
      ref={localMapRef}
      {...INITIAL_VIEW_STATE}
      onLoad={handleMapLoad}
      onMove={(e) => {
        isInteracting.current = true;
        onMove(e);
      }}
      onMoveEnd={(e) => {
        isInteracting.current = false;
        onMoveEnd(e);
      }}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={currentMapStyle}
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

export default memo(MapCore, (prevProps, nextProps) => {
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.selectedPOIId === nextProps.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Type Extraction Protocol: Se eliminaron las importaciones explícitas de eventos de mapbox 
 *    que causaban ts(2709). Ahora usamos 'Parameters<NonNullable<MapProps['evento']>>[0]' para 
 *    extraer el contrato exacto de TypeScript derivado de la instalación local.
 * 2. Purga de ANY: En 'handleMapLoad', 'e.target' se castea usando 'unknown as MapRef' y 
 *    'layer' se tipa como '{ id: string }'. En el easeTo, 't' se tipa como 'number'.
 *    Se resolvió el error ts(7006) y se blindó el componente para Vercel.
 */