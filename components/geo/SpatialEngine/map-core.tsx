// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 1.0 (NicePod MapCore - Isolated WebGL Engine)
// Misión: Renderizado fotorrealista 3D puro con inmutabilidad de configuración.
// [ESTABILIZACIÓN]: Erradicación de colisiones WebGL mediante aislamiento de motor y constantes.

"use client";

import { forwardRef, memo, useMemo } from "react";
import Map, {
  GeolocateControl,
  Layer,
  MapRef,
  Source
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
import { PointOfInterest } from "@/types/geo-sovereignty";
import { MapMarkerCustom } from "../map-marker-custom";
import { UserLocationMarker } from "../user-location-marker";

/**
 * INTERFAZ: MapCoreProps
 * Define las señales que el motor WebGL escucha del orquestador.
 */
interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  onLoad: (e: any) => void;
  onMoveEnd: () => void;
  onMapClick: (e: any) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual WebGL de NicePod.
 * Utiliza 'forwardRef' para permitir el control imperativo de la cámara (vuelos).
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mode,
  onLoad,
  onMoveEnd,
  onMapClick,
  onMarkerClick,
  selectedPOIId
}, ref) => {

  const { userLocation, nearbyPOIs, activePOI } = useGeoEngine();

  // Determinamos el estilo según el modo operativo
  const currentMapStyle = useMemo(() =>
    mode === 'FORGE' ? MAP_STYLES.PHOTOREALISTIC : MAP_STYLES.DARK_IMMERSIVE,
    [mode]);

  return (
    <Map
      ref={ref}
      {...INITIAL_VIEW_STATE} // Nacimiento controlado (Madrid Z14.5)
      onMoveEnd={onMoveEnd}
      onLoad={onLoad}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={currentMapStyle}

      // [SOBERANÍA WEBGL]: Proyección e Inmutabilidad
      projection={{ name: "globe" }} // El globo es ahora seguro gracias a map-constants
      terrain={TERRAIN_CONFIG}
      fog={FOG_CONFIG as any}

      // Optimización de hardware móvil
      antialias={false}
      reuseMaps={true}
      maxPitch={85}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* 
          I. FUENTE DE ALTURA (DEM) 
          Alimentación síncrona para el relieve de la ciudad.
      */}
      <Source {...DEM_SOURCE_CONFIG} />

      {/* 
          II. EL VOYAGER (Avatar de Resonancia) 
          Representación física del usuario en la Malla.
      */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* 
          III. LOS ECOS URBANOS (Nodos NKV) 
          Renderizado optimizado de marcadores flotantes.
      */}
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

      {/* 
          IV. CAPA ARQUITECTÓNICA (Obsidiana) 
          Solo activa en modo EXPLORE para evitar ruidos durante la forja.
      */}
      {mode === 'EXPLORE' && (
        <Layer {...BUILDING_LAYER_STYLE} />
      )}

      {/* CONTROL DE GEOLOCALIZACIÓN (OCULTO) 
          Se mantiene para asegurar que el motor de Mapbox reciba los pulsos 
          nativos del sistema operativo, aunque usemos nuestro propio marcador.
      */}
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
 * [OPTIMIZACIÓN SOBERANA]: React.memo
 * Evita que el motor WebGL se repinte si los cambios son menores.
 * El mapa solo reacciona a cambios estructurales de modo o selección.
 */
export default memo(MapCore, (prevProps, nextProps) => {
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.selectedPOIId === nextProps.selectedPOIId &&
    prevProps.onLoad === nextProps.onLoad
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Estabilidad Total: Al usar 'Source' y 'Layer' dentro de un componente memoizado 
 *    que bebe de constantes externas, el error de 'mapbox-dem removal' desaparece.
 * 2. Rendimiento 60FPS: La eliminación de lógica de búsqueda y HUD dentro de este 
 *    archivo libera al Hilo Principal del mapa de tareas de procesamiento de strings.
 * 3. Inyección de Horizonte: La cámara nace con el 'globe' activo pero espera 
 *    la orden de 'flyTo' del orquestador para mostrar el horizonte fotorrealista.
 */