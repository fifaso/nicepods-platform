// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 6.0 (NicePod MapCore - Mapbox Standard & PBR Lighting Edition)
// Misión: Renderizado WebGL de alta fidelidad con iluminación global y modelos 3D avanzados.
// [ESTABILIZACIÓN]: Migración a Mapbox Standard, Configuración de LightPreset 'night' y Zero-Flicker.

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
 * Extraemos dinámicamente los tipos para garantizar paridad con Mapbox GL JS v3.
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  /** startCoords: Ubicación de nacimiento resuelta por el GeoEngine (V22.0). */
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
 * Implementa el motor Mapbox Standard con iluminación PBR dinámica.
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
   * 3. GENERACIÓN DE SEMILLA DE NACIMIENTO
   * Misión: El motor WebGL nace físicamente en la ubicación real del Voyager.
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]:
   * Misión: Configurar el motor de iluminación y purgar el ruido urbano.
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    /**
     * CONFIGURACIÓN DE ILUMINACIÓN GLOBAL (PBR)
     * Cambiamos el preset a 'night' para obtener un aspecto premium industrial.
     * @ts-ignore - Propiedades específicas del motor Standard v3
     */
    if (map.setConfigProperty) {
      // Activa el modo nocturno con luces de ciudad y sombras ambientales
      map.setConfigProperty('basemap', 'lightPreset', 'night');

      // Implementa el 'Silencio Urbano' mediante la desactivación de etiquetas
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      map.setConfigProperty('basemap', 'showTransitLabels', false);
      map.setConfigProperty('basemap', 'showRoadLabels', true); // Mantenemos calles para orientación

      nicepodLog("🏙️ [MapCore] Motor Standard configurado: Modo Noche + Silencio Urbano.");
    }

    onLoad(e);
  }, [onLoad]);

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

  /**
   * [SEGUIMIENTO INMERSIVO POKÉMON GO]
   * Sincronización imperativa de la cámara con la brújula del Voyager.
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
       * [SOBERANÍA]: El mapa nace en la ubicación real/IP.
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

      /**
       * ESTILO STANDARD:
       * Es obligatorio usar este estilo para habilitar la iluminación PBR.
       */
      mapStyle={MAP_STYLES.STANDARD}

      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}

      // Rendimiento móvil industrial
      antialias={false}
      reuseMaps={true}
      maxPitch={82}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >

      {/* I. EL VOYAGER (Materialización Prioritaria) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* II. LA MALLA DE ECOS (Marcadores de Inteligencia) */}
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
          NOTA: Ya no incluimos la capa de extrusión manual. 
          Mapbox Standard renderiza los edificios automáticamente con 
          iluminación dinámica y sombras de alta fidelidad.
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

export default memo(MapCore, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords.latitude === next.startCoords.latitude &&
    prev.startCoords.longitude === next.startCoords.longitude
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Evolución Visual (Standard Style): Se ha migrado al motor PBR de Mapbox. Los 
 *    edificios ya no son planos; tienen aristas, sombras y reaccionan a la luz 
 *    nocturna, elevando la estética de NicePod a un nivel profesional.
 * 2. Protocolo de Luz 'Night': Se configuró el preset nocturno para armonizar con 
 *    la atmósfera Aurora de la plataforma, resaltando los 'Ecos' en el mapa.
 * 3. Silencio Urbano Integrado: El uso de 'setConfigProperty' permite ocultar 
 *    POI labels nativos de forma mucho más eficiente que el filtrado de capas manual.
 * 4. Interactividad Total: Al mantener 'initialViewState', el usuario tiene 
 *    soberanía absoluta sobre la cámara desde el frame 1.
 */