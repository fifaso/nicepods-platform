// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 5.0 (NicePod MapCore - Zero-Flicker & Dynamic Birth Edition)
// Misión: Renderizado WebGL fotorrealista con nacimiento en ubicación real del Voyager.
// [ESTABILIZACIÓN]: Implementación de initialViewState dinámico y Silent Urban Protocol.

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
 * Extraemos los contratos de eventos directamente para evitar colisiones.
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  /** startCoords: Ubicación de nacimiento (IP, Caché o GPS fresco). */
  startCoords: UserLocation;
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

  // 2. MEMORIA DE INTERACCIÓN HUMANA
  const isInteracting = useRef<boolean>(false);

  /**
   * 3. GENERACIÓN DE SEMILLA DINÁMICA
   * [MANDATO]: Este objeto se calcula solo UNA vez en el nacimiento del motor.
   * Al recibir 'startCoords' (que ya ha sido resuelta por el GeoEngine), 
   * garantizamos que el mapa no nazca en Sol si el usuario está en otro lugar.
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   * Purgamos etiquetas genéricas antes de revelar la malla.
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
      nicepodLog("🏙️ [MapCore] Silencio Urbano aplicado satisfactoriamente.");
    }
    
    onLoad(e);
  }, [onLoad]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE RELIEVE 3D]
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
   * Sincronización imperativa de la brújula (Bearing).
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
       * [SOBERANÍA WEBGL]: Usamos initialViewState dinámico.
       * Esto permite que el mapa nazca en la ubicación real sin ser un 
       * componente controlado, desbloqueando la interacción del Voyager.
       */
      initialViewState={initialMapState}
      onLoad={handleMapLoad}
      onIdle={onIdle} // Gatillo de revelado (Smokescreen Off)
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
      
      // Optimizaciones de hardware móvil
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* I. EL VOYAGER (Materialización con Z-Index 9999) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* II. LA MALLA DE ECOS (Capital Intelectual) */}
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

      {/* III. CAPA ARQUITECTÓNICA (Edificios de Obsidiana) */}
      {mode === 'EXPLORE' && (
        <Layer {...BUILDING_LAYER_STYLE} />
      )}

      {/* Geolocalizador nativo oculto para mantenimiento de telemetría de fondo */}
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
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords.latitude === next.startCoords.latitude &&
    prev.startCoords.longitude === next.startCoords.longitude
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Zero-Wait Materialization: El componente ahora utiliza 'startCoords' para 
 *    calcular su semilla de nacimiento. Esto garantiza que Mapbox cree la malla 
 *    3D directamente en la ubicación real del usuario, eliminando el error de Sol.
 * 2. Soberanía de Movimiento: Se mantiene el motor como componente no-controlado, 
 *    permitiendo que el Voyager interactúe (zoom/pan) sin que React lo bloquee.
 * 3. Pokémon GO Sync: Sincronía automática con brújula y edificios translúcidos.
 * 4. Rigor de Tipos: Satisface el contrato de Build Shield para despliegue industrial.
 */