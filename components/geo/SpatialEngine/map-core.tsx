// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 4.8 (NicePod MapCore - Sovereign Freedom & Inmersive Edition)
// Misión: Renderizado WebGL fotorrealista con autonomía de movimiento y seguimiento táctico.
// [ESTABILIZACIÓN]: Desbloqueo de interacción mediante initialViewState y Silent Tracking.

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
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
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
 * Implementa el protocolo de libertad de cámara para permitir la interacción del Voyager.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mode,
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

  // 2. MEMORIA DE INTERACCIÓN (Evita conflictos entre GPS y Usuario)
  const isInteracting = useRef<boolean>(false);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   * Misión: Dejar la Malla libre de POIs comerciales.
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;
    const style = map.getStyle();
    
    if (style && style.layers) {
      style.layers.forEach((layer: { id: string }) => {
        // Purgamos etiquetas de comercios y transporte
        if (layer.id.includes('poi-label') || layer.id.includes('transit-label')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
      nicepodLog("🏙️ [MapCore] Protocolo de Silencio Urbano completado.");
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
   * Sincronizamos la rotación de la ciudad con la brújula física del Voyager.
   */
  useEffect(() => {
    // Solo rastreamos si estamos en exploración y el usuario NO está tocando el mapa.
    if (mode === 'EXPLORE' && userLocation?.heading !== null && !isInteracting.current) {
      const map = localMapRef.current?.getMap();
      if (map) {
        map.easeTo({
          bearing: userLocation?.heading || 0,
          pitch: 80, 
          duration: 1200, // Suavizado cinemático
          easing: (t: number) => t * (2 - t) 
        });
      }
    }
  }, [userLocation?.heading, mode]);

  return (
    <Map
      ref={localMapRef}
      /**
       * [DECISIÓN ARQUITECTÓNICA CRÍTICA]: initialViewState
       * Al usar 'initialViewState' en lugar de props controladas (lat/lng), 
       * otorgamos al motor WebGL la soberanía sobre su propia cámara. 
       * Esto desbloquea la interacción táctil (zoom/pan) del usuario.
       */
      initialViewState={INITIAL_VIEW_STATE}
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
      
      // Optimizaciones de Proyección e Iluminación
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

      {/* Control oculto pero activo para sincronía de telemetría interna */}
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

/**
 * [OPTIMIZACIÓN SOBERANA]
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.8):
 * 1. Desbloqueo de Interacción: Se sustituyeron las props controladas por 
 *    'initialViewState'. Esto permite que el usuario interactúe libremente 
 *    con el mapa sin que React sobrescriba su posición cada milisegundo.
 * 2. Silent Tracking: La brújula se sincroniza imperativamente mediante 'easeTo', 
 *    proporcionando una experiencia inmersiva estilo Pokémon GO sin el coste 
 *    de CPU asociado a los re-renderizados de estado.
 * 3. Urban Silence 2.0: Se amplió la purga de capas para incluir tránsito y 
 *    etiquetas de POIs comerciales, garantizando una estética industrial pura.
 * 4. Zero-Any Policy: Se tiparon explícitamente los iteradores de capas para 
 *    cumplir con el Build Shield de producción.
 */