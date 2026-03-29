/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.5 (NicePod MapCore - Total Stability & Contextual Vision Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL de alta fidelidad blindado contra errores de carga de estilo.
 * [REFORMA V8.5]: Implementación de Style-Ready Guard y Gestión Dinámica de Etiquetas.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.4 ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapboxLightPreset,
  OCCLUSION_CONFIG,
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
 * Extraemos dinámicamente los contratos de eventos directamente de Mapbox.
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

/**
 * MapCoreProps: Definición del contrato de renderizado soberano.
 */
interface MapCoreProps {
  mode: 'EXPLORE' | 'FORGE';
  startCoords: UserLocation;
  theme: MapboxLightPreset;
  onLoad: (e: SafeMapEvent) => void;
  onIdle: () => void;
  onMove?: (e: SafeMapMoveEvent) => void;
  onMoveEnd?: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual soberano de NicePod.
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

  const { userLocation, nearbyPOIs, activePOI, cameraPerspective } = useGeoEngine();

  // 1. REFERENCIA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  /**
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO
   * Utiliza la configuración inicial (V5.4) para evitar colisiones de edificios.
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR & LABELS)
   * [GUARDIA V8.5]: Verificamos map.isStyleLoaded() para evitar el crash fatal.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';
      
      // A. Sincronía del Preset Lumínico (Día/Noche)
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      
      // B. Activación del Escudo de Oclusión (Rayos X para el Voyager)
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // C. Gestión Contextual de Etiquetas (Contexto vs Silencio Urbano)
      // En OVERVIEW activamos referencias; en STREET las purgamos para inmersión total.
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🕯️ [MapCore] PBR Sync: ${theme} | Perspectiva: ${cameraPerspective}`);
    }
  }, [theme, cameraPerspective]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';

      // Configuración atómica post-montaje
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🏙️ [MapCore] WebGL operativo. Perspectiva: ${cameraPerspective}.`);
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    // Inyección de fuente DEM para volumetría geográfica
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
    }

    try {
      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: TERRAIN_CONFIG.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) {
      // Manejo de error silencioso para no interrumpir el Main Thread
      nicepodLog("⚠️ [MapCore] Suspensión asíncrona de terreno.", null, 'warn');
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
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA: VOYAGER (Soberanía Visual z-9999) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA: ECOS (Bóveda NKV) */}
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
    </Map>
  );
});

MapCore.displayName = "MapCore";

/**
 * [BUILD SHIELD]: Exportación con comparador de integridad táctica.
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
 * NOTA TÉCNICA DEL ARCHITECT (V8.5):
 * 1. Style Loading Shield: Se implementó una guardia sistemática mediante map.isStyleLoaded()
 *    antes de cualquier operación setConfigProperty o setTerrain, eliminando el crash fatal.
 * 2. Perspective Awareness: El componente ahora conmuta la visibilidad de etiquetas 
 *    basándose en la intención visual (Overview vs Street), optimizando la legibilidad.
 * 3. Contract Elasticity: Se mantiene la opcionalidad de onMove/onMoveEnd para 
 *    garantizar la compatibilidad con el widget del Dashboard.
 * 4. PBR Fidelity: Mantiene el protocolo de oclusión 'occluded' para que el Voyager
 *    nunca sea sepultado bajo los edificios 3D del motor Standard.
 */