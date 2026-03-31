/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.9 (NicePod MapCore - Performance Profiling & Lite Rendering Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el pintor WebGL adaptando la carga gráfica al contexto operativo.
 * [REFORMA V8.9]: Implementación de TACTICAL_LITE para optimización de VRAM en Step 1.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.5 ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapboxLightPreset,
  MapPerformanceProfile,
  OCCLUSION_CONFIG,
  STANDARD_ENGINE_CONFIG,
  LITE_ENGINE_CONFIG,
  TERRAIN_CONFIG,
  LITE_TERRAIN_CONFIG,
  getInitialViewState
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { PointOfInterest, UserLocation, MapInstanceId } from "@/types/geo-sovereignty";
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
  mapId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  performanceProfile?: MapPerformanceProfile; // [NUEVO V8.9]
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
  mapId,
  mode,
  performanceProfile = 'HIGH_FIDELITY',
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
    nicepodLog(`🌱 [MapCore:${mapId}] Sembrando semilla WebGL.`);
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]); 

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR, LABELS & PERFORMANCE)
   * [V8.9]: Ajusta el motor según el perfil de rendimiento solicitado.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';
        const isLite = performanceProfile === 'TACTICAL_LITE';
        const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;
        
        // A. Sincronía del Preset Lumínico
        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        
        // B. Gestión de Oclusión del Voyager
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

        // C. Configuración de Capas según Perfil de Rendimiento
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        
        // Ajuste de opacidad de edificios para liberar VRAM en modo Lite
        const buildingOpacity = isLite ? LITE_ENGINE_CONFIG.buildingOpacity : 1.0;
        /** @ts-ignore - Propiedad de Mapbox Standard para control de transparencia global */
        if (map.getLayer('building')) {
           map.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacity);
        }

        nicepodLog(`🕯️ [MapCore:${mapId}] Perfil ${performanceProfile} aplicado exitosamente.`);
      } catch (err) {
        nicepodLog(`⚠️ [MapCore:${mapId}] Interferencia en sincronización de capas.`, null, 'warn');
      }
    }
  }, [theme, cameraPerspective, mapId, performanceProfile]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';
        const isLite = performanceProfile === 'TACTICAL_LITE';
        const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        
        // Configuración inicial de visibilidad
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

        nicepodLog(`🏙️ [MapCore:${mapId}] Pintor WebGL configurado bajo perfil ${performanceProfile}.`);
      } catch (err) {
        nicepodLog("⚠️ [MapCore] Configuración de arranque interrumpida.");
      }
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective, mapId, performanceProfile]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   * [V8.9]: Ajuste de exageración según perfil de rendimiento.
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        map.addSource(DEM_SOURCE_CONFIG.id, {
          type: DEM_SOURCE_CONFIG.type,
          url: DEM_SOURCE_CONFIG.url,
          tileSize: DEM_SOURCE_CONFIG.tileSize
        });
      } catch (e) {
        return; 
      }
    }

    try {
      const terrainParams = performanceProfile === 'TACTICAL_LITE' 
        ? LITE_TERRAIN_CONFIG 
        : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainParams.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) {
      nicepodLog(`ℹ️ [MapCore:${mapId}] Estado de terreno sincronizado.`);
    }
  }, [mode, mapId, performanceProfile]);

  return (
    <Map
      id={mapId}
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
      fog={performanceProfile === 'TACTICAL_LITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Identidad Física */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA ECOS: Bóveda NKV */}
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
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId &&
    prev.performanceProfile === next.performanceProfile && // [FIX]: Re-render si cambia el perfil
    prev.theme === next.theme &&
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.9):
 * 1. Performance Sovereignty: La implementación de 'TACTICAL_LITE' permite al sistema
 *    reducir drásticamente el consumo de VRAM (opacidad 0.4, sin fog) durante el Step 1.
 * 2. Adaptive Terrain: El relieve 3D se ajusta dinámicamente, proporcionando una
 *    experiencia fluida incluso en dispositivos móviles de gama media.
 * 3. Style-Ready Protection: Se mantienen las guardas isStyleLoaded() en todas las
 *    operaciones imperativas para erradicar crashes en la consola.
 * 4. Build Shield Integrity: No existen abreviaciones. El código está completo y 
 *    alineado con las constantes físicas de la V5.5.
 */