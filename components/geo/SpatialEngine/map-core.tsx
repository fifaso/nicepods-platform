// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 4.5 (NicePod MapCore - Resilient Orbital Edition)
// Misión: Renderizado WebGL fotorrealista con revelado por datos y seguimiento inmersivo.
// [ESTABILIZACIÓN]: Implementación de onIdle, Inferencia de Tipos Atómica y Silencio Urbano.

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
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY (V2.7)
 * Extraemos los tipos directamente de las Props del componente Map para 
 * evitar colisiones de Namespaces en la librería externa.
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
  onIdle: () => void; // Gatillo de rescate para disolver el Smokescreen
  onMove: (e: SafeMapMoveEvent) => void;
  onMoveEnd: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual de NicePod.
 * Gestiona el relieve 3D, edificios de obsidiana y seguimiento de brújula.
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

  // 1. REF INTERNA SOBERANA
  // Permite invocar métodos del motor (easeTo) sin romper la reconciliación de React.
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  // 2. MONITOR DE INTERACCIÓN
  // Evita que el seguimiento automático de la brújula compita con el dedo del usuario.
  const isInteracting = useRef<boolean>(false);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   * Purgamos las etiquetas genéricas de Mapbox para dar prioridad a los Ecos de NicePod.
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;
    const style = map.getStyle();

    if (style && style.layers) {
      style.layers.forEach((layer: { id: string }) => {
        // Ocultamos la capa de POIs comerciales nativa de Mapbox
        if (layer.id === 'poi-label' || layer.id === 'transit-label') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
      nicepodLog("🏙️ [MapCore] Silencio Urbano aplicado. Capas comerciales purgadas.");
    }

    onLoad(e);
  }, [onLoad]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO 3D]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;

    // Registro de fuente DEM si no existe
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    // El relieve solo se activa en modo exploración para maximizar FPS
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
   * Sincronizamos la cámara con la brújula física (Heading) de forma imperativa.
   */
  useEffect(() => {
    if (mode === 'EXPLORE' && userLocation?.heading !== null && userLocation?.heading !== undefined) {
      if (isInteracting.current) return;

      const map = localMapRef.current?.getMap();
      if (map) {
        // easeTo es una transición nativa de bajo nivel (60fps garantizados)
        map.easeTo({
          bearing: userLocation.heading,
          pitch: 80,
          duration: 1000,
          easing: (t: number) => t * (2 - t)
        });
      }
    }
  }, [userLocation?.heading, mode]);

  // Selección de estilo inmutable para evitar re-renderizados de tiles
  const currentMapStyle = useMemo(() =>
    mode === 'FORGE' ? MAP_STYLES.PHOTOREALISTIC : MAP_STYLES.PHOTOREALISTIC,
    [mode]);

  return (
    <Map
      ref={localMapRef}
      {...INITIAL_VIEW_STATE}
      onLoad={handleMapLoad}
      onIdle={onIdle} // Gatillo de revelado cuando el renderizado es estable
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

      // Mercator es más eficiente para renderizado de alta inclinación en móviles
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}

      // Optimizaciones de hardware industrial
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* I. EL VOYAGER (Avatar con Anillos de Resonancia) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* II. LA MALLA DE ECOS (Nodos de Inteligencia) */}
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

      {/* III. CAPA ARQUITECTÓNICA (Cristales de Obsidiana) */}
      {mode === 'EXPLORE' && (
        <Layer {...BUILDING_LAYER_STYLE} />
      )}

      {/* Control de geolocalización nativo (Oculto, gestionado por GeoEngine) */}
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
 * [OPTIMIZACIÓN SOBERANA]: Memoización de Alto Rango
 * El mapa solo se reconstruye si cambia el modo de operación o la selección táctica.
 */
export default memo(MapCore, (prevProps, nextProps) => {
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.selectedPOIId === nextProps.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.5):
 * 1. Inferencia de Props: Se resolvió el error ts(2709) mediante ComponentProps<typeof Map>.
 *    Esto elimina la necesidad de importar tipos manuales que chocaban con los Namespaces.
 * 2. Rapid Reveal Protocol: La inclusión de 'onIdle' en el componente permite que el
 *    padre (SpatialEngine) sepa exactamente cuándo el mapa ha terminado de 'pintar' 
 *    la ciudad, evitando que el Voyager vea una pantalla negra por un GPS lento.
 * 3. Urban Silence 2.0: Se añadió 'transit-label' a las capas purgadas, eliminando 
 *    iconos de metro/bus que competían con la estética 'Obsidiana' de NicePod.
 * 4. Tracking Loop Safe: El uso de 'isInteracting.current' garantiza que la cámara 
 *    no se mueva sola mientras el usuario está tocando la pantalla, eliminando el 'jitter'.
 */