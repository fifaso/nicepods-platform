// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 2.0 (NicePod MapCore - Imperative Bypass Edition)
// Misión: Renderizado WebGL inmune a Deadlocks mediante gestión imperativa de terreno.
// [ESTABILIZACIÓN]: Eliminación de la prop 'terrain' y componente 'Source' para aniquilar el error 'mapbox-dem'.

"use client";

import { forwardRef, memo, useCallback, useMemo } from "react";
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
 * INTERFAZ: MapCoreProps
 * Define las señales estrictas que el motor WebGL acepta.
 */
interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  onLoad: (e: any) => void;
  onMove: (e: any) => void;
  onMoveEnd: () => void;
  onMapClick: (e: any) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual de NicePod.
 * Utiliza un patrón imperativo para gestionar el terreno 3D, evitando que React
 * interfiera con el ciclo de vida de los recursos pesados de la GPU.
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

  /**
   * [PROTOCOLO DE INYECCIÓN IMPERATIVA]
   * Misión: Registrar la fuente DEM y activar el relieve 3D sin usar props reactivas.
   * Este método garantiza que Mapbox maneje el terreno internamente.
   */
  const handleStyleData = useCallback((e: any) => {
    const map = e.target;

    // 1. Verificamos si la fuente ya existe en el núcleo para evitar duplicados
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      nicepodLog("🏗️ [MapCore] Inyectando Fuente DEM Soberana.");
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    // 2. Activamos el terreno solo en modo EXPLORE para evitar conflictos en la Forja
    if (mode === 'EXPLORE') {
      map.setTerrain({
        source: DEM_SOURCE_CONFIG.id,
        exaggeration: TERRAIN_CONFIG.exaggeration
      });
    } else {
      map.setTerrain(null); // Desactivamos relieve para precisión Admin
    }
  }, [mode]);

  // Selección de estilo inmutable
  const currentMapStyle = useMemo(() =>
    mode === 'FORGE' ? MAP_STYLES.PHOTOREALISTIC : MAP_STYLES.PHOTOREALISTIC,
    [mode]);

  return (
    <Map
      ref={ref}
      {...INITIAL_VIEW_STATE}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onLoad={onLoad}
      onStyleData={handleStyleData} // [FIX]: Punto de inyección imperativa
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={currentMapStyle}

      // Proyección persistente: 'globe' solo es seguro si el terreno se maneja imperativamente.
      projection={{ name: "globe" }}
      fog={FOG_CONFIG as any}

      // Optimizaciones de hardware móvil industrial
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* 
          I. EL VOYAGER (Avatar de Resonancia) 
          Consumido directamente del GeoEngine global.
      */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* 
          II. LA MALLA DE ECOS (Nodos NKV) 
          Sincronía de marcadores flotantes con sombras 3D.
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
          III. CAPA ARQUITECTÓNICA (Obsidiana) 
          Renderizado condicional basado en la estabilidad de la cámara.
      */}
      {mode === 'EXPLORE' && (
        <Layer {...BUILDING_LAYER_STYLE} />
      )}

      {/* CONTROL DE GEOLOCALIZACIÓN NATIVO (BACKEND) */}
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
 * Bloqueamos cualquier re-renderizado que no sea un cambio de modo o selección.
 * Esto protege al motor WebGL de los micro-saltos de telemetría.
 */
export default memo(MapCore, (prevProps, nextProps) => {
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.selectedPOIId === nextProps.selectedPOIId &&
    prevProps.onLoad === nextProps.onLoad
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Aniquilación del Error de Fuente: Al eliminar la prop 'terrain' de la 
 *    declaración JSX y moverla a 'map.setTerrain' en el evento 'onStyleData',
 *    hemos puenteado la lógica de limpieza de React que causaba el crash.
 * 2. Soberanía Fotorrealista: El mapa ahora nace con el satélite como verdad 
 *    absoluta, inyectando el relieve de forma asíncrona y segura.
 * 3. Aislamiento de Red: El motor ya no intenta 're-montar' el Source en cada 
 *    pulso de GPS, reduciendo las peticiones canceladas en el inspector de red.
 */