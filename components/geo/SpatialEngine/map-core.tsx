//components/geo/SpatialEngine/map-core.tsx
/**
 * NICEPOD V8.0 - MAP CORE (ADAPTIVE URBAN VISION EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado de alta fidelidad con Protocolo Anti-Oclusión.
 * [ESTABILIZACIÓN]: Implementación de 'puckOcclusion' y 'Transparency Shield'.
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
  OCCLUSION_CONFIG // Consumimos la nueva configuración de oclusión
  ,
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
   * Este efecto sincroniza el tema PBR y asegura que el escudo de 
   * visibilidad del Voyager esté siempre activo.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();
    /** @ts-ignore - Mapbox Standard API */
    if (map && map.setConfigProperty) {
      nicepodLog(`🕯️ [MapCore] Sincronizando presets: ${theme}`);
      map.setConfigProperty('basemap', 'lightPreset', theme);
      // Reforzamos la oclusión en cada cambio de estilo
      map.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
    }
  }, [theme]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial y Configuración de Capas
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    /** @ts-ignore - Mapbox Standard API */
    if (map.setConfigProperty) {
      // A. Aplicamos el preset lumínico (Night/Day)
      map.setConfigProperty('basemap', 'lightPreset', theme);

      // B. [PROTOCOLO ANTI-OCLUSIÓN V8.0]:
      // Permite que el Voyager sea visible a través de edificios (Efecto X-Ray)
      map.setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // C. [PROTOCOLO SILENCIO URBANO]: Purga de ruido visual comercial
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', STANDARD_ENGINE_CONFIG.showPointOfInterestLabels);
      map.setConfigProperty('basemap', 'showTransitLabels', STANDARD_ENGINE_CONFIG.showTransitLabels);
      map.setConfigProperty('basemap', 'showPlaceLabels', STANDARD_ENGINE_CONFIG.showPlaceLabels);
      map.setConfigProperty('basemap', 'showRoadLabels', STANDARD_ENGINE_CONFIG.showRoadLabels);

      nicepodLog(`🏙️ [MapCore] Pintor WebGL iniciado con Escudo de Oclusión activo.`);
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
      onStyleData={handleStyleData} // Aseguramos la conexión del terreno
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} // Incrementado de 82 para una vista de calle más cinematográfica
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 
          V. MATERIALIZACIÓN DEL VOYAGER 
          El marcador ahora flota en el slot 'top' del motor Standard.
      */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* VI. MATERIALIZACIÓN DE ECOS (BÓVEDA NKV) */}
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

      {/* Control de geolocalización nativo (oculto) para redundancia de brújula */}
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
 * [BUILD SHIELD]: Exportación optimizada con comparador de precisión.
 */
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
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Puck Occlusion: Se inyectó map.setConfigProperty('basemap', 'puckOcclusion', 'occluded').
 *    Esto garantiza que el usuario nunca sea bloqueado visualmente por edificios 3D.
 * 2. Visual Stacking: Los marcadores operan sobre la malla PBR con un z-index prioritario.
 * 3. Street Perspective: Se elevó el maxPitch a 85 grados, permitiendo la vista rasante
 *    necesaria para la inmersión profesional de calle.
 * 4. PBR Night Mode: Se optimizó el efecto de luz global para resaltar la volumetría
 *    de los edificios de obsidiana sin perder la nitidez de los marcadores.
 */