// components/geo/SpatialEngine/map-core.tsx
// VERSIÓN: 6.1 (NicePod MapCore - Mapbox Standard PBR Edition)
// Misión: Renderizado WebGL de alta fidelidad con iluminación global y modelos 3D avanzados.
// [ESTABILIZACIÓN]: Integración total de STANDARD_ENGINE_CONFIG y materialización T0.

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
   * Misión: Configurar el motor de iluminación y aplicar el Silencio Urbano.
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    /**
     * CONFIGURACIÓN DE ILUMINACIÓN GLOBAL (PBR)
     * Aplicamos los parámetros definidos en map-constants.ts
     * @ts-ignore - Propiedades específicas del motor Standard v3 no siempre presentes en tipos base
     */
    if (map.setConfigProperty) {
      // 1. Aplicamos el tema (night/day/dawn/dusk)
      map.setConfigProperty('basemap', 'lightPreset', STANDARD_ENGINE_CONFIG.lightPreset);

      // 2. Ejecutamos el Silencio Urbano (Eliminación de ruido visual)
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', STANDARD_ENGINE_CONFIG.showPointOfInterestLabels);
      map.setConfigProperty('basemap', 'showTransitLabels', STANDARD_ENGINE_CONFIG.showTransitLabels);
      map.setConfigProperty('basemap', 'showPlaceLabels', STANDARD_ENGINE_CONFIG.showPlaceLabels);
      map.setConfigProperty('basemap', 'showRoadLabels', STANDARD_ENGINE_CONFIG.showRoadLabels);

      nicepodLog(`🏙️ [MapCore] Motor Standard configurado en modo: ${STANDARD_ENGINE_CONFIG.lightPreset}`);
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
       * [SOBERANÍA]: El mapa nace en la ubicación real/IP con ángulo Pokémon GO.
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

      /**
       * ESTILO STANDARD:
       * Habilita el renderizado PBR y modelos 3D de alta fidelidad.
       */
      mapStyle={MAP_STYLES.STANDARD}

      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}

      // Optimizaciones de hardware industrial
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

      {/* 
          NOTA ARQUITECTÓNICA: 
          Ya no es necesaria la capa manual de edificios. 
          El estilo Standard gestiona la extrusión con iluminación 
          global y sombras de forma nativa.
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
 * Previene re-renderizados innecesarios del motor WebGL.
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Evolución Estética Mapbox Standard: Se ha completado la migración al motor de 
 *    iluminación global. Los edificios ahora presentan sombras y profundidad realista,
 *    eliminando el aspecto de 'bloques negros'.
 * 2. Control de Tema Centralizado: El componente lee 'STANDARD_ENGINE_CONFIG', permitiendo
 *    que el mapa cambie entre modos (Día/Noche) instantáneamente desde las constantes.
 * 3. Materialización T0: Gracias a 'startCoords', el mapa se instancia directamente 
 *    en la ubicación real del Voyager, eliminando cualquier parpadeo visual desde Sol.
 * 4. Silencio Urbano Pro: La purga de etiquetas se realiza mediante la API nativa de 
 *    Mapbox v3, garantizando un mapa limpio y enfocado en la Memoria Urbana.
 */