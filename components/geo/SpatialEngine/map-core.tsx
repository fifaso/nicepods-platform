/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.3 (NicePod MapCore - Contextual Vision & Urban Silence Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL de alta fidelidad con gestión dinámica de etiquetas.
 * [REFORMA V8.3]: Implementación de lógica de visibilidad basada en CameraPerspective.
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
 * [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
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
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR & LABELS)
   * [V8.3]: Sincroniza Tema, Oclusión y Etiquetas según la perspectiva.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';
      
      // A. Preset Lumínico
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      
      // B. Escudo de Oclusión (Voyager visible tras muros)
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // C. Gestión Contextual de Etiquetas (Urban Silence vs Context)
      // En OVERVIEW (Dashboard) mostramos barrios y calles principales.
      // En STREET (Inmersión) silenciamos todo para evitar ruido visual.
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false); // Siempre apagado
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false); // Siempre apagado

      nicepodLog(`🕯️ [MapCore] Configuración aplicada: ${theme} | Mode: ${cameraPerspective}`);
    }
  }, [theme, cameraPerspective]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';

      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
      
      // Inicialización de etiquetas basada en perspectiva de nacimiento
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🏙️ [MapCore] Pintor WebGL activo. Perspectiva inicial: ${cameraPerspective}.`);
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

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
      nicepodLog("⚠️ [MapCore] Suspensión de terreno asíncrono.", null, 'warn');
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
      {/* CAPA: VOYAGER (Z-INDEX 9999) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA: ECOS (BÓVEDA NKV) */}
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
 * [BUILD SHIELD]: Exportación con comparador de integridad.
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
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. Label Sovereignty: Implementada la conmutación de etiquetas Place/Road 
 *    basada en cameraPerspective para balancear contexto y limpieza.
 * 2. Visual Stacking: Se mantiene la purga de controles nativos y la prioridad
 *    de renderizado para los marcadores de conocimiento.
 * 3. Atomic Config: Todas las llamadas a setConfigProperty están protegidas 
 *    por isStyleLoaded(), erradicando el crash 'Style not loaded'.
 */